const https = require('https');
const apiKey = process.env.MAILCHIMP_API_KEY;
const dc = apiKey.split('-')[1];

function mcRequest(method, path, body = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: `${dc}.api.mailchimp.com`, port: 443, path: `/3.0${path}`, method: method,
      headers: { 'Authorization': `Basic ${Buffer.from(`any:${apiKey}`).toString('base64')}`, 'Content-Type': 'application/json' }
    };
    const req = https.request(options, (res) => {
      let data = ''; res.on('data', (d) => data += d); res.on('end', () => resolve(JSON.parse(data)));
    });
    if (body) req.write(JSON.stringify(body)); req.end();
  });
}

async function run() {
  const tempCamp = await mcRequest('POST', '/campaigns', { type: "regular", recipients: { list_id: "b3d2225261" }, settings: { subject_line: "Temp", title: "Temp", from_name: "Temp", reply_to: "hej@starkaraoke.se" } });
  await mcRequest('PUT', `/campaigns/${tempCamp.id}/content`, { template: { id: 10045374 } });
  let html = (await mcRequest('GET', `/campaigns/${tempCamp.id}/content`)).html;
  await mcRequest('DELETE', `/campaigns/${tempCamp.id}`);
  
  if(!html) return;
  
  html = html.replace(/Infoga Rubrik/g, "Boka vårens roligaste AW! 🎤");
  html = html.replace(/infoga Ingress/gi, "Tjuvstarta planeringen! Nästa vecka har vi ett fåtal lediga studios för teambuilding och AW. Sjung ut med kollegorna och beställ mat direkt till rummet.");
  html = html.replace(/\[H2 erbjudande\]/g, "After Work nästa vecka");
  html = html.replace(/\[infoga text\]/gi, () => ["Från 199 kr per person. Boka innan tiderna tar slut!", "Sjung i er egen privata studio med över 120k låtar.", "Mat och dryck levereras direkt till er dörr via skärmen."].shift() || "");
  html = html.replace(/\[\s*H2\s+tjänst\s*\]/gi, "Teambuilding i egen studio");
  html = html.replace(/\[\s*H2\s+matutbud\s*\]/gi, "Room Service");
  html = html.replace(/\[\s*H2\s+boka\s*\]/gi, "Boka AW-tid nu");
  html = html.replace(/infoga CTAtext/gi, "Säkra er studio här");

  // Filter for 'Företag' segment
  const campaign = await mcRequest('POST', '/campaigns', {
    type: "regular",
    recipients: { list_id: "b3d2225261", segment_opts: { saved_segment_id: 9197273 } },
    settings: {
      subject_line: "🎤 Dags att boka nästa AW? Vi har rum lediga!",
      title: "Proaktiv: AW Nästa vecka",
      from_name: "Star Karaoke",
      reply_to: "hej@starkaraoke.se"
    }
  });

  await mcRequest('PUT', `/campaigns/${campaign.id}/content`, { html: html });
  await mcRequest('POST', `/campaigns/${campaign.id}/actions/send`);
  console.log(`✅ Mailchimp proaktiv AW-mail skickat!`);
}
run();
