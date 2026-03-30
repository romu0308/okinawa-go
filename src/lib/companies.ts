import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'src/data');

export interface Company {
  id: string;
  name: string;
  industry: string;
  tags: string[];
  comment: string;
  agentLink: string;
  salaryRange: string;
  overtime: string;
  remote: string;
}

export function getCompanies(): Company[] {
  const filePath = path.join(DATA_DIR, 'companies.json');
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function getCompanyById(id: string): Company | undefined {
  return getCompanies().find((c) => c.id === id);
}

export function saveCompanies(companies: Company[]) {
  fs.writeFileSync(
    path.join(DATA_DIR, 'companies.json'),
    JSON.stringify(companies, null, 2),
  );
}

export function searchCompanies(query: string): Company[] {
  const q = query.toLowerCase();
  return getCompanies().filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.industry.toLowerCase().includes(q) ||
      c.comment.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q)),
  );
}
