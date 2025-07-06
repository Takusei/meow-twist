import path from 'path';
import { fileURLToPath } from 'url';
import { app, Tray, Menu } from 'electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const setUpTray = (win) => {
  const tray = new Tray(path.join(__dirname, '..' ,'assets', 'icon.png')); 
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
}
