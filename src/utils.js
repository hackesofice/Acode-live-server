/**
 * Utility functions for the Live Server plugin.
 */

/**
 * Checks if the currently active file in the editor is an HTML file.
 * @returns {boolean} True if the active file is HTML, false otherwise.
 */
export function isHTMLFile() {
    const { editorManager } = window;
    if (
        editorManager &&
        editorManager.activeFile &&
        editorManager.activeFile.session &&
        editorManager.activeFile.session.$modeId
    ) {
        const ActiveFileType = editorManager.activeFile.session.$modeId;
        if (ActiveFileType) {
            return ActiveFileType === 'ace/mode/html';
        }
    }
    return false;
}

/**
 * Resolves the filesystem path from an Acode file URI.
 * Copied from the original main.js logic.
 * @param {string} rawPath - The file URI from Acode.
 * @returns {string|false} The resolved filesystem path or false if unresolved.
 */
export function resolvePath(rawPath) {
    if (rawPath.startsWith("content://com.termux.documents/tree")) {
        const path = rawPath.split("::")[1];
        const trimmed = path.substring(0, path.lastIndexOf("/"));
        return trimmed.replace(/^\/data\/data\/com\.termux\/files\/home/, "$HOME");
    }
    if (rawPath.startsWith("file:///storage/emulated/0/")) {
        const trimmed = rawPath.substr(26).replace(/\.[^/.]+$/, "");
        const directory = trimmed.split("/").slice(0, -1).join("/");
        return `/sdcard${directory}/`;
    }
    if (rawPath.startsWith("content://com.android.externalstorage.documents/tree/primary")) {
        const trimmed = rawPath.split("::primary:")[1];
        const directory = trimmed.substring(0, trimmed.lastIndexOf("/"));
        return `/sdcard/${directory}`;
    }
    if (rawPath.startsWith("file:///data/user/0/com.foxdebug.acode/files/alpine/home/")){
        const prefix = "file:///data/user/0/com.foxdebug.acode/files/alpine/home";
        const trimmed = rawPath.slice(prefix.length);
        const directory = trimmed.substring(0, trimmed.lastIndexOf("/"));
        return `..${directory}`;
    }
    return false;
}
