import { app, globalShortcut, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import open from 'open';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win;

app.whenReady().then(() => {
  win = new BrowserWindow({
    center: true,
    width: 600,
    height: 60,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  win.loadFile('index.html');
  win.hide();

  globalShortcut.register('Ctrl+Alt+S', () => {
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
