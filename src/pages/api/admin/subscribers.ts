import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

export const prerender = false;

const SUBSCRIBERS_PATH = path.join(process.cwd(), 'src/data/subscribers.json');

interface Subscriber {
  email: string;
  subscribedAt: string;
}

function getSubscribers(): Subscriber[] {
  if (!fs.existsSync(SUBSCRIBERS_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(SUBSCRIBERS_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

function saveSubscribers(subscribers: Subscriber[]) {
  fs.writeFileSync(SUBSCRIBERS_PATH, JSON.stringify(subscribers, null, 2));
}

export const GET: APIRoute = async () => {
  try {
    const subscribers = getSubscribers();
    return new Response(JSON.stringify(subscribers), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/admin/subscribers error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch subscribers' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const subscribers = getSubscribers();

    // Check for duplicates
    if (subscribers.some((s) => s.email === email)) {
      return new Response(
        JSON.stringify({ error: 'Email already subscribed' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } },
      );
    }

    subscribers.push({
      email,
      subscribedAt: new Date().toISOString(),
    });

    saveSubscribers(subscribers);

    return new Response(
      JSON.stringify({ success: true, email }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('POST /api/admin/subscribers error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to add subscriber' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
