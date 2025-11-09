/**
* Manages communication with the Live Server backend.
*/

/**
* Probes a specific port to see if the server is running.
* @param {number} port - The port to check.
* @param {number} timeout - Timeout in milliseconds.
* @param {object} [data={}] - Data to send with the request.
* @returns {Promise<any>} Resolves on success, rejects on failure or timeout.
*/
function check_this_port(port, timeout, data = {}) {
    return new Promise((resolve, reject) => {
        cordova.plugin.http.get(`http://localhost:${port}/check`, data, {}, (response) => {
            resolve(response);
        }, (error) => {
            reject(error);
        });
        setTimeout(() => { reject(new Error('Timeout')) }, timeout);
    });
}

/**
* Scans a list of ports to find the running Live Server.
* @param {number} [timeout=1000] - Timeout per port check.
* @returns {Promise<number|null>} The port number if found, or null.
*/
export async function getLivePortIfAvilable(timeout = 1000) {
    let portList = [
        1024, 1025, 1026, 1027, 1028, 1029,
        1030, 1031, 1032, 1033, 1034
    ];
    for (let port of portList) {
        try {
            await check_this_port(port, timeout);
            return port;
        } catch (err) {
            // Port not running or timed out
        }
    }
    return null;
}

/**
* Checks the server and sends setup data (file path).
* @param {object} jsonData - Data to send (path, fileName, port).
* @returns {Promise<boolean>} True on success, false on failure.
*/
export async function checkServer(jsonData) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds

    try {
        let response = await fetch(`http://localhost:${jsonData.port}/setup`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response || !response.ok) {
            return false;
        }
        
        // Server is OK, update iframes
        setTimeout(() => {
            let iframe = document.getElementById('iframe');
            if (iframe) {
                iframe.src = `http://localhost:${jsonData.port}/`;
            }
        }, 1000);
        
        return true;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            console.error('Fetch request timed out');
        } else {
            console.error('Live server not reachable:', error.message);
        }
        return false;
    }
}

/**
* Starts the backend server in Acode's inbuilt terminal.
* @param {string} activeFileId - The ID of the file to switch back to.
*/
export async function start_in_app_server(activeFileId) {
    const terminal = await acode.require('terminal');
    const server = await terminal.createServer();
    
    // Wait for terminal start up
    await new Promise((resolve) => {
        setTimeout(resolve, 1000)
    });

    let command = "if [ -d 'Acode-live-server-backend' ]; then\n";
    command += "  cd Acode-live-server-backend && python3 main.py\n";
    command += "else\n";
    command += "  apk update\n";
    command += "  apk upgrade\n";
    command += "  apk add git\n";
    command += "  apk add python3\n";
    command += "  apk add py3-pip\n";
    command += "  git clone https://github.com/hackesofice/Acode-live-server-backend.git\n";
    command += "  cd Acode-live-server-backend\n";
    command += "  apk add --no-cache py3-flask py3-requests py3-flask-cors py3-jinja2\n";
    command += "  python3 main.py\n";
    command += "fi\n";
    
    terminal.write(server.id, command);

    // Re-open the originally active file
    await new Promise((resolve) => { setTimeout(resolve, 4000) });
    window.editorManager.switchFile(activeFileId);
}
