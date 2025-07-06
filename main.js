import { app, globalShortcut, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import open from 'open';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let win;

const pluginFilePath = path.join(__dirname, 'plugins.json');
let pluginMap = {};
// Load plugin config at startup
function loadPlugins() {
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
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
      win.focus();
      win.webContents.send('reset');  // 💡 send reset signal to renderer
    }
  });

  ipcMain.on('search', async (_, query) => {
    const [cmd, ...args] = query.trim().split(/\s+/);
    const argStr = args.join(' ');
    const template = pluginMap[cmd];

    const url = template
      ? template.replace('{{query}}', encodeURIComponent(argStr))
      : `https://www.google.com/search?q=${encodeURIComponent(query)}`;

    await open(url);
    win.hide();
  });

  ipcMain.on('hide-window', () => {
    if (win) win.hide();
  });

  ipcMain.on('resize-window', (_, newHeight) => {
    console.log(`Resizing window to height: ${newHeight}`);
    if (win) {
      const bounds = win.getBounds();
      if (bounds.height !== newHeight) {
        win.setBounds({
          x: bounds.x,
          y: bounds.y, // keep Y position fixed
          width: bounds.width,
          height: newHeight
        }, true);
      }
    }
  });


});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});