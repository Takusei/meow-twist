const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  search: (query) => ipcRenderer.send('search', query),
  hideWindow: () => ipcRenderer.send('hide-window'),
});