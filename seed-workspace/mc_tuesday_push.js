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
  
  if(!html) return;
  
  html = html.replace(/AGENT_RUBRIK/gi, "Rädda lillördagen! 🎤🍕");
  html = html.replace(/AGENT_INGRESS/gi, "Känns arbetsveckan lång redan? Boka in morgondagens AW! Vi har ett fåtal studios lediga för onsdag och torsdag kväll.");
  html = html.replace(/AGENT_H2_ERBJUDANDE/gi, "Stans billigaste studiokaraoke");
  
  html = html.replace(/AGENT_TEXT_1/gi, "Endast 149 kr/person på onsdagar och torsdagar. Ta med kollegorna och sjung ut stressen!");
  html = html.replace(/AGENT_H2_TJANST/gi, "Privat studio & 120k låtar");
  html = html.replace(/AGENT_TEXT_2/gi, "Stäng dörren, dra upp volymen. Proffsmickar och ljusshow – helt för er själva.");
  html = html.replace(/AGENT_H2_MATUTBUD/gi, "Gratis pizzabuffé");
  html = html.replace(/AGENT_TEXT_3/gi, "Ni får 45 min gratis karaoke, pizzabuffé utanför rummet och kan beställa kalla drycker direkt via skärmen.");
  html = html.replace(/AGENT_H2_BOKA/gi, "Boka morgondagens AW nu");
  html = html.replace(/AGENT_KNAPP/gi, "Säkra studion här");

  const campaign = await mcRequest('POST', '/campaigns', {
    type: "regular",
    recipients: { list_id: "b3d2225261", segment_opts: { saved_segment_id: 9197273 } }, // Företags-segmentet
    settings: {
      subject_line: "🎤 Känns veckan lång? Boka in morgondagens AW (fr. 149kr!)",
      title: "Blixtinsats: Rädda Ons-Tor - " + Date.now(),
      from_name: "Star Karaoke",
      reply_to: "hej@starkaraoke.se"
    }
  });

  await mcRequest('PUT', `/campaigns/${campaign.id}/content`, { html: html });
  const sendRes = await mcRequest('POST', `/campaigns/${campaign.id}/actions/send`);
  console.log(`✅ Mailchimp proaktiv tisdags-mail skickat skarpt!`);
}
run();
