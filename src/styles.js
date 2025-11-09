/**
 * Styles for the main document (popup window).
 * These will be injected into document.head by main.js.
 */
export const popupStyles = `
/*  #live-server-window {
    position: fixed !important; bottom: 0 !important; left: 0 !important; right:0 !important; width: 100% !important; max-width:100% !important; height: 40vh !important; background: white !important; border-top: 2px solid black !important; box-shadow: 0px -4px 10px rgba(0, 0, 0, 0.5) !important; z-index: 90 !important; overflow: hidden !important; transition: height 0.1s ease !important;
  }*/
  
.liveserver_Window {
  position: fixed !important; bottom: 0 !important; left: 0 !important; right:0 !important; width: 100% !important; max-width:100% !important; background: white !important; border-top: 2px solid black !important; box-shadow: 0px -4px 10px rgba(0, 0, 0, 0.5) !important; z-index: 90 !important; overflow: hidden !important; transition: height 0.1s ease !important;
  }
  
  .liveserver_TopBar {
  height: 6%; width:96%; margin-right:auto; margin-left:auto; margin-top:3px; margin-bottom:4px; background-color:gray; position:stiky; display:flex; flex-direction:row; justify-content:space-between; border-radius:10px; border:none; padding:0px 5px
  }

  #iframe, .iframe {
    right:0; left:0; bottom:0; border: 1px solid black; height: 100%; width: 100%; box-shadow: 0px 0px 10px rgba(0.0.0.0.50);
  }

  #closeButton {
    background: red;
    color: white;
    border: none;
    font-size: 24px;
    cursor: pointer;
    width: 35px;
    height: 35px;
    border-radius: 50%;
  }

  #maxFullScreen {
    margin-right: 10px;
  }

  /* "LIVE" floating button */
  #maximizeButton {
    height: 35px !important;
    width: 35px !important;
    border: 2px solid black !important;
    border-radius: 5px !important;
    position: absolute !important;
    left: 10px !important;
    bottom: 50% !important;
    z-index: 10000 !important;
    color: black;
    background-color: red !important;
  }
  
  /* Style for the draggable title bar */
  .liveserver_TitleBar{
    width: 100%; height: 40px; background: #222; color: white; font-size: 16px; display: flex; align-items: center; justify-content: space-between; padding: 0 10px; cursor: ns-resize; user-select: none; touch-action: none;
  }
  /* NEW: Style for the title text span */
  #live-server-title-text {
    font-size: 16px;
    pointer-events: none; /* Prevents text from interfering with drag */
  }
  
  /* NEW: Container for the buttons */
  .liveserver_ButtonContainer {
    display: flex;
    align-items: center;
    gap: 8px; /* Adds space BETWEEN buttons */
  }

  #minimizeButton {
    margin-right: 0; /* Moved from inline style */
  }
  
  .liveserver_MainScreen{
  bottom: 0; top: 10px; border: 1px solid black; height: 100%; width: 100%;
  }
  
  .liveserver_HrTag {
  border: 1px solid black; margin-top: 2px;
  }
`;

/**
 * Styles for the "Big Screen Page" (Shadow DOM).
 * These will be injected directly into the page's content div.
 */
export const pageStyles = `
  /* This is the root div returned by createBigScreenPage */
  .big-screen-content-root {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  nav {
    height: 6%; 
    width: 96%; 
    margin-right: auto; 
    margin-left: auto; 
    margin-top: 3px; 
    margin-bottom: 4px; 
    background-color: gray; 
    position: sticky; /* Corrected 'stiky' */
    top: 0;
    display: flex; 
    flex-direction: row; 
    justify-content: space-between; 
    border-radius: 10px; 
    border: none; 
    padding: 0px 5px;
    z-index: 10;
  }

  .liveserver_TitleContainer {
    margin-top: auto;
    margin-bottom: auto;
    margin-left: 5px;
  }
  
  .liveserver_TitleContainer p {
    font-size: 22px;
    font-weight: 700;
    margin: 0;
  }
  
  .liveserver_ToolsContainer {
    display: flex;
    flex-direction: row;
    column-gap: 10px;
    margin-top: auto;
    margin-bottom: auto;
    margin-right: 6px;
  }
  
  .liveserver_ToolsContainer p {
    font-weight: 500;
    cursor: pointer;
    margin: 0;
  }

  #iframe22, .iframe22 {
    flex-grow: 1;
    border: none;
  }
`;
