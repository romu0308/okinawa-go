import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'src/data');

export interface ClickLogEntry {
  affiliateId: string;
  timestamp: string;
  referrer: string;
  userAgent: string;
}

export interface Affiliate {
  id: string;
  serviceName: string;
  url: string;
  reward: number;
  clicks: number;
  conversions: number;
  clickLog: { timestamp: string; referrer: string; userAgent: string }[];
}

export function getAffiliates(): Affiliate[] {
  const filePath = path.join(DATA_DIR, 'affiliates.json');
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function getAffiliateById(id: string): Affiliate | undefined {
  return getAffiliates().find((a) => a.id === id);
}

export function saveAffiliates(affiliates: Affiliate[]) {
  fs.writeFileSync(
    path.join(DATA_DIR, 'affiliates.json'),
    JSON.stringify(affiliates, null, 2),
  );
}

export function logClick(
  affiliateId: string,
  referrer: string,
  userAgent: string,
) {
  const entry: ClickLogEntry = {
    affiliateId,
    timestamp: new Date().toISOString(),
    referrer,
    userAgent,
  };

  // Append to click-log.json
  const logPath = path.join(DATA_DIR, 'click-log.json');
  let log: ClickLogEntry[] = [];
  if (fs.existsSync(logPath)) {
    try {
      log = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
    } catch {
      log = [];
    }
  }
  log.push(entry);
  fs.writeFileSync(logPath, JSON.stringify(log, null, 2));

  // Increment clicks count in affiliates.json
  const affiliates = getAffiliates();
  const affiliate = affiliates.find((a) => a.id === affiliateId);
  if (affiliate) {
    affiliate.clicks += 1;
    affiliate.clickLog.push({
      timestamp: entry.timestamp,
      referrer,
      userAgent,
    });
    saveAffiliates(affiliates);
  }
}
