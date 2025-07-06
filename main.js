import { app, globalShortcut, BrowserWindow, ipcMain } from 'electron';
import { Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import open from 'open';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log('Current directory:', __dirname);
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
  win.hide();
  // win.webContents.openDevTools();

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

    const [cmd, ...args] = query.trim().split(/\s+/);
    const q = encodeURIComponent(args.join(' '));

    const routes = {
      yt: `https://www.youtube.com/results?search_query=${q}`,
      gh: `https://github.com/search?q=${q}`,
      g: `https://www.google.com/search?q=${q}`,
      wiki: `https://en.wikipedia.org/wiki/${q}`,
      // fallback if only one word
      default: `https://www.google.com/search?q=${encodeURIComponent(query)}`
    };

    const url = routes[cmd] || routes.default;
    await open(url);
    win.hide();
  });

  ipcMain.on('hide-window', () => {
  if (win) {
    win.hide();
  }
});

});

app.whenReady().then(() => {
  // Load icon (must be .ico or .png)
  const iconPath = path.join(__dirname, 'icon.png');
  const trayIcon = nativeImage.createFromPath(iconPath);
  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Search', click: () => win.show() },
    { label: 'Quit', click: () => app.quit() }
  ]);

  tray.setToolTip('Spotlight Launcher');
  tray.setContextMenu(contextMenu);
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
