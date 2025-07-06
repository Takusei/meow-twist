import path from 'path';
import fs from 'fs';
import { app, globalShortcut, BrowserWindow, ipcMain, Tray, Menu } from 'electron';

import { fileURLToPath } from 'url';
import { openWindow, hideWindow, resizeWindow } from './utils/window.js'; // Import the openWindow function
import { search } from './utils/search.js'; // Import the search function

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let win;

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
  
  win = new BrowserWindow({
    center: true,
    width: 600,
    height: 60,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    backgroundColor: '#00000000',
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false
    }
  });

  win.loadFile('index.html');
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
  let tray;

  tray = new Tray(path.join(__dirname, 'assets', 'icon.png')); // use your icon path
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Toggle Search (Alt+Space)',
      click: () => {
        openWindow(win);
      }
    },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Win Search');
  tray.setContextMenu(contextMenu);
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});