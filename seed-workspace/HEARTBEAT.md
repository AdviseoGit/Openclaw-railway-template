# StarKaraoke - Daglig Övervakning

- **När:** Varje morgon kl 08:00 (06:00 UTC sommartid) via cron.
- **Kommando:** `node /data/workspace/skills/starkaraoke-monitor/scripts/monitor.js --report`
- **Uppgift:**
  1. Hämta live-data från Funbutler för de kommande 14 dagarna.
  2. Räkna ut beläggningsgrad (Max: 300 pers Ons–Tor, 510 pers Fre–Lör).
  3. Kör beslutsregler och identifiera åtgärder som behövs.
  4. Skicka dagrapport till Sim Csi via Telegram med beläggning och väntande åtgärder.
  5. Åtgärder körs **inte** automatiskt — Sim Csi godkänner med "execute <id>".
- **Budget:** Max 5 000 kr/mån (Google Ads + Meta kombinerat).

## Registrera cron (om det saknas)

```
/cron add "starkaraoke-morning-report" "0 6 * * *" "node /data/workspace/skills/starkaraoke-monitor/scripts/monitor.js --report"
```

## Godkänna en åtgärd

När Sim Csi svarar "execute sk_YYYY-MM-DD_typ", kör:
```
node /data/workspace/skills/starkaraoke-monitor/scripts/monitor.js --execute sk_YYYY-MM-DD_typ
```
