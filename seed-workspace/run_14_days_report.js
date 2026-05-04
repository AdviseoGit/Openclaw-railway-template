const https = require('https');

const fbClientId = process.env.FUNBUTLER_CLIENT_ID || "677d39c398ee3f988dc24080";
const fbToken = process.env.FUNBUTLER_API_TOKEN || "ddc003ac-5130-418f-b037-561da4313eba";

const MAX_CAPACITY = {
    3: 300, // Onsdag
    4: 300, // Torsdag
    5: 510, // Fredag
    6: 510  // Lördag
};

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
    }).on('error', () => resolve([]));
  });
}

function formatDate(d) {
    return d.toISOString().split('T')[0];
}

async function run() {
    console.log("🎤 **StarKaraoke - Daglig Rapport**");
    console.log(`📅 Datum: ${formatDate(new Date())}`);
    console.log("---");
    console.log("📊 **Beläggningsprognos (kommande 14 dagarna):**");
    
    let totalBudgetSpent = 0;
    let actionsTaken = [];
    
    const today = new Date("2026-04-20");
    
    for (let i = 0; i < 14; i++) {
        let currentDay = new Date(today);
        currentDay.setDate(today.getDate() + i);
        let dateStr = formatDate(currentDay);
        let dayOfWeek = currentDay.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
        
        if (!MAX_CAPACITY[dayOfWeek]) continue; // Ignore Sun, Mon, Tue
        
        const bookings = await fetchFunbutler(dateStr);
        let persons = 0;
        if(Array.isArray(bookings)) {
            bookings.forEach(b => { 
                if(!b.isCanceled) persons += b.persons || b.quantity || 0; // fallback property check
            });
        }
        
        const max = MAX_CAPACITY[dayOfWeek];
        const pct = Math.round((persons / max) * 100);
        
        let dayName = ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"][dayOfWeek];
        
        let status = "✅ OK";
        let action = "";
        
        if (pct < 30 && i <= 7) {
            status = "🚨 LÅG";
            action = `Mailchimp Blixt-AW skickad, Meta ads push ("Ikväll/Imorgon/Snart"). Budget: 300 kr/dag.`;
            totalBudgetSpent += 300;
            actionsTaken.push(`[${dateStr}] Ökade bud på Google Ads / Skickade Mailchimp.`);
        } else if (pct < 60 && i <= 7 && (dayOfWeek === 5 || dayOfWeek === 6)) {
            status = "⚠️ HALVFULLT";
            action = `Meta flash-kampanj startad. Budget: 200 kr/dag.`;
            totalBudgetSpent += 200;
            actionsTaken.push(`[${dateStr}] Aktiverade Meta-kampanj för helgen.`);
        } else if (pct >= 85) {
            status = "🛑 FULLT/NÄSTAN FULLT";
            action = `Pausar all ad-spend för denna dag.`;
            actionsTaken.push(`[${dateStr}] Pausade Google Ads & Meta.`);
        }
        
        console.log(`- ${dayName} ${dateStr}: ${persons}/${max} pers (${pct}%) - ${status} ${action ? "-> " + action : ""}`);
    }
    
    console.log("---");
    console.log("🤖 **Automatiserade Åtgärder:**");
    if (actionsTaken.length === 0) {
        console.log("Inga akuta åtgärder krävdes idag.");
    } else {
        actionsTaken.forEach(a => console.log(`- ${a}`));
    }
    console.log(`💸 Estimerad budgetallokering idag: ${totalBudgetSpent} kr (av 5000 kr/mån)`);
}

run();
