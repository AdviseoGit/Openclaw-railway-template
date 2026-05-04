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
    console.log("Hämtar veckodata för 15-25 april...");
    
    const datesToFetch = [
        '2026-04-15', // Onsdag
        '2026-04-16', // Torsdag
        '2026-04-17', // Fredag
        '2026-04-18', // Lördag
        '2026-04-22', // Onsdag nästa vecka
        '2026-04-23', // Torsdag nästa vecka
        '2026-04-24', // Fredag nästa vecka
        '2026-04-25'  // Lördag nästa vecka
    ];

    const maxCapacity = {
        '2026-04-15': 300, '2026-04-16': 300, '2026-04-17': 510, '2026-04-18': 510,
        '2026-04-22': 300, '2026-04-23': 300, '2026-04-24': 510, '2026-04-25': 510
    };
    
    const results = {};
    for(let dateStr of datesToFetch) {
        const bookings = await fetchFunbutler(dateStr);
        let persons = 0;
        let newToday = 0;
        if(Array.isArray(bookings)) {
            bookings.forEach(b => {
                if(!b.isCanceled) {
                    persons += b.persons;
                    if(b.created && b.created.startsWith(dateStr)) newToday++;
                }
            });
        }
        results[dateStr] = { persons: persons, newToday: newToday, max: maxCapacity[dateStr] };
    }

    console.log("\n--- VECKO-RESULTAT (15-25 April) ---");
    console.log("Datum    | Total P. | % Bel. | Nya Bok. (den dagen)");
    console.log("--------------------------------------------------");

    for(let dateStr of datesToFetch) {
        const r = results[dateStr];
        const dateObj = new Date(dateStr);
        const dayName = ['Sön','Mån','Tis','Ons','Tor','Fre','Lör'][dateObj.getDay()];
        console.log(`${dateStr} (${dayName}) | ${String(r.persons).padStart(8)} | ${String(Math.round((r.persons/r.max)*100)).padStart(4)}% | ${String(r.newToday).padStart(17)}`);
    }
}
run();
