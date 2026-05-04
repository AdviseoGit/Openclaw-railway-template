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
    const today = new Date().toISOString().split('T')[0]; // 2026-04-23
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0]; // 2026-04-24 (Friday)
    
    console.log(`Hämtar kvälls-data för Torsdag (Idag: ${today})...\n`);
    
    const todayBookings = await fetchFunbutler(today); 
    const tomorrowBookings = await fetchFunbutler(tomorrowStr);
    
    let todayP=0, tomorrowP=0;
    let todayNewBookings = 0;
    let tomorrowNewBookings = 0;

    if(Array.isArray(todayBookings)) todayBookings.forEach(b => { 
        if(!b.isCanceled) {
            todayP += b.persons; 
            if(b.created && b.created.startsWith(today)) todayNewBookings++;
        }
    });
    if(Array.isArray(tomorrowBookings)) tomorrowBookings.forEach(b => { 
        if(!b.isCanceled) {
            tomorrowP += b.persons; 
            if(b.created && b.created.startsWith(today)) tomorrowNewBookings++;
        }
    });
    
    console.log(`IDAG Torsdag (23/4): ${todayP}/300 (${Math.round((todayP/300)*100)}%) - Nya bokningar idag: ${todayNewBookings} st`);
    console.log(`Imorgon Fredag (24/4): ${tomorrowP}/510 (${Math.round((tomorrowP/510)*100)}%) - Nya bokningar idag: ${tomorrowNewBookings} st`);
}
run();
