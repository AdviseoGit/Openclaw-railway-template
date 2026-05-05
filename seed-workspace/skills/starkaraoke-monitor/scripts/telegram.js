const https = require('https');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

function send(text) {
  if (!BOT_TOKEN || !CHAT_ID) {
    process.stderr.write('[telegram] TELEGRAM_BOT_TOKEN/CHAT_ID not set — skipping\n');
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const body = JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' });
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          process.stderr.write(`[telegram] HTTP ${res.statusCode}: ${data.slice(0, 200)}\n`);
        }
        resolve();
      });
    });
    req.on('error', err => {
      process.stderr.write(`[telegram] Error: ${err.message}\n`);
      resolve();
    });
    req.write(body);
    req.end();
  });
}

module.exports = { send };
