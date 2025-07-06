import { app, globalShortcut, BrowserWindow, ipcMain, Tray, Menu } from 'electron';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
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

const openWindow = (win) => {
  if (win.isVisible()) {
    win.hide();
  } else {
    win.show();
    win.focus();
    win.webContents.send('reset');  // 💡 send reset signal to renderer
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
    const [cmd, ...args] = query.trim().split(/\s+/);
    const q = args.join(' ');
    const plugin = pluginMap[cmd];

    if (!plugin) {
      // Fallback to Google
      const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      await open(url);
      win.hide();
      return;
    }

    if (typeof plugin === 'string') {
      // URL-based plugin
      const url = plugin.replace('{{query}}', encodeURIComponent(q));
      await open(url);
    } else if (plugin.exec) {
      // Local command plugin
      const command = plugin.exec + (q ? ` ${q}` : '');
      exec(command, (error) => {
        if (error) {
          console.error(`Failed to execute: ${command}`, error);
        }
      });
    }

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