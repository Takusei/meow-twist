const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  search: (query) => ipcRenderer.send('search', query),
  hideWindow: () => ipcRenderer.send('hide-window'),
  resizeWindow: (height) => ipcRenderer.send('resize-window', height),
  onReset: (callback) => ipcRenderer.on('reset', callback),
  getCommands: async () => await ipcRenderer.invoke('get-plugins'),
});