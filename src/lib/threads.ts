// Threads Graph API client
// https://developers.facebook.com/docs/threads
// The access token is always sent via the Authorization header (never in the URL)
// so it cannot leak through request logs, and it is never included in errors.

const THREADS_API_BASE = 'https://graph.threads.net/v1.0';

export interface ThreadsCredentials {
  accessToken: string;
  userId: string;
}

export interface PublishResult {
  success: boolean;
  postId?: string;
  permalink?: string;
  error?: string;
}

export function getEnvCredentials(): ThreadsCredentials | null {
  const accessToken = import.meta.env.THREADS_ACCESS_TOKEN || process.env.THREADS_ACCESS_TOKEN || '';
  const userId = import.meta.env.THREADS_USER_ID || process.env.THREADS_USER_ID || '';
  if (!accessToken || !userId) return null;
  return { accessToken, userId };
}

async function threadsFetch(url: string, accessToken: string, method: 'GET' | 'POST' = 'GET'): Promise<any> {
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = json?.error?.message || `Threads API error (HTTP ${res.status})`;
    throw new Error(message);
  }
  return json;
}

// Container creation -> publish (2-step flow required by the Threads API)
async function createContainer(
  creds: ThreadsCredentials,
  params: Record<string, string>,
): Promise<string> {
  const query = new URLSearchParams(params);
  const json = await threadsFetch(
    `${THREADS_API_BASE}/${creds.userId}/threads?${query.toString()}`,
    creds.accessToken,
    'POST',
  );
  if (!json.id) throw new Error('No container id returned');
  return json.id;
}

async function waitForContainer(creds: ThreadsCredentials, containerId: string): Promise<void> {
  // Media containers (images) need a moment to process before publishing
  for (let i = 0; i < 10; i++) {
    const json = await threadsFetch(
      `${THREADS_API_BASE}/${containerId}?fields=status,error_message`,
      creds.accessToken,
    );
    if (json.status === 'FINISHED') return;
    if (json.status === 'ERROR') throw new Error(json.error_message || 'Container processing failed');
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error('Container processing timed out');
}

async function publishContainer(creds: ThreadsCredentials, containerId: string): Promise<string> {
  const query = new URLSearchParams({ creation_id: containerId });
  const json = await threadsFetch(
    `${THREADS_API_BASE}/${creds.userId}/threads_publish?${query.toString()}`,
    creds.accessToken,
    'POST',
  );
  if (!json.id) throw new Error('No post id returned from publish');
  return json.id;
}

async function getPermalink(creds: ThreadsCredentials, postId: string): Promise<string | undefined> {
  try {
    const json = await threadsFetch(`${THREADS_API_BASE}/${postId}?fields=permalink`, creds.accessToken);
    return json.permalink;
  } catch {
    return undefined;
  }
}

export async function publishPost(
  creds: ThreadsCredentials,
  text: string,
  imageUrl?: string,
): Promise<PublishResult> {
  try {
    let containerId: string;
    if (imageUrl) {
      containerId = await createContainer(creds, {
        media_type: 'IMAGE',
        image_url: imageUrl,
        text,
      });
      await waitForContainer(creds, containerId);
    } else {
      containerId = await createContainer(creds, { media_type: 'TEXT', text });
    }
    const postId = await publishContainer(creds, containerId);
    const permalink = await getPermalink(creds, postId);
    return { success: true, postId, permalink };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Unknown error' };
  }
}

// Long-lived tokens are valid for 60 days and can be refreshed after 24h
export async function refreshLongLivedToken(accessToken: string): Promise<{ token: string; expiresIn: number } | null> {
  try {
    const json = await threadsFetch(
      'https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token',
      accessToken,
    );
    if (!json.access_token) return null;
    return { token: json.access_token, expiresIn: json.expires_in || 0 };
  } catch {
    return null;
  }
}

export async function verifyCredentials(creds: ThreadsCredentials): Promise<{ ok: boolean; username?: string; error?: string }> {
  try {
    const json = await threadsFetch(`${THREADS_API_BASE}/${creds.userId}?fields=username`, creds.accessToken);
    return { ok: true, username: json.username };
  } catch (e: any) {
    return { ok: false, error: e?.message };
  }
}
