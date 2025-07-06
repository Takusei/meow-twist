
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pluginFilePath = path.join(__dirname, '..', 'plugins.json');

export const loadPlugins = () => {
  let pluginMap = {};
  try {
    const data = fs.readFileSync(pluginFilePath, 'utf-8');
    pluginMap = JSON.parse(data);
    console.log('Loaded plugins:', pluginMap);
  } catch (err) {
    console.error('Failed to load plugins.json:', err);
  }
  return pluginMap;
}