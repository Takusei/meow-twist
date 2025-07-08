import { app, globalShortcut, ipcMain } from 'electron';
import { openWindow, hideWindow, resizeWindow, setUpWindow } from './utils/window.js';
import { search } from './utils/search.js'; 
import { setUpTray } from './utils/tray.js'; 
import { loadPlugins } from './utils/plugin.js'; 

app.whenReady().then(() => {
  const pluginMap = loadPlugins(); // Load plugins at startup
  ipcMain.handle('get-plugins', () => {
    return Object.entries(pluginMap).map(([command, plugin]) => ({
      command,
      description: plugin.description || '',
      icon: plugin.icon || '',
      url: plugin.url || '',
      exec: plugin.exec || ''
    }));
  });

  
  const win = setUpWindow();

  globalShortcut.register('Ctrl+Space', () => {
    openWindow(win);
  });

  ipcMain.on('search', async (_, query) => {
    search(query, pluginMap, win)
      .catch(err => {
        console.error('Search error:', err);
        win.webContents.send('search-error', 'An error occurred while searching.');
      });
  });

  ipcMain.on('hide-window', () => {
    hideWindow(win);
  });

  ipcMain.on('resize-window', (_, newHeight) => {
    resizeWindow(win, newHeight);
  });

  // Create a tray icon
  setUpTray(win);
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});