import { Redis } from '@upstash/redis';

const kv = new Redis({
  url: process.env.UPSTASH_REDIS_KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_KV_REST_API_TOKEN,
});

const KV_KEY = 'kubs_drop_data';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'missing product id' });

  const data = await kv.get(KV_KEY);
  if (!data) return res.status(404).json({ error: 'no data' });

  const product = data.products.find(p => p.id === id);
  if (!product) return res.status(404).json({ error: 'product not found' });

  if (product.status !== 'available') {
    return res.status(409).json({ error: 'not available', status: product.status });
  }

  product.status = 'reserved';
  await kv.set(KV_KEY, data);
  return res.json({ success: true, product });
}
