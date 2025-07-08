import path from 'path';
import { fileURLToPath } from 'url';
import { app, Tray, Menu } from 'electron';
import { openWindow } from './window.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const setUpTray = (win) => {
  const tray = new Tray(path.join(__dirname, '..' ,'assets', 'icon.png')); 
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Toggle Search (Ctrl+Space)',
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

  tray.setToolTip('Meow Twist');
  tray.setContextMenu(contextMenu);
}
