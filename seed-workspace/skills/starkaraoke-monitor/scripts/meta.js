const https = require('https');
const querystring = require('querystring');

const AD_ACCOUNT_ID = 'act_641605644293863';
const PAGE_ID = '358075078570216';
const CAMPAIGN_ID = '120241662572530318'; // "Blixtinsatser - StarKaraoke AI"
const FALLBACK_IMAGE_HASH = '3a633a9ac40724a042bd29685aef2fd3';

function metaPost(path, payload) {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) throw new Error('Missing META_ACCESS_TOKEN');
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({ ...payload, access_token: token });
    const options = {
      hostname: 'graph.facebook.com',
      port: 443,
      path: `/v19.0/${path}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(postData) }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        if (res.statusCode >= 400 || (parsed && parsed.error)) {
          return reject(new Error(`Meta API error: ${JSON.stringify(parsed).slice(0, 300)}`));
        }
        resolve(parsed);
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runFlash(action) {
  const { targetDate, dayName, daysAway, occupancyPct, persons, capacity } = action;
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) throw new Error('Missing META_ACCESS_TOKEN');

  const isWeekend = ['Fre', 'Lör'].includes(dayName);
  const urgency = daysAway === 0 ? 'ikväll' : daysAway === 1 ? 'imorgon' : `${dayName} ${targetDate.slice(5)}`;
  const freeSlots = capacity - persons;

  const message = isWeekend
    ? `🎤 Sena ${dayName}stider hos Star Karaoke Göteborg!\n\nVi har ${freeSlots} platser lediga ${urgency}. Ta med gänget – privat studio, pizzabuffé & bubbel via room service. Nattöppet till 03:00. Boka direkt online!`
    : `🎤 After Work ${urgency} på Star Karaoke!\n\nLediga studios för AW eller teambuilding. Privat studio, mat & dryck via room service. Från 149kr/pers. Boka nu!`;

  // Create ad set ending tonight
  const endTime = new Date(targetDate + 'T23:00:00+02:00').toISOString();
  const targeting = {
    geo_locations: { custom_locations: [{ latitude: 57.7088, longitude: 11.9745, radius: 12, distance_unit: 'kilometer' }] },
    age_min: 22,
    age_max: 52,
    targeting_automation: { advantage_audience: 0 }
  };

  const adset = await metaPost(`${AD_ACCOUNT_ID}/adsets`, {
    name: `AI Blixt ${dayName} ${targetDate} ${Date.now()}`,
    campaign_id: CAMPAIGN_ID,
    daily_budget: 15000, // 150 kr in öre
    billing_event: 'IMPRESSIONS',
    optimization_goal: 'LINK_CLICKS',
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    targeting: JSON.stringify(targeting),
    status: 'ACTIVE',
    end_time: endTime
  });

  const creative = await metaPost(`${AD_ACCOUNT_ID}/adcreatives`, {
    name: `Creative Blixt ${dayName} ${targetDate}`,
    object_story_spec: JSON.stringify({
      page_id: PAGE_ID,
      link_data: {
        image_hash: FALLBACK_IMAGE_HASH,
        link: 'https://www.starkaraoke.se/#boka',
        message,
        call_to_action: { type: 'BOOK_NOW', value: { link: 'https://www.starkaraoke.se/#boka' } }
      }
    })
  });

  const ad = await metaPost(`${AD_ACCOUNT_ID}/ads`, {
    name: `Annons Blixt ${dayName} ${targetDate}`,
    adset_id: adset.id,
    creative: JSON.stringify({ creative_id: creative.id }),
    status: 'ACTIVE'
  });

  return `Meta blixtannons aktiverad. AdSet: ${adset.id}, Ad: ${ad.id}`;
}

module.exports = { runFlash };
