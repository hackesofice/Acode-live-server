#!/usr/bin/env node
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const PROJECT_DIR = __dirname;
const API_URL = 'https://acode.app/api/plugin';

async function main() {
    // Authentication from CI secrets.
    const cookie = process.env.ACODE_COOKIE || process.env.ACODE_TOKEN;

    if (!cookie) {
        throw new Error('Missing ACODE_COOKIE or ACODE_TOKEN secret.');
    }

    // Automatically locate the plugin ZIP in the project root.
    const files = await fs.readdir(PROJECT_DIR);

    const zipFiles = files.filter(file =>
        /^liveserver.*\.zip$/i.test(file)
    );

    if (zipFiles.length === 0) {
        throw new Error('No liveserver*.zip found in the project directory.');
    }

    if (zipFiles.length > 1) {
        throw new Error(
            `Multiple plugin ZIPs found: ${zipFiles.join(', ')}. ` +
            'Keep only the ZIP you want to publish.'
        );
    }

    const zipName = zipFiles[0];
    const zipPath = path.join(PROJECT_DIR, zipName);

    // Find changelogs.md irrespective of filename casing.
    const changelogFile = files.find(
        file => file.toLowerCase() === 'changelogs.md'
    );

    if (!changelogFile) {
        throw new Error('changelogs.md not found in the project directory.');
    }

    const changelogPath = path.join(PROJECT_DIR, changelogFile);

    // Read the ZIP and changelog.
    const [zip, changelog] = await Promise.all([
        fs.readFile(zipPath),
        fs.readFile(changelogPath, 'utf8')
    ]);

    if (zip.length === 0) {
        throw new Error('Plugin ZIP is empty.');
    }

    if (!changelog.trim()) {
        throw new Error('changelogs.md is empty.');
    }

    // Create multipart form data.
    const form = new FormData();

    form.append(
        'plugin',
        new Blob([zip], { type: 'application/zip' }),
        zipName
    );

    form.append('changelogs', changelog);

    form.append(
        'supported_editor',
        process.env.ACODE_SUPPORTED_EDITOR || 'cm'
    );

    // Support a complete Cookie header or a token-only secret.
    const cookieHeader = cookie.includes('=')
        ? cookie
        : `token=${cookie}`;

    console.log(`Plugin: ${zipName}`);
    console.log(`Size: ${(zip.length / 1024).toFixed(2)} KB`);
    console.log(`Changelog: ${changelogFile}`);
    console.log('Uploading to Acode Marketplace...');

    // Upload to the Acode Marketplace.
    const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
            Cookie: cookieHeader,
            Accept: '*/*',
            Origin: 'https://acode.app',
            Referer:
                'https://acode.app/publish?mode=update&id=liveserver'
        },
        body: form,
        signal: AbortSignal.timeout(180000)
    });

    // Read and display the marketplace response.
    const responseText = await response.text();

    console.log(`HTTP Status: ${response.status}`);

    try {
        const result = JSON.parse(responseText);

        console.log('Marketplace Response:');
        console.log(JSON.stringify(result, null, 2));
    } catch {
        console.log(
            'Non-JSON response:',
            responseText.slice(0, 5000)
        );
    }

    if (!response.ok) {
        throw new Error(
            `Upload failed with HTTP ${response.status}.`
        );
    }

    console.log('Upload request completed successfully.');
    console.log('Check the marketplace for publication or review status.');
}

main().catch(error => {
    console.error('ERROR:', error.message);
    process.exitCode = 1;
});
