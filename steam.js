import { cachedFetch } from '../../utils/apiClient';

export default async function handler(req, res) {
  const { appid, cc = 'us', l = 'english' } = req.query;
  if (!appid) return res.status(400).json({ error: 'appid is required' });

  try {
    const url = `https://store.steampowered.com/api/appdetails?appids=${encodeURIComponent(appid)}&cc=${encodeURIComponent(cc)}&l=${encodeURIComponent(l)}`;
    const data = await cachedFetch(url, 5 * 60 * 1000);
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(data[String(appid)] || data[appid] || data);
  } catch (error) {
    return res.status(500).json({ error: 'Unable to fetch Steam store data' });
  }
}
