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
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); // 2026-04-24 (Friday)
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    console.log(`Hämtar data för igår (Fredag ${yesterdayStr})...\n`);
    
    const yesterdayBookings = await fetchFunbutler(yesterdayStr); 
    
    let yesterdayP=0;
    let yesterdayNewBookings = 0;

    if(Array.isArray(yesterdayBookings)) yesterdayBookings.forEach(b => { 
        if(!b.isCanceled) {
            yesterdayP += b.persons; 
            if(b.created && b.created.startsWith(yesterdayStr)) yesterdayNewBookings++;
        }
    });
    
    console.log(`IGÅR Fredag (${yesterdayStr}): ${yesterdayP}/510 (${Math.round((yesterdayP/510)*100)}%) - Nya bokningar igår: ${yesterdayNewBookings} st`);
}
run();
