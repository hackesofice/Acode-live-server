/**
 * Manages all UI components for the Live Server plugin.
 */
import { pageStyles } from './styles.js';

const { editorManager } = window;
const editorFile = acode.require('editorFile');
const SideButton = acode.require('sideButton');

// Stores the HTML content for the "Big Screen" page
let BigScreenContent;
let pluginId;

/**
 * Creates the DOM structure for the "Big Screen" (separate tab) view.
 * @returns {HTMLElement} The container div for the big screen page.
 */

function createBigScreenPage() {
    let content = document.createElement('div');
    content.className = 'big-screen-content-root';

    // --- INJECT SHADOW DOM STYLES ---
    // const styleEl = document.createElement('style');
    // styleEl.innerHTML = pageStyles;
    // content.appendChild(styleEl);   <-- not need , using stylesheets
    // ---------------------------------

    content.innerHTML += `
        <nav>
            <span class="liveserver_TitleContainer">
                <p>Dev Tools</p>
            </span>
            <span class="liveserver_ToolsContainer">
                <p id="tool-console">Console</p>
                <p id="tool-share">Share</p>
                <p id="tool-open-browser">Open in Browser</p>
            </span>
        </nav>
        <iframe class="iframe22" id="iframe22"></iframe>
    `;

    // Attach tool button events
    content.querySelector('#tool-console').onclick = () => window.toast('coming soon');
    content.querySelector('#tool-share').onclick = () => window.toast('coming soon');
    content.querySelector('#tool-open-browser').onclick = () => window.toast('coming soon');

    return content;
}

/**
 * Opens the "Big Screen" page in a new editor tab.
 * @param {string} content_link - The URL to load in the iframe.
 * @param {HTMLElement} [resizable_screen] - The original iframe (optional).
 */
export function addBigScreenPage(content_link, resizable_screen) {
    if (editorManager.getFile(pluginId, 'id')) {
        return; // Page is already open
    }

    if (!BigScreenContent) {
        BigScreenContent = createBigScreenPage();
    }

    if (content_link) {
        BigScreenContent.querySelector('#iframe22').src = content_link;
    } else if (resizable_screen) {
        BigScreenContent.querySelector('#iframe22').innerHTML = resizable_screen.contentWindow.document.body.innerHTML;
    }

    new editorFile('Live Server', {
        type: 'page',
        render: true,
        content: BigScreenContent,
        stylesheets: pageStyles ,
        tabIcon: "icon liveserver",
        id: pluginId,
        hideQuickTools: true,
        uri: ' '
    });
}


/**
 * Creates the main resizable live server window.
 * @param {function} onShutDown - Callback when close button is clicked.
 * @param {string} [oldSetting] - The user's original autosave setting.
 */

