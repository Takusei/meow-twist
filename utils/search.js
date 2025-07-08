import open from 'open';
import { exec } from 'child_process';
import { hideWindow } from './window.js';


/**
 * Searches for a query using the specified plugin or falls back to Google search.
 * @param {string} query - The search query.
 * @param {Object} pluginMap - A map of command names to plugin configurations, for example, [{command: 'gh', url: '', ...}, {command: 'code', exec: 'code', ...}].
 * @param {BrowserWindow} win - The Electron BrowserWindow instance.
 * @returns {Promise<void>}
 *//*
 */
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

  if (plugin.url) {
    const url = plugin.url.replace('{{query}}', encodeURIComponent(q));
    await open(url);
  } else if (plugin.exec) {
    const command = plugin.exec + (q ? ` ${q}` : '');
    exec(command, (error) => {
      if (error) {
        console.error(`Failed to execute: ${command}`, error);
      }
    });
  }

  hideWindow(win);
};