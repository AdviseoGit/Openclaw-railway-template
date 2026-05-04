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
      let data = ''; res.on('data', (d) => data += d);
      res.on('end', () => {
          try { resolve(JSON.parse(data)); } catch(e) { resolve(data); }
      });
    });
    if (body) req.write(JSON.stringify(body)); req.end();
  });
}

async function run() {
  const tempCamp = await mcRequest('POST', '/campaigns', { type: "regular", recipients: { list_id: "b3d2225261" }, settings: { subject_line: "Temp", title: "Temp", from_name: "Temp", reply_to: "hej@starkaraoke.se" } });
  await mcRequest('PUT', `/campaigns/${tempCamp.id}/content`, { template: { id: 10045374 } });
  let html = (await mcRequest('GET', `/campaigns/${tempCamp.id}/content`)).html;
  await mcRequest('DELETE', `/campaigns/${tempCamp.id}`);
  
  html = html.replace(/AGENT_RUBRIK/gi, "Helgen är räddad! 🎤🍕");
  html = html.replace(/AGENT_INGRESS/gi, "Vi har fått in ett fåtal sena avbokningar för både fredag och lördag! Perfekt för spontana beslut.");
  html = html.replace(/AGENT_H2_ERBJUDANDE/gi, "Sista minuten - Fredag & Lördag");
  html = html.replace(/AGENT_TEXT_1/gi, "Säkra en privat studio för kompisgänget och maxa helgen. Vi har öppet till 03:00 både fredag och lördag!");
  html = html.replace(/AGENT_H2_TJANST/gi, "Klubbkänsla i egen studio");
  html = html.replace(/AGENT_TEXT_2/gi, "Stäng dörren, dra upp volymen. 120k låtar, proffsmickar och ljusshow – helt för er själva.");
  html = html.replace(/AGENT_H2_MATUTBUD/gi, "Kall dryck via skärmen");
  html = html.replace(/AGENT_TEXT_3/gi, "Inga köer i baren. Beställ öl, bubbel och snacks direkt på skärmen i studion.");
  html = html.replace(/AGENT_H2_BOKA/gi, "Boka natt-passet nu");
  html = html.replace(/AGENT_KNAPP/gi, "Säkra studion här");

  const campaign = await mcRequest('POST', '/campaigns', {
    type: "regular",
    recipients: { list_id: "b3d2225261", segment_opts: { saved_segment_id: 9198937 } }, // Customer segment
    settings: {
      subject_line: "🎤 Helgen är räddad! Sista minuten-tider ikväll.",
      title: "Blixtinsats: Sena fredags/lördags-luckor - " + Date.now(),
      from_name: "Star Karaoke",
      reply_to: "hej@starkaraoke.se"
    }
  });

  await mcRequest('PUT', `/campaigns/${campaign.id}/content`, { html: html });
  const send = await mcRequest('POST', `/campaigns/${campaign.id}/actions/send`);
  console.log(`✅ Mailchimp proaktiv fredags/lördags-mail skickat skarpt!`);
}
run();
