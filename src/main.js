import plugin from '../plugin.json';
import { isHTMLFile, resolvePath } from './utils.js';
import { getLivePortIfAvilable, checkServer, start_in_app_server } from './server.js';
import { showWindow, createSideButton, showDefaultWindow, initUi } from './ui.js';
// import './styles.css' ;
import { popupStyles } from './styles.js';

const { editorManager, acode } = window;
const settings = acode.require('settings');


class AcodePlugin {
    constructor() {
        this.baseUrl = null;
        this.liveServerButton = null;
        this.oldSetting = settings.get('autosave');
        this.jsonData = {}; // Stores server config (path, fileName, port)
        
        // Bind methods to 'this'
        this.reloadFile = this.reloadFile.bind(this);
        this.onSwitchFile = this.onSwitchFile.bind(this); 
        this.openWindow = this.openWindow.bind(this);
        this.shutDownLiveServer = this.shutDownLiveServer.bind(this);
        this.handleTheBackend = this.handleTheBackend.bind(this);
    }

    /**
     * Initializes the plugin, sets up icons, buttons, and event listeners.
     */
    async init(baseUrl) {
        this.baseUrl = baseUrl;
        
        // --- ADD THIS SECTION to inject popup styles ---
        const styleEl = document.createElement('style');
        styleEl.id = 'live-server-popup-styles';
        styleEl.innerHTML = popupStyles;
        document.head.appendChild(styleEl);
        
        // addStyles();
        initUi(plugin.id); // Initialize the UI module

        acode.addIcon('liveserver', `${this.baseUrl}icon.png`);
        
        this.liveServerButton = createSideButton(this.openWindow);
        this.onSwitchFile(); // Run the full check once on init

        // Add event listeners
        editorManager.on('switch-file', this.onSwitchFile);
        
        // as long as the plugin is, not just when the window is open.
        editorManager.on('save-file', this.reloadFile);
        
        // addStyles();
        
    }

    /**
     * Handles the 'switch-file' event.
     * Shows/hides the side button and updates the server if the window is open.
     */
    onSwitchFile() {
        const isHtml = isHTMLFile();
        
        // 1. Show/hide the side button
        if (isHtml) {
            this.liveServerButton?.show();
        } else {
            this.liveServerButton?.hide();
        }

        // 2. Check if window is open
        const windowDiv = document.getElementById("live-server-window");
        
        // 3. If window is open and new file is HTML, update the backend
        if (windowDiv && windowDiv.style.display !== 'none' && isHtml) {
            const activeFile = editorManager.activeFile;
            if (activeFile) {
                // Call handleTheBackend to update the server
                this.handleTheBackend();
            }
        }
    }

    /**
     * Opens the resizable live server window and starts the backend check.
     */
    openWindow() {
        if (!document.getElementById("live-server-window")) {
            showWindow(this.shutDownLiveServer, this.oldSetting);
            // 'save-file' listener was moved to init()
            this.handleTheBackend();
        }
    }

    /**
     * Cleans up when the resizable window is closed.
     */
    shutDownLiveServer() {
        // This allows saving to still update the "Big Screen" tab
        // even if the popup window is closed.
        settings.update({ autosave: this.oldSetting });
    }

    /**
     * Reloads all active iframes with the latest content.
     * This is called on 'save-file'.
     */
    async reloadFile() {
        //  Only run the reload logic if an HTML file is active.
        if (!isHTMLFile()) {
            return;
        }

        /**
         * Wait a brief moment to prevent a race condition
         * (as implemented from the previous fix).
         */
        await new Promise(resolve => setTimeout(resolve, 150)); // 150ms delay

        // Now, ensure the backend is updated with the latest file content
        await this.handleTheBackend();
    }

    /**
     * Main logic to find the file path and connect to the server.
     * This is called on window open, 'switch-file', and 'save-file'.
     */
    async handleTheBackend() {
        const ActiveFile = editorManager.activeFile;
        if (!ActiveFile) return;

        const savedFilePath = ActiveFile.uri;
        const cacheFilePath = ActiveFile.cacheFile;
        const Active_file_id = ActiveFile.id;

        if (!savedFilePath && !cacheFilePath) {
            return;
        }

        if (cacheFilePath && !savedFilePath) {
            alert('Please save the file to use Live Server.');
            return;
        }

        const rawPath = savedFilePath;
        const fileName = rawPath.split('/').pop();
        const originalPath = resolvePath(rawPath);

        if (!originalPath) {
            alert('Could not resolve file path. Live Server might not work.');
            return;
        }
        
        this.jsonData.path = originalPath;
        this.jsonData.fileName = fileName;

        try {
            if (!this.jsonData.port) {
                this.jsonData.port = await getLivePortIfAvilable();
            }

            if (this.jsonData.port) {
                // This call sends the PATCH request to the server
                const serverOk = await checkServer(this.jsonData);
                
                if (serverOk) {
                    // Update UI from here, not from checkServer
                    const url = `http://localhost:${this.jsonData.port}/?t=${new Date().getTime()}`;
                    
                    // Update popup
                    let iframe = document.getElementById('iframe');
                    if (iframe) {
                        iframe.src = url;
                    }
                    
                    // Update page
                    let tab = editorManager.getFile(plugin.id, 'id');
                    if (tab) {
                        let pageIframe = tab.content.shadowRoot.querySelector(`#iframe22`);
                        if (pageIframe) {
                            pageIframe.src = url;
                        }
                    }
                } else {
                    delete this.jsonData.port;
                    showDefaultWindow(); // Show server offline
                }
            } else {
                // No server found
                showDefaultWindow();
                if (window.BuildInfo.versionCode >= 963) {
                    document.getElementById('closeButton')?.click();
                    await start_in_app_server(Active_file_id);
                    window.alert("Backend server is starting. Please run Live Server again.");
                }
            }
        } catch (error) {
            console.error("Error in handleTheBackend:", error);
            showDefaultWindow();
        }
    }

    /**
     * Cleans up all resources when the plugin is unmounted.
     */
    async destroy() {
        this.shutDownLiveServer(); // Restores autosave setting
        document.getElementById('live-server-window')?.remove();
        document.getElementById('maximizeButton')?.remove();
        this.liveServerButton?.hide();
        this.liveServerButton = undefined;
        
        editorManager.off('switch-file', this.onSwitchFile);
        
        // when the plugin is fully destroyed.
        editorManager.off('save-file', this.reloadFile);
        
        settings.update({ autosave: this.oldSetting });
        
        const bigScreen = editorManager.getFile(plugin.id, 'id');
        if (bigScreen) {
            bigScreen.remove(true);
        }
    }
}

// Plugin initialization logic
if (window.acode) {
    const acodePlugin = new AcodePlugin();
    acode.setPluginInit(plugin.id, async (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
        if (!baseUrl.endsWith('/')) {
            baseUrl += '/';
        }
        await acodePlugin.init(baseUrl);
    });
    acode.setPluginUnmount(plugin.id, () => {
        acodePlugin.destroy();
    });
}
