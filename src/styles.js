/**
 * Styles for the main document (popup window).
 * These will be injected into document.head by main.js.
 */
export const popupStyles = `
.liveserver_Window {
      position: fixed !important; 
      bottom: 0 !important; 
      left: 0 !important; 
      right:0 !important; 
      background-color: transparent !important;
      z-index: 90 !important; 
      overflow: auto !important; 
      transition: height 0.1s ease !important;
      border:none;
      outline:none;
  }

  .liveserver_Window, .liveserver_Window * {
      box-sizing: border-box;
  }

  .liveserver_Window legend {
      align-items:center; 
      background: #222; 
      display:flex; 
      align-items:center;
      justify-content:center;
      cursor:pointer; 
      user-select:none; 
      padding-top:0;
      border-radius:60% 60% 0 0;
      width:40px;
      margin-left:auto;
      margin-right:auto;
  }

  .liveserver_Window legend p{
      top:0;
      height:50%;
      font-weight:700;
      animation: flip 4s linear infinite;
  }

  #iframe, .iframe {
      right:0; 
      left:0; bottom:0; 
      border: 1px solid black; 
      height: 100%; 
      width: 100%; 
      box-shadow: 0px 0px 10px rgba(0.0.0.0.50);
  }

  #right_part {
   /*styles for title bars right part ( buttons ) */
     display:flex;
     gap: 5px;
     height: 80%;
     align-items:center;
     padding: 0 10px;
  }

  #right_part span {
      height: 80%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      aspect-ratio: 1/1;
      cursor: pointer;
      border-radius: 6px;
      background-color: #303938;
    }

  #minimizeButton {
  
  }

  #maximizeButton{
  
  }

  #closeButton {
  
  }

  /* "LIVE" floating button */
  #maximizeButton2 {
    height: 35px !important;
    width: 35px !important;
    position: absolute !important;
    left: 10px !important;
    bottom: 50% !important;
    z-index: 10000 !important;
    background:transparent;
  }
  
  /* Style for the draggable title bar */
  .liveserver_TitleBar {
      width: 100%; 
      height: 40px; 
      background: #222; 
      color: white; 
      font-size: 16px; 
      display: flex; 
      align-items: center; 
      justify-content: space-between; 
      cursor: ns-resize; 
      user-select: none; 
      touch-action: none;
  }
  
  .liveserver_MainScreen{
      bottom: 0; 
      top: 10px;
      flex-grow:-1;
      width: 100%;
      border:none;
  }

  #window_logo{
    width:10px;
    height:100%;
  }

  @keyframes spin {
     from {
        transform: rotate(0deg);
     }
     to {
        transform: rotate(360deg);
     }
  }

  @keyframes flip {
      0% {
         transform: rotate(0deg);
      }

      40% {
         transform: rotate(0deg);
      }
      50% {
         transform: rotate(180deg);
      }
      90% {
         transform: rotate(180deg);
      }
      100% {
         transform: rotate(360deg);
      }
  } 

  #maximizeButton2_logo {
      height:100%;
      width:100%;
      outline: none !important;
      border:none !important;
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

  #window_logo{
    height:100%; 
    width:10vw;
  }
`;
