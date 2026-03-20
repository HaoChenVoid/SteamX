import { cachedFetch } from '../../utils/apiClient';

export default async function handler(req, res) {
  const { appid } = req.query;
  if (!appid) return res.status(400).json({ error: 'appid is required' });

  try {
    const url = `https://store.steampowered.com/appreviews/${encodeURIComponent(appid)}?json=1&language=all&purchase_type=all`;
    const data = await cachedFetch(url, 10 * 60 * 1000);
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Unable to fetch review data' });
  }
}
