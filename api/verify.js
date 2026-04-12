import { Redis } from '@upstash/redis';

const kv = new Redis({
  url: process.env.UPSTASH_REDIS_KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_KV_REST_API_TOKEN,
});

const KV_KEY = 'kubs_drop_data';
const DEFAULT_PASSWORD = process.env.DROP_PASSWORD || 'changeme';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const { password, type } = req.body;

  if (type === 'admin') {
    return res.json({ success: password === ADMIN_PASSWORD });
  }

  // Default: verify drop access password
  const data = await kv.get(KV_KEY);
  const storedPass = data?.password || DEFAULT_PASSWORD;

  return res.json({ success: password === storedPass });
}
