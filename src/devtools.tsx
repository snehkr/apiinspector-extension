chrome.devtools.panels.create(
  "APIInspector",
  "icons/icon48.png",
  "panel.html",
  (panel) => {
    console.log("Panel created", panel);
  }
);
