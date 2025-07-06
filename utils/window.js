import path from 'path';
import { fileURLToPath } from 'url';
import { BrowserWindow } from 'electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const setUpWindow = () => {
  const win = new BrowserWindow({
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
  
  win.loadFile(path.join(__dirname, '..' ,'index.html'));
  return win;
}

export const openWindow = (win) => {
  if (win.isVisible()) {
    win.hide();
  } else {
    win.show();
    win.focus();
    win.webContents.send('reset');
  }
}

export const hideWindow = (win) => {
  if (win) win.hide();
}

export const resizeWindow = (win, newHeight) => {
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
}