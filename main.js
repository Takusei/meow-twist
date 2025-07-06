import { app, globalShortcut, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import open from 'open';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log('Current directory:', __dirname);
let win;

app.whenReady().then(() => {
  console.log('App is ready, creating window...');
  console.log('Preload script path:', path.join(__dirname, 'preload.js'));

  win = new BrowserWindow({
    center: true,
    width: 6000,
    height: 600,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,   // REQUIRED for contextBridge to work
      nodeIntegration: false,   // Disable Node.js integration for security
      enableRemoteModule: false // Optional but recommended
    }
  });

  win.loadFile('index.html');
  win.hide();
  win.webContents.openDevTools();

  globalShortcut.register('Alt+Space', () => {
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
      win.focus();
    }
  });

  ipcMain.on('search', async (_, query) => {
    console.log('Search received in main:', query);
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    await open(url);
    win.hide();
  });

  ipcMain.on('hide-window', () => {
  if (win) {
    win.hide();
  }
});

});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
