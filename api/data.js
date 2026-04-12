import { Redis } from '@upstash/redis';

const kv = new Redis({
  url: process.env.UPSTASH_REDIS_KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_KV_REST_API_TOKEN,
});

const KV_KEY = 'kubs_drop_data';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

const DEFAULT_DATA = {
  password: process.env.DROP_PASSWORD || 'changeme',
  dropName: 'DROP #1',
  dropDescription: 'Nowa kolekcja juz dostepna. Kazdy produkt w jednym egzemplarzu.',
  isOpen: true,
  products: [
    {
      id: '1',
      name: 'Nike Dunk Low Panda',
      price: 450,
      description: 'Klasyczne Dunki w kolorystyce panda. Stan idealny, noszone 2 razy. Oryginalne pudelko w zestawie.',
      size: '43',
      condition: '9/10',
      status: 'available',
      images: ['https://placehold.co/600x800/141414/525252?text=Nike+Dunk+1']
    },
    {
      id: '2',
      name: 'Supreme Box Logo Hoodie FW21',
      price: 1800,
      description: 'Kultowa bluza Supreme z haftowanym box logo. Kolor czarny, rozmiar L. Komplet z receiptem.',
      size: 'L',
      condition: '9.5/10',
      status: 'available',
      images: ['https://placehold.co/600x800/141414/525252?text=Supreme+1']
    }
  ]
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const data = await kv.get(KV_KEY) || DEFAULT_DATA;
    // Strip password from public response
    const { password, ...publicData } = data;
    return res.json(publicData);
  }

  if (req.method === 'POST') {
    const body = req.body;
    const adminPassword = body.adminPassword;
    delete body.adminPassword;

    if (adminPassword !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    // Preserve existing password if not provided in update
    const current = await kv.get(KV_KEY);
    if (!body.password && current?.password) {
      body.password = current.password;
    } else if (!body.password) {
      body.password = DEFAULT_DATA.password;
    }

    await kv.set(KV_KEY, body);
    return res.json({ success: true });
  }

  return res.status(405).json({ error: 'method not allowed' });
}
