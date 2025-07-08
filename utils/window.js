import path from 'path';
import { fileURLToPath } from 'url';
import { BrowserWindow, screen } from 'electron';

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

    const windowWidth = 600;
    const windowHeight = win.getBounds().height;

    const centerX = x + Math.round((width - windowWidth) / 2);
    const centerY = y + Math.round((height - windowHeight) / 2);

    win.setBounds({
      x: centerX,
      y: centerY,
      width: windowWidth,
      height: windowHeight
    });

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
    const [x, y] = win.getPosition();
    const [width] = win.getSize();
    win.setBounds({ x, y, width, height: newHeight });
  }
}