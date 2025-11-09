"use strict";

class LiveServer {
    /**
     * @param {string} pluginId - The ID of the plugin ("liveserver").
     */
    constructor(pluginId) {
        this.pluginId = pluginId;
        this.port = null;
        this.isServerOnline = false;
        this.jsonData = {}; // Centralized state for server communication
        this.oldSetting = null; // Stores user's original autosave setting
        this.liveServerButton = null;
        this.BigScreenContent = null; // Stores the HTML for the "Big Screen" tab
        this.bigScreen = null; // Stores the editorFile instance for the tab
        this.baseUrl = null;

        // Bind 'this' for methods used as event listeners or callbacks
        this.reloadFile = this.reloadFile.bind(this);
        this.openWindow = this.openWindow.bind(this);
        this.showOrHideIFhtml = this.showOrHideIFhtml.bind(this);
    }

    /**
     * Initializes the plugin, adds icons, creates UI elements, and attaches listeners.
     * @param {string} baseUrl - The base URL of the plugin.
     */
    async init(baseUrl) {
        this.baseUrl = baseUrl;
        const editorManager = window.editorManager;
        const SideButton = acode.require('sideButton');

        acode.addIcon('liveserver', `${this.baseUrl}icon.png`);

        // Create big screen content once on init
        this.BigScreenContent = createBigScreenContent();

        // Create the side button
        this.liveServerButton = SideButton({
            text: 'Live Server',
            icon: 'warningreport_problem',
            onclick: this.openWindow,
            backgroundColor: 'red',
            textColor: '#000',
        });

        this.showOrHideIFhtml();

        // Attach Acode event listeners
        editorManager.on('save-file', this.reloadFile);
        editorManager.on('switch-file', this.showOrHideIFhtml);
    }

    /**
     * Reloads all active iframes (window and tab) with the latest content.
     */
    reloadFile() {
        try {
            const newUrl = `http://localhost:${this.jsonData.port}/${this.jsonData.fileName}`;
            
            let iframe = document.getElementById('iframe');
            if (iframe) {
                iframe.src = newUrl;
            }
            
            if (this.bigScreen) {
                 const tabIframe = this.BigScreenContent.querySelector('#iframe22');
                 if(tabIframe) tabIframe.src = newUrl;
            }
        } catch (err) {
             console.log(`Live server reload error: ${err}`);
        }
    }

    /**
     * Opens the resizable window.
     */
    openWindow() {
        if (!document.getElementById("live-server-window")) {
            // Call createResizableWindow with 'this' as the LiveServer instance
            createResizableWindow.call(this);
        }
    }

    /**
     * Shows or hides the side button based on the active file type.
     */
    showOrHideIFhtml() {
        if (isHTMLFile()) {
            if (this.liveServerButton) this.liveServerButton.show();
        } else {
            if (this.liveServerButton) this.liveServerButton.hide();
        }
    }

    /**
     * Cleans up all UI elements, listeners, and settings when the plugin is unmounted.
     */
    async destroy() {
        const editorManager = window.editorManager;
        const settings = acode.require('settings');

        // Close the resizable window
        document.getElementById('closeButton')?.click();
        
        // Remove the floating "LIVE" button
        document.getElementById('maximizeButton')?.remove();

        if (this.liveServerButton) {
            this.liveServerButton.hide();
            this.liveServerButton = null;
        }

        // Remove event listeners
        editorManager.off('save-file', this.reloadFile);
        editorManager.off('switch-file', this.showOrHideIFhtml);

        // Restore original autosave setting
        if (settings && this.oldSetting !== null) {
            settings.update({ autosave: this.oldSetting });
        }

        // Close the "Big Screen" tab if it's open
        if (this.bigScreen) {
            this.bigScreen.remove(true);
            this.bigScreen = null;
        }
    }
}
