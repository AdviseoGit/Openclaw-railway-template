const https = require('https');
const querystring = require('querystring');
const token = process.env.META_ACCESS_TOKEN || "EAANhJi3yPAkBRUXltAviPc8ZCGdlXsRR2BOocSIzllS14VR2kQbrItZCnzzd0gFZCQORcQUIWXjM1ZBPTHqJrK35l7LCwZBYg6ZBd1ueDPAlrBqLuMfItWt6AsAeZCrS8FMhwR3So44jx7agALSWRXiPFMGa1ZCZBga6sEayce4R4ZA5pM2Wtx8iOZBvJhVJIaZCJ9jfAraX64htZAL2j5ddUHTaUH5I4I7cBJVK2LxibRz86DbXB7ZBBYFSYZAZBrYlA2ZAtIC1tAMgTlgFM7iZArMWZBLiNJVjBbb";
const adAccountId = "act_641605644293863";
const pageId = '358075078570216';

function metaRequest(path, payload) {
  return new Promise((resolve) => {
    const postData = querystring.stringify({ ...payload, access_token: token });
    const options = {
      hostname: 'graph.facebook.com', port: 443, path: `/v19.0/${adAccountId}/${path}`, method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(postData) }
    };
    const req = https.request(options, (res) => {
      let data = ''; res.on('data', d => data += d);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve(data); } });
    });
    req.write(postData); req.end();
  });
}

function metaUpdate(id, payload) {
    return new Promise((resolve) => {
      const postData = querystring.stringify({ ...payload, access_token: token });
      const options = {
        hostname: 'graph.facebook.com', port: 443, path: `/v19.0/${id}`, method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(postData) }
      };
      const req = https.request(options, (res) => {
        let data = ''; res.on('data', d => data += d);
        res.on('end', () => resolve(data));
      });
      req.write(postData); req.end();
    });
}

async function run() {
  const campaignId = '120241662572530318'; // "Blixtinsatser - StarKaraoke AI"

  // 1. Pausa gårdagens Meta-kampanj (om det var någon aktiv)
  // Vi letar efter AdSets under vår huvudkampanj som är aktiva och stänger av dem.
  try {
      const adsets = await metaRequest(`campaigns/${campaignId}/adsets?fields=id,name,status&status=ACTIVE`, {});
      if(adsets.data && adsets.data.length > 0) {
          for(let adset of adsets.data) {
              await metaUpdate(adset.id, { status: 'PAUSED' });
              console.log(`Pausade aktivt AdSet: ${adset.name}`);
          }
      }
  } catch(e) { console.error("Fel vid pausning av gamla AdSets", e); }

  // 2. Skapa Proaktiv Helg-Push (Målgrupp Lördag) - om fredagen ser dålig ut.
  const today = new Date(); 
  const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1); // Lördag
  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  const targeting = {
    geo_locations: { custom_locations: [{ latitude: 57.7088, longitude: 11.9745, radius: 10, distance_unit: 'kilometer' }] },
    age_min: 22, age_max: 50, targeting_automation: { advantage_audience: 0 }
  };
  
  // Skapa Adset för Fredag
  const adsetFriday = await metaRequest('adsets', {
    name: 'AI Kortsiktigt: Fredag ' + Date.now(),
    campaign_id: campaignId,
    daily_budget: 25000, // 250 kr
    billing_event: 'IMPRESSIONS',
    optimization_goal: 'LINK_CLICKS',
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    targeting: JSON.stringify(targeting),
    status: 'ACTIVE',
    end_time: new Date(new Date().setHours(23, 59, 59, 999)).toISOString() // Idag vid midnatt
  });

  const creativeFriday = await metaRequest('adcreatives', {
    name: 'Fredag Creative',
    object_story_spec: JSON.stringify({
      page_id: pageId,
      link_data: {
        image_hash: '3a633a9ac40724a042bd29685aef2fd3',
        link: 'https://www.starkaraoke.se/#boka',
        message: 'Fredagkväll i Göteborg! 🎤🥂\n\nVi har några enstaka studios lediga fram till kl 03:00 inatt. Ta med gänget, beställ pizzabuffé & bubbel direkt via skärmen och stäng dörren om er. Först till kvarn! 149 kr/pers ons-tor, men ikväll är det helgpriser som gäller!',
        call_to_action: { type: 'BOOK_NOW', value: { link: 'https://www.starkaraoke.se/#boka' } }
      }
    })
  });

  await metaRequest('ads', {
    name: 'Annons: Fredag Sena Luckor',
    adset_id: adsetFriday.id,
    creative: JSON.stringify({ creative_id: creativeFriday.id }),
    status: 'ACTIVE'
  });
  console.log("✅ Meta Fredags-kampanj aktiverad!");

  // Skapa Adset för Lördag
  const adsetSaturday = await metaRequest('adsets', {
    name: 'AI Kortsiktigt: Lördag ' + Date.now(),
    campaign_id: campaignId,
    daily_budget: 25000, // 250 kr
    billing_event: 'IMPRESSIONS',
    optimization_goal: 'LINK_CLICKS',
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    targeting: JSON.stringify(targeting),
    status: 'ACTIVE',
    end_time: new Date(new Date(tomorrow).setHours(23, 59, 59, 999)).toISOString() // Lördag vid midnatt
  });

  const creativeSaturday = await metaRequest('adcreatives', {
    name: 'Lördag Creative',
    object_story_spec: JSON.stringify({
      page_id: pageId,
      link_data: {
        image_hash: '3a633a9ac40724a042bd29685aef2fd3',
        link: 'https://www.starkaraoke.se/#boka',
        message: 'Lördagkväll i Göteborg! 🎤🥂\n\nVi har några enstaka studios lediga fram till kl 03:00 inatt. Ta med gänget, beställ pizzabuffé & bubbel direkt via skärmen och stäng dörren om er. Först till kvarn!',
        call_to_action: { type: 'BOOK_NOW', value: { link: 'https://www.starkaraoke.se/#boka' } }
      }
    })
  });

  await metaRequest('ads', {
    name: 'Annons: Lördag Sena Luckor',
    adset_id: adsetSaturday.id,
    creative: JSON.stringify({ creative_id: creativeSaturday.id }),
    status: 'ACTIVE'
  });
  console.log("✅ Meta Lördags-kampanj aktiverad!");
}
run();
