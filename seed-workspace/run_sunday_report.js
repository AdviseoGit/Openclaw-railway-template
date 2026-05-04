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
    console.log("Hämtar söndags-data från kalendern...\n");
    const wed = await fetchFunbutler('2026-04-22');
    const thu = await fetchFunbutler('2026-04-23');
    const fri = await fetchFunbutler('2026-04-24');
    
    let wedP=0, thuP=0, friP=0;
    if(Array.isArray(wed)) wed.forEach(b => { if(!b.isCanceled) wedP += b.persons; });
    if(Array.isArray(thu)) thu.forEach(b => { if(!b.isCanceled) thuP += b.persons; });
    if(Array.isArray(fri)) fri.forEach(b => { if(!b.isCanceled) friP += b.persons; });
    
    console.log(`V.17 Onsdag (22/4): ${wedP}/300 (${Math.round((wedP/300)*100)}%)`);
    console.log(`V.17 Torsdag (23/4): ${thuP}/300 (${Math.round((thuP/300)*100)}%)`);
    console.log(`V.17 Fredag (24/4): ${friP}/510 (${Math.round((friP/510)*100)}%)`);
}
run();
