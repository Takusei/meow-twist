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