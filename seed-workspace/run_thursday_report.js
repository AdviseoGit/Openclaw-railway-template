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
    console.log(`Hämtar data för Torsdag (Idag: ${today})...\n`);
    
    const todayBookings = await fetchFunbutler(today); // For current Thursday
    const friBookings = await fetchFunbutler('2026-04-24');
    const satBookings = await fetchFunbutler('2026-04-25');
    
    let todayP=0, friP=0, satP=0;
    
    const countNewToday = (bookings) => {
        let n = 0;
        if(Array.isArray(bookings)) {
            bookings.forEach(b => {
                if(!b.isCanceled && b.created && b.created.startsWith(today)) n++;
            });
        }
        return n;
    };

    if(Array.isArray(todayBookings)) todayBookings.forEach(b => { if(!b.isCanceled) todayP += b.persons; });
    if(Array.isArray(friBookings)) friBookings.forEach(b => { if(!b.isCanceled) friP += b.persons; });
    if(Array.isArray(satBookings)) satBookings.forEach(b => { if(!b.isCanceled) satP += b.persons; });
    
    console.log(`IDAG Torsdag (23/4): ${todayP}/300 (${Math.round((todayP/300)*100)}%) - Nya bokningar idag: ${countNewToday(todayBookings)} st`);
    console.log(`Fredag (24/4): ${friP}/510 (${Math.round((friP/510)*100)}%) - Nya bokningar idag: ${countNewToday(friBookings)} st`);
    console.log(`Lördag (25/4): ${satP}/510 (${Math.round((satP/510)*100)}%) - Nya bokningar idag: ${countNewToday(satBookings)} st`);
}
run();
