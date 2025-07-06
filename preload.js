import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  search: (query) => ipcRenderer.send('search', query),
  hideWindow: () => ipcRenderer.send('hide-window'),
});
