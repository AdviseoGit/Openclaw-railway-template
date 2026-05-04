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
      let data = ''; res.on('data', d => data += d);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve([]); } });
    });
  });
}

async function run() {
    const today = new Date().toISOString().split('T')[0]; // 2026-04-25
    
    console.log(`Hämtar kvälls-data för Lördag (Idag: ${today})...\n`);
    
    const todayBookings = await fetchFunbutler(today); 
    
    let todayP=0;
    let todayNewBookings = 0;

    if(Array.isArray(todayBookings)) todayBookings.forEach(b => { 
        if(!b.isCanceled) {
            todayP += b.persons; 
            if(b.created && b.created.startsWith(today)) todayNewBookings++;
        }
    });
    
    console.log(`IDAG Lördag (25/4): ${todayP}/510 (${Math.round((todayP/510)*100)}%) - Nya bokningar idag: ${todayNewBookings} st`);
}
run();
