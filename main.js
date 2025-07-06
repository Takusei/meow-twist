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
    const q = encodeURIComponent(args.join(' '));

    const routes = {
      yt: `https://www.youtube.com/results?search_query=${q}`,
      gh: `https://github.com/search?q=${q}`,
      g: `https://www.google.com/search?q=${q}`,
      wiki: `https://en.wikipedia.org/wiki/${q}`,
      default: `https://www.google.com/search?q=${encodeURIComponent(query)}`
    };

    const url = routes[cmd] || routes.default;
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