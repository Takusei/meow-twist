import open from 'open';
import { exec } from 'child_process';
import { hideWindow } from './window.js';

export const search = async (query, pluginMap, win) => {
  const [cmd, ...args] = query.trim().split(/\s+/);
  const q = args.join(' ');
  const plugin = pluginMap[cmd];

  if (!plugin) {
    // Fallback to Google
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    await open(url);
    hideWindow(win);
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
  hideWindow(win);
}