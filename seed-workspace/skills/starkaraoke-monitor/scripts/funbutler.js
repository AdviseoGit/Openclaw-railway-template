const https = require('https');

const TOKEN = process.env.FUNBUTLER_API_TOKEN;
const CLIENT_ID = process.env.FUNBUTLER_CLIENT_ID;

function toStockholmDateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' });
}

function fetchDay(dateStr) {
  if (!TOKEN || !CLIENT_ID) throw new Error('Missing FUNBUTLER_API_TOKEN or FUNBUTLER_CLIENT_ID');
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'booking.funbutler.com',
      path: `/api/external/v1/clients/${CLIENT_ID}/bookings/by-day/${dateStr}`,
      headers: { 'Api-Token': TOKEN, 'Accept': 'application/json' }
    };
    https.get(options, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          return reject(new Error(`Funbutler ${dateStr}: HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Funbutler ${dateStr}: JSON parse failed: ${data.slice(0, 100)}`));
        }
      });
    }).on('error', reject);
  });
}

async function fetchRange(days = 14) {
  const results = [];
  for (let i = 0; i < days; i++) {
    const dateStr = toStockholmDateStr(i);
    const raw = await fetchDay(dateStr);
    const active = Array.isArray(raw) ? raw.filter(b => !b.isCanceled) : [];
    const persons = active.reduce((sum, b) => sum + (b.persons || 0), 0);
    results.push({ date: dateStr, persons, bookings: active.length });
  }
  return results;
}

module.exports = { fetchDay, fetchRange, toStockholmDateStr };
