import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const SETTINGS_PATH = path.join(DATA_DIR, 'settings.json');

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  lineUrl: string;
  ga4Id: string;
  ogpDefaultImage: string;
  categories: { id: string; name: string; order: number }[];
  defaultCtaTemplate: string;
}

export function getSettings(): SiteSettings {
  if (!fs.existsSync(SETTINGS_PATH)) {
    return {
      siteName: '',
      siteDescription: '',
      lineUrl: '',
      ga4Id: '',
      ogpDefaultImage: '',
      categories: [],
      defaultCtaTemplate: '',
    };
  }
  return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
}

export function saveSettings(settings: SiteSettings) {
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
}
