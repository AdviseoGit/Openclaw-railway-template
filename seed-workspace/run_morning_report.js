const https = require('https');

const fbClientId = "677d39c398ee3f988dc24080";
const fbToken = "ddc003ac-5130-418f-b037-561da4313eba";

function fetchFunbutler(dateStr) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'booking.funbutler.com',
      path: `/api/external/v1/clients/${fbClientId}/bookings/by-day/${dateStr}`,
      headers: { 'Api-Token': fbToken }
    };
    https.get(options, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { resolve([]); }
      });
    });
  });
}

function getTodayString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

async function run() {
    const todayStr = getTodayString(); // 2026-04-18
    const nextWedStr = '2026-04-22';
    
    const todayBookings = await fetchFunbutler(todayStr);
    const wedBookings = await fetchFunbutler(nextWedStr);
    
    let todayPersons = 0;
    if(Array.isArray(todayBookings)) todayBookings.forEach(b => { if(!b.isCanceled) todayPersons += b.persons; });
    
    let wedPersons = 0;
    if(Array.isArray(wedBookings)) wedBookings.forEach(b => { if(!b.isCanceled) wedPersons += b.persons; });
    
    const todayPct = Math.round((todayPersons / 510) * 100);
    const wedPct = Math.round((wedPersons / 300) * 100);
    
    console.log(`Lördag ${todayStr}: ${todayPersons}/510 (${todayPct}%)`);
    console.log(`Onsdag ${nextWedStr}: ${wedPersons}/300 (${wedPct}%)`);
}
run();
