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
    const today = new Date(); 
    const todayStr = today.toISOString().split('T')[0]; // 2026-04-28 (Tuesday)
    
    // Look at upcoming Wednesday, Thursday, Friday, Saturday
    const wed = new Date(today); wed.setDate(today.getDate() + (3 + 7 - today.getDay()) % 7);
    const thu = new Date(today); thu.setDate(today.getDate() + (4 + 7 - today.getDay()) % 7);
    const fri = new Date(today); fri.setDate(today.getDate() + (5 + 7 - today.getDay()) % 7);
    const sat = new Date(today); sat.setDate(today.getDate() + (6 + 7 - today.getDay()) % 7);

    const wedStr = wed.toISOString().split('T')[0];
    const thuStr = thu.toISOString().split('T')[0];
    const friStr = fri.toISOString().split('T')[0];
    const satStr = sat.toISOString().split('T')[0];
    
    console.log(`Hämtar tisdags-data från kalendern (Idag: ${todayStr})...\n`);
    
    const wedBookings = await fetchFunbutler(wedStr);
    const thuBookings = await fetchFunbutler(thuStr);
    const friBookings = await fetchFunbutler(friStr);
    const satBookings = await fetchFunbutler(satStr);
    
    let wedP=0, thuP=0, friP=0, satP=0;
    
    const countNewToday = (bookings) => {
        let n = 0;
        if(Array.isArray(bookings)) {
            bookings.forEach(b => {
                if(!b.isCanceled && b.created && b.created.startsWith(todayStr)) n++;
            });
        }
        return n;
    };

    if(Array.isArray(wedBookings)) wedBookings.forEach(b => { if(!b.isCanceled) wedP += b.persons; });
    if(Array.isArray(thuBookings)) thuBookings.forEach(b => { if(!b.isCanceled) thuP += b.persons; });
    if(Array.isArray(friBookings)) friBookings.forEach(b => { if(!b.isCanceled) friP += b.persons; });
    if(Array.isArray(satBookings)) satBookings.forEach(b => { if(!b.isCanceled) satP += b.persons; });
    
    console.log(`Onsdag (${wedStr}): ${wedP}/300 (${Math.round((wedP/300)*100)}%) - Nya bokningar idag: ${countNewToday(wedBookings)} st`);
    console.log(`Torsdag (${thuStr}): ${thuP}/300 (${Math.round((thuP/300)*100)}%) - Nya bokningar idag: ${countNewToday(thuBookings)} st`);
    console.log(`Fredag (${friStr}): ${friP}/510 (${Math.round((friP/510)*100)}%) - Nya bokningar idag: ${countNewToday(friBookings)} st`);
    console.log(`Lördag (${satStr}): ${satP}/510 (${Math.round((satP/510)*100)}%) - Nya bokningar idag: ${countNewToday(satBookings)} st`);
}
run();
