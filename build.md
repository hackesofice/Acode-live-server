# Build & Development Guide

Quick guide to build and package the **Acode Live Server** plugin.

---

## Project Structure

```

liveserver/
├── src/
│   ├── LiveServer.js
│   ├── main.js
│   ├── server.js
│   ├── styles.js
│   ├── ui.js
│   └── utils.js
├── build.js
├── icon.png
├── package.json
├── plugin.json
└── readme.md

````

---

## ⚙ Build Instructions

1. Install dependencies:
   ```bash
   npm install
    ```

2. Run build (webpack or custom builder):

   ```bash
   npm run build
   ```

   To enable auto-build (watch mode):

   ```bash
   npm run watch
   ```

3. The output will be:

   * `dist/main.js`
   * `dist.zip` → Install inside **Acode → Plugins → Install from ZIP**
   
---

**Maintainer:** [Sou6900](https://github.com/Sou6900)
**Forked from:** [hackesofice/Acode-live-server](https://github.com/hackesofice/Acode-live-server)
