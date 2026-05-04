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
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { resolve([]); }
      });
    });
  });
}

async function run() {
    const targetDate = '2026-04-30'; // Specifik dag vi ska kolla
    
    console.log(`Hämtar data för specifik dag: ${targetDate}...\n`);
    
    const bookings = await fetchFunbutler(targetDate); 
    
    let totalPersons = 0;
    
    if(Array.isArray(bookings)) {
        bookings.forEach(b => {
            if(!b.isCanceled) {
                totalPersons += b.persons;
                console.log(`- Bokning #${b.bookingNumber}: ${b.persons} pers | ${b.localStartTime}-${b.localEndTime} | Typ: ${b.packages[0] ? b.packages[0].name : 'Standard'} | Bokad: ${b.created.split('T')[0]}`);
            }
        });
    }
    
    console.log(`\nTotalt antal personer för ${targetDate}: ${totalPersons}`);
    console.log(`\nRaw Funbutler data dump för ${targetDate}:\n`, JSON.stringify(bookings, null, 2));
}
run();
