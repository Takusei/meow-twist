import path from 'path';
import fs from 'fs';
import { app, globalShortcut, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import { openWindow, hideWindow, resizeWindow, setUpWindow } from './utils/window.js'; // Import the openWindow function
import { search } from './utils/search.js'; // Import the search function
import { setUpTray } from './utils/tray.js'; // Import the tray setup function

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pluginFilePath = path.join(__dirname, 'plugins.json');
let pluginMap = {};
// Load plugin config at startup
const loadPlugins = ()=> {
  try {
    const data = fs.readFileSync(pluginFilePath, 'utf-8');
    pluginMap = JSON.parse(data);
    console.log('Loaded plugins:', pluginMap);
  } catch (err) {
    console.error('Failed to load plugins.json:', err);
  }
}

app.whenReady().then(() => {
  loadPlugins(); // Load plugins at startup
  ipcMain.handle('get-plugins', () => Object.keys(pluginMap));
  
  const win = setUpWindow();
  // win.webContents.openDevTools();

  globalShortcut.register('Alt+Space', () => {
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