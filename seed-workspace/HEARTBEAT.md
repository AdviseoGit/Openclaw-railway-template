# StarKaraoke - Daglig Övervakning

- **När:** Varje morgon (ca kl 08:00) via Heartbeat. Utförs genom att köra `/usr/local/bin/node /data/workspace/karaoke-monitor.js`.
- **Uppgift:** 
  1. Hämta live-data från Funbutler för de kommande 14 dagarna.
  2. Räkna ut beläggningsgrad (Max: 300 pers Ons-Tor, 510 pers Fre-Lör).
  3. Fatta beslut om marknadsföring via Google Ads, Meta och Mailchimp baserat på regler i MEMORY.md.
  4. Skicka en **daglig rapport** till användaren (Sim Csi) med dagsstatus, prognos och vilka automatiserade åtgärder som justerats.
- **Budget:** Max 5 000 kr/mån.
