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
    // content.appendChildb(styleEl);   <-- not need , using stylesheets
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

export function showWindow(onShutDown, oldSetting, baseUrl) {
    if (document.getElementById("live-server-window")) return;

    const settings = acode.require('settings');
    settings.update({ autosave: 1000 });

    if (!document.body) {
        console.error("document.body is not available!");
        return;
    }

    // --- CREATE WINDOW WRAPPER ---
    const windowDiv = document.createElement('fieldset');
    windowDiv.id = "live-server-window";
    windowDiv.className = "liveserver_Window";
    windowDiv.style.cssText = "height: 40vh !important; display:flex;";

    // --- UI STRUCTURE ---
    windowDiv.innerHTML = `
        <legend id='legend' style="">
              <p style="">&#8743</p>
        </legend>

        <div style="background-color:white; flex-grow:1; width:100%; display:flex; flex-direction:column;">
            <div class="liveserver_TitleBar" style="width:100%; padding:0px;">
                <div id="left_part" style="left:50px; width:70%; height:100%; display:flex; gap:10px; align-items:center;">
                  <img id ="window_logo" src= ${baseUrl + "icon.png"} style='height:80%; aspect-ratio:1/1; width:auto; border-radius:50%; animation: spin 2s linear infinite;' />
                  <input id="address_bar" value="thi is input" style="width:70%; height:80%; flex-grow:1; border-radius:20px; background-color: #23312e; box-shadow:none !important; outline:none !important; border:none !important; padding-left:7px;" />
                </div>
                <div id="right_part" style="">
                    <span id="minimizeButton">&#8212;</span>  <!-- — minimize -->
                    <span id="maximizeButton">&#9634;</span>  <!-- □ maximize -->
                    <span id="closeButton">&#10005;</span> <!-- ✕ close -->
                </div>
            </div>
            <div class="liveserver_MainScreen" style="flex-grow:1;">
                <iframe id="iframe" src="" class="iframe"></iframe>
            </div>
        </div>
    `;

    const iframe = windowDiv.querySelector('#iframe');
    const closeButton = windowDiv.querySelector('#closeButton');
    const minimizeButton = windowDiv.querySelector('#minimizeButton');
    const maximizeButton = windowDiv.querySelector('#maximizeButton');
    const titleBar = windowDiv.querySelector('.liveserver_TitleBar');
    const addressBar = windowDiv.querySelector("#address_bar");
    const window_logo = windowDiv.querySelector("#window_logo");
    const upDownSpans = windowDiv.querySelector('legend');

    // --- Event Logic ---
    minimizeButton.onclick = () => hideTheWindow(baseUrl);
    maximizeButton.onclick = () => {
        iframe.src ? addBigScreenPage(iframe.src, iframe) : window.toast('disabled! start server first');
    };

    window_logo.style.backgroundImage = `url('${baseUrl+"icon.png"}')`
  



  
// const iframe = document.getElementById('myFrame');
// const addressBar = document.getElementById('addressBar');
// // 
function bindToChild() {
  try {
    const win = iframe.contentWindow;

    const update = () => {
      addressBar.value = iframe.src;
    };

    // 1. Normal navigation
    iframe.addEventListener('load', update);

    // 2. SPA navigation - listen to child's window directly (no injection)
    // win.addEventListener('popstate', update);
    // win.addEventListener('hashchange', update);

    update(); // initial
  } catch (e) {
    console.error("Cross-origin - can't listen without injection");
  }
}

// Re-bind every time a new page loads inside iframe
iframe.addEventListener('load', bindToChild);
// bindToChild();





  
  // const iframe = document.getElementById('myIframe');

// const observer = new MutationObserver(() => {
//   console.log('src changed to:', iframe.src);
// });

// observer.observe(iframe, { attributes: true, attributeFilter: ['src'] });

// // Now when you do iframe.src = '...'
  
//     address_bar.value = iframe.src;
//     console.log("this is value")
//       console.log(iframe.src)
    // address_bar.style.cssText=`
    //    width:50%;
    // `
    // window_logo.style.cssText = `
    //     width:99px;
    //     height:99px;
    // `
  
  
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

    upDownSpans.addEventListener("mousedown", startResize);
    upDownSpans.addEventListener("touchstart", startResize);
    window.addEventListener("mousemove", performResize);
    window.addEventListener("touchmove", performResize);
    window.addEventListener("mouseup", stopResize);
    window.addEventListener("touchend", stopResize);

    // --- Close Button ---
    closeButton.onclick = () => {
        windowDiv.remove();
        upDownSpans.removeEventListener("mousedown", startResize);
        upDownSpans.removeEventListener("touchstart", startResize);
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
function hideTheWindow(baseUrl) {
    document.getElementById('live-server-window').style.display = 'none';
    let btn = document.getElementById('maximizeButton2');
    
    if (!btn) {
        let maximizeButton2 = document.createElement('div');
        maximizeButton2.id = 'maximizeButton2';
        maximizeButton2.onclick = showTheWindow;
        maximizeButton2.innerHTML = `<img id ="maximizeButton2_logo" src= ${baseUrl + "icon.png"} style='aspect-ratio:1/1; animation: spin 2s linear infinite; outline: none !important; border:none !important;' />
            `;
        // style.cssText removed
        document.body.appendChild(maximizeButton2);
    } else {
        btn.style.display = 'block';
    }
}

/**
 * Shows the hidden resizable window.
 */
function showTheWindow() {
    document.getElementById('live-server-window').style.display = 'flex';
    document.getElementById('maximizeButton2').style.display = 'none';
}

/**
 * Creates the side button for toggling the live server.
 * @param {function} onClick - The function to call when the button is clicked.
 * @returns {object} The created SideButton instance.
 */
export function createSideButton(onClick) {
  // console.log('createSideButton function is called')
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
                const miniRedLiveButton = document.getElementById('maximizeButton2');
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
