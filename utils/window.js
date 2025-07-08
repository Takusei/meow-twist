import path from 'path';
import { fileURLToPath } from 'url';
import { BrowserWindow, screen } from 'electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_HEIGHT = 60;
const WINDOW_WIDTH = 600;

export const setUpWindow = () => {
  const win = new BrowserWindow({
    center: true,
    width: WINDOW_WIDTH,
    height: BASE_HEIGHT,
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
  
  win.loadFile(path.join(__dirname, '..', 'assets', 'index.html'));
  return win;
}

export const openWindow = (win) => {
  if (win.isVisible()) {
    win.hide();
  } else {
    const mousePoint = screen.getCursorScreenPoint();
    const display = screen.getDisplayNearestPoint(mousePoint);
    const { x, y, width, height } = display.workArea;

    const centerX = x + Math.round((width - WINDOW_WIDTH) / 2);
    const centerY = y + Math.round((height - BASE_HEIGHT) / 2); // 🔧 use BASE_HEIGHT here

    win.setBounds({
      x: centerX,
      y: centerY,
      width: WINDOW_WIDTH,
      height: BASE_HEIGHT // 🔧 force consistent height
    });

    win.show();
    win.focus();
    win.webContents.send('reset'); // 🔄 resets input + suggestions
  }
}

export const hideWindow = (win) => {
  if (win) win.hide();
}

export const resizeWindow = (win, newHeight) => {
  if (win) {
    const [x, y] = win.getPosition();
    const [width] = win.getSize();
    win.setBounds({ x, y, width, height: newHeight });
  }
}