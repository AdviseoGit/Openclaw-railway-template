const https = require('https');

const LIST_ID = 'b3d2225261';
const TEMPLATE_ID = 10045374;
const BUSINESS_SEGMENT_ID = 9197273; // "Företag"
const FROM_EMAIL = 'hej@starkaraoke.se';
const FROM_NAME = 'Star Karaoke';

function mcRequest(method, path, body = null) {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  if (!apiKey) throw new Error('Missing MAILCHIMP_API_KEY');
  const dc = apiKey.split('-')[1];
  if (!dc) throw new Error('Invalid MAILCHIMP_API_KEY format (expected key-dcN)');

  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${dc}.api.mailchimp.com`,
      port: 443,
      path: `/3.0${path}`,
      method,
      headers: {
        Authorization: `Basic ${Buffer.from(`any:${apiKey}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        if (res.statusCode >= 400) {
          return reject(new Error(`Mailchimp ${method} ${path}: HTTP ${res.statusCode}: ${JSON.stringify(parsed).slice(0, 300)}`));
        }
        resolve(parsed);
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function fetchTemplateHtml() {
  // Clone template into a temp campaign to get rendered HTML
  const temp = await mcRequest('POST', '/campaigns', {
    type: 'regular',
    recipients: { list_id: LIST_ID },
    settings: { subject_line: 'Temp', title: '_tmp_sk_monitor_', from_name: FROM_NAME, reply_to: FROM_EMAIL }
  });
  await mcRequest('PUT', `/campaigns/${temp.id}/content`, { template: { id: TEMPLATE_ID } });
  const content = await mcRequest('GET', `/campaigns/${temp.id}/content`);
  await mcRequest('DELETE', `/campaigns/${temp.id}`);
  return content.html || '';
}

function injectContent(html, { subject, heading, ingress, h2offer, cta }) {
  return html
    .replace(/Infoga Rubrik/gi, heading)
    .replace(/infoga Ingress/gi, ingress)
    .replace(/\[H2 erbjudande\]/gi, h2offer)
    .replace(/\[infoga text\]/gi, () => cta)
    .replace(/\[\s*H2\s+tjänst\s*\]/gi, 'Boka er studio')
    .replace(/\[\s*H2\s+matutbud\s*\]/gi, 'Room Service')
    .replace(/\[\s*H2\s+boka\s*\]/gi, 'Boka direkt')
    .replace(/infoga CTAtext/gi, 'Säkra er plats här');
}

async function sendCampaign({ subjectLine, title, html, useBusinessSegment }) {
  const recipients = useBusinessSegment
    ? { list_id: LIST_ID, segment_opts: { saved_segment_id: BUSINESS_SEGMENT_ID } }
    : { list_id: LIST_ID };

  const campaign = await mcRequest('POST', '/campaigns', {
    type: 'regular',
    recipients,
    settings: { subject_line: subjectLine, title, from_name: FROM_NAME, reply_to: FROM_EMAIL }
  });

  await mcRequest('PUT', `/campaigns/${campaign.id}/content`, { html });
  await mcRequest('POST', `/campaigns/${campaign.id}/actions/send`);
  return campaign.id;
}

async function runFlash(action) {
  const { targetDate, dayName, daysAway, occupancyPct, persons, capacity } = action;
  const freeSlots = capacity - persons;
  const urgency = daysAway === 0 ? 'ikväll' : daysAway === 1 ? 'imorgon' : `${dayName.toLowerCase()} ${targetDate.slice(5)}`;
  const isWeekend = ['Fre', 'Lör'].includes(dayName);

  const subject = isWeekend
    ? `🎤 Sena ${dayName}stider lediga – boka nu!`
    : `🎤 AW ${urgency} – lediga studios!`;

  const content = isWeekend
    ? {
        heading: `Sena ${dayName}stider – endast ${freeSlots} platser kvar!`,
        ingress: `Vi har oväntat lediga studios ${urgency}. Perfekt spontanaktivitet med vännerna – privat studio, room service och nattöppet till 03:00.`,
        h2offer: `Boka ${dayName} ${urgency}`,
        cta: `Från 199 kr/pers. Sjung loss till 120 000 låtar. Beställ mat & dryck direkt i rummet.`
      }
    : {
        heading: `AW ${urgency} – boka nu!`,
        ingress: `Lediga studios ${urgency} för after work eller teambuilding. Privat studio, mat via room service och toppljud.`,
        h2offer: `After Work ${dayName} ${urgency}`,
        cta: `Från 149 kr/pers ons–tor. Privat studio med 120k låtar och room service.`
      };

  const html = injectContent(await fetchTemplateHtml(), { subject, ...content });
  const campaignId = await sendCampaign({ subjectLine: subject, title: `Blixt ${dayName} ${targetDate}`, html, useBusinessSegment: !isWeekend });

  return `Mailchimp blixt skickat (kampanj ${campaignId})`;
}

async function runProactive(action) {
  const { targetDate, dayName, daysAway, occupancyPct } = action;
  const weeksOut = Math.ceil(daysAway / 7);
  const horizon = weeksOut <= 1 ? 'nästa vecka' : `om ${weeksOut} veckor`;
  const isWeekend = ['Fre', 'Lör'].includes(dayName);

  const subject = isWeekend
    ? `🎤 Planera helgen – boka ${dayName} ${targetDate.slice(5)} i god tid`
    : `🎤 Boka AW ${horizon} – lediga studios`;

  const content = isWeekend
    ? {
        heading: `Planera helgkvällen ${horizon}`,
        ingress: `${dayName} ${targetDate.slice(5)} har vi fortfarande gott om studios. Säkra er plats nu för bäst urval!`,
        h2offer: `Helgkväll ${horizon}`,
        cta: `Från 199 kr/pers. Privat studio, 120k låtar, pizzabuffé & room service. Nattöppet till 03:00.`
      }
    : {
        heading: `Boka nästa AW ${horizon}`,
        ingress: `Tjuvstarta planeringen! ${dayName} ${targetDate.slice(5)} har vi lediga studios för er after work. Boka i god tid för bäst urval.`,
        h2offer: `After Work ${horizon}`,
        cta: `Från 149 kr/pers ons–tor. Privat studio, mat & dryck direkt till rummet.`
      };

  const html = injectContent(await fetchTemplateHtml(), { subject, ...content });
  const campaignId = await sendCampaign({ subjectLine: subject, title: `Proaktiv ${dayName} ${targetDate}`, html, useBusinessSegment: true });

  return `Mailchimp proaktiv skickat (kampanj ${campaignId})`;
}

module.exports = { runFlash, runProactive };