export function showWindow(onShutDown, oldSetting) {
    if (document.getElementById("live-server-window")) return;

    const settings = acode.require('settings');
    settings.update({ autosave: 1000 });

    if (!document.body) {
        console.error("document.body is not available!");
        return;
    }

    // --- CREATE WINDOW WRAPPER ---
    const windowDiv = document.createElement('div');
    windowDiv.id = "live-server-window";
    windowDiv.className = "liveserver_Window";
    windowDiv.style.cssText = "height: 40vh !important;";

    // --- UI STRUCTURE ---
    windowDiv.innerHTML = `
        <div class="liveserver_TitleBar">Live Server Window
            <button id="minimizeButton" style="margin-right:0;">➖</button>
            <button id="closeButton">×</button>
            <button id="maxFullScreen" class="icon googlechrome" style="margin-right:10px;"></button>
        </div>
        <hr class="liveserver_HrTag">
        <div class="liveserver_MainScreen">
            <iframe id="iframe" class="iframe"></iframe>
        </div>
    `;

    const iframe = windowDiv.querySelector('#iframe');
    const closeButton = windowDiv.querySelector('#closeButton');
    const minimizeButton = windowDiv.querySelector('#minimizeButton');
    const maxFullScreen = windowDiv.querySelector('#maxFullScreen');
    const titleBar = windowDiv.querySelector('.liveserver_TitleBar');

    // --- Event Logic ---
    minimizeButton.onclick = hideTheWindow;
    maxFullScreen.onclick = () => {
        iframe.src ? addBigScreenPage(iframe.src, iframe) : window.toast('disabled! start server first');
    };

    // --- Resize Logic ---
    let isResizing = false, startY, startHeight;

    function startResize(event) {
        isResizing = true;
        const touch = event.touches ? event.touches[0] : event;
        startY = touch.clientY;
        startHeight = windowDiv.offsetHeight;
        document.body.style.userSelect = "none";
    }

    function performResize(event) {
        if (!isResizing) return;
        const touch = event.touches ? event.touches[0] : event;
        const newHeight = startHeight + (startY - touch.clientY);
        if (newHeight >= 100 && newHeight <= window.innerHeight * 0.9) {
            windowDiv.style.height = `${newHeight}px`;
        }
    }

    function stopResize() {
        isResizing = false;
        document.body.style.userSelect = "auto";
    }

    titleBar.addEventListener("mousedown", startResize);
    titleBar.addEventListener("touchstart", startResize);
    window.addEventListener("mousemove", performResize);
    window.addEventListener("touchmove", performResize);
    window.addEventListener("mouseup", stopResize);
    window.addEventListener("touchend", stopResize);

    // --- Close Button ---
    closeButton.onclick = () => {
        windowDiv.remove();
        titleBar.removeEventListener("mousedown", startResize);
        titleBar.removeEventListener("touchstart", startResize);
        window.removeEventListener("mousemove", performResize);
        window.removeEventListener("touchmove", performResize);
        window.removeEventListener("mouseup", stopResize);
        window.removeEventListener("touchend", stopResize);
        settings.update({ autosave: oldSetting });
        onShutDown();
    };

    // --- Add to DOM ---
    document.body.appendChild(windowDiv);
}


/**
 * Hides the resizable window and shows a "LIVE" button.
 */
function hideTheWindow() {
    document.getElementById('live-server-window').style.display = 'none';
    let btn = document.getElementById('maximizeButton');
    
    if (!btn) {
        let maximizeButton = document.createElement('button');
        maximizeButton.id = 'maximizeButton';
        maximizeButton.onclick = showTheWindow;
        maximizeButton.innerText = 'LIVE';
        // style.cssText removed
        document.body.appendChild(maximizeButton);
    } else {
        btn.style.display = 'block';
    }
}

/**
 * Shows the hidden resizable window.
 */
function showTheWindow() {
    document.getElementById('live-server-window').style.display = 'block';
    document.getElementById('maximizeButton').style.display = 'none';
}

/**
 * Creates the side button for toggling the live server.
 * @param {function} onClick - The function to call when the button is clicked.
 * @returns {object} The created SideButton instance.
 */
export function createSideButton(onClick) {
    return SideButton({
        text: 'Live Server',
        icon: 'warningreport_problem',
        onclick: onClick,
        backgroundColor: 'red',
        textColor: '#000',
    });
}

/**
 * Shows a default "server off" or documentation page in iframes.
 */
export function showDefaultWindow() {
    const iframes = document.querySelectorAll('iframe.iframe, iframe.iframe22');
    const default_content = `<body><h1>Server status = off</h1><h1>Phone Network status = ${navigator.onLine ? 'on' : 'off'}</h1></body>`;
    
    if (iframes.length > 0) {
        iframes.forEach(iframe => {
            try {
                if (navigator.onLine) {
                    iframe.src = 'https://acode-live-server-documentations.vercel.app/';
                } else {
                    iframe.contentWindow.document.body.innerHTML = default_content;
                }
            } catch (error) {
                console.error(`Error updating iframe: ${error}`);
            }
        });

        if (!navigator.onLine) {
            setTimeout(() => {
                const btn = document.getElementById('closeButton');
                const miniRedLiveButton = document.getElementById('maximizeButton');
                if (miniRedLiveButton) {
                    miniRedLiveButton.style.display = 'none';
                }
                btn?.click();
            }, 10000);
        }
    }
}

/**
 * Initializes the UI module.
 * @param {string} pId - The plugin's ID.
 */
export function initUi(pId) {
    pluginId = pId;
    BigScreenContent = createBigScreenPage();
}
