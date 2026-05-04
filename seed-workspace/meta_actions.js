const https = require('https');
const querystring = require('querystring');
const token = process.env.META_ACCESS_TOKEN || "EAANhJi3yPAkBRJGse9XhAOr0MVHq2gaiyG5onPZCVXbIms0TAMIWw9TnItKJ8XgFLDxZA1LAloNNemrHskHKvVola5SszbaLxu8RFUQ4AYdiTJdd6b1jZBHuBHuhqo9YIpaUFFT8v282ZCu6Tu0MSjg5t0ufj4pGuaezAZBFr9xquaGZBuxknzEveWB4RvOzgdU7dePhQaPCoBD6ufg2x4c4OEZB06pR4DMtMVSvvfdnoVuV4cKsGSKZCTVLgWUcSqwfLCVANOuMKlnVU9qvUxFAYbIq";
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
        let data = ''; res.on('data', d => data += d); res.on('end', () => resolve(data));
      });
      req.write(postData); req.end();
    });
}

async function run() {
  const campaignId = '120241662572530318'; // "Blixtinsatser - StarKaraoke AI"
  
  // 1. Pausa gårdagens sista-minuten-fredag!
  await metaUpdate('120241815903060318', { status: 'PAUSED' });
  console.log("Pausade Fredags-kampanjen.");

  // 2. Skapa Proaktiv Helg-Push (Målgrupp Lördag)
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const targeting = {
    geo_locations: { custom_locations: [{ latitude: 57.7088, longitude: 11.9745, radius: 10, distance_unit: 'kilometer' }] },
    age_min: 22, age_max: 50, targeting_automation: { advantage_audience: 0 }
  };
  
  const adset = await metaRequest('adsets', {
    name: 'AI Kortsiktigt: Lördag ' + Date.now(),
    campaign_id: campaignId,
    daily_budget: 15000,
    billing_event: 'IMPRESSIONS',
    optimization_goal: 'LINK_CLICKS',
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    targeting: JSON.stringify(targeting),
    status: 'ACTIVE',
    end_time: tomorrow.toISOString()
  });

  const creative = await metaRequest('adcreatives', {
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
    adset_id: adset.id,
    creative: JSON.stringify({ creative_id: creative.id }),
    status: 'ACTIVE'
  });
  
  console.log("✅ Meta lördags-kampanj aktiverad!");
}
run();
