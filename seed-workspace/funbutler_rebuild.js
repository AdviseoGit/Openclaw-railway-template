const https = require('https');

const API_TOKEN = process.env.FUNBUTLER_API_TOKEN || 'ddc003ac-5130-418f-b037-561da4313eba';
const CLIENT_ID = process.env.FUNBUTLER_CLIENT_ID || '677d39c398ee3f988dc24080';
const HOSTNAME = 'booking.funbutler.com';

function fbRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOSTNAME,
      path: `/api/external/v1/clients/${CLIENT_ID}/${path}`,
      headers: {
        'Api-Token': API_TOKEN,
        'Accept': 'application/json'
      }
    };

    https.get(options, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          return reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSON parse failed: ${data.slice(0, 200)}`));
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const runId = Date.now();
  console.log(`\n=== Funbutler körning ${runId} (${new Date().toISOString()}) ===`);
  console.log(`Token: ${API_TOKEN.substring(0, 8)}... | Client: ${CLIENT_ID}`);

  const localDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Stockholm' }));

  for (let i = 0; i < 7; i++) {
    const d = new Date(localDate);
    d.setDate(localDate.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];

    try {
      const bookings = await fbRequest(`bookings/by-day/${dateStr}`);
      const active = bookings.filter(b => !b.isCanceled);
      const persons = active.reduce((sum, b) => sum + b.persons, 0);
      console.log(`${dateStr}: ${active.length} bokningar, ${persons} personer`);
      active.forEach(b => console.log(`  #${b.bookingNumber} ${b.customer.firstName} ${b.customer.lastName} ${b.persons}p ${b.localStartTime}-${b.localEndTime}`));
    } catch (err) {
      console.log(`${dateStr}: FEL - ${err.message}`);
    }
  }

  console.log(`=== Klar ===`);
}

run();
