---
name: starkaraoke-monitor
description: >
  Daglig beläggningsövervakning och marknadsföringsautomation för StarKaraoke.
  Hämtar Funbutler-data, räknar ut beläggningsgrad och föreslår riktade åtgärder
  (Meta Ads, Google Ads, Mailchimp). Körs i rapportläge varje morgon 08:00 och
  exekverar godkända åtgärder på begäran.
version: 1.0.0
---

## Kommandon

**Rapport** — körs av cron kl 08:00 varje dag:
```
node /data/workspace/skills/starkaraoke-monitor/scripts/monitor.js --report
```

**Exekvera åtgärd** — körs av agenten efter att användaren godkänt:
```
node /data/workspace/skills/starkaraoke-monitor/scripts/monitor.js --execute <action-id>
```

## Beslutsregler

| Situation | Åtgärd |
|-----------|--------|
| ≤ 7 dagar kvar, < 30 % beläggning | Meta blixtannons + Google Ads blixt |
| ≤ 3 dagar kvar, < 50 % beläggning | Mailchimp blixt till Företagssegmentet |
| 8–14 dagar kvar, < 50 % beläggning | Google Ads proaktiv AW-kampanj |
| 8–14 dagar kvar, < 30 % beläggning | Mailchimp proaktiv AW-mail |

Kapacitet: 300 pers (Ons–Tor), 510 pers (Fre–Lör). Öppet Ons–Lör.

## Budget

Hårt tak: **5 000 kr/månad** (Google Ads + Meta kombinerat).  
Mailchimp räknas inte mot budgeten.  
Spårning i `state/state.json` — nollställs automatiskt vid nytt kalendermånad.

## Godkännandeflöde

1. Cron kör `--report` kl 08:00.
2. Rapporten skickas till användaren via Telegram med action-ID:n.
3. Användaren svarar "execute sk_YYYY-MM-DD_typ" till agenten.
4. Agenten kör `--execute <id>`.
5. Skriptet verifierar budget och exekverar, bekräftar via Telegram.

## Idempotens

Varje åtgärd har ett deterministiskt ID på formen `sk_{datum}_{typ}`.  
Redan utförda åtgärder körs aldrig om — kontrolleras mot `state/state.json`.

## Miljövariabler

| Variabel | Används av |
|----------|------------|
| `FUNBUTLER_API_TOKEN` | funbutler.js |
| `FUNBUTLER_CLIENT_ID` | funbutler.js |
| `META_ACCESS_TOKEN` | meta.js |
| `GOOGLE_ADS_CLIENT_ID` | google_ads.js |
| `GOOGLE_ADS_CLIENT_SECRET` | google_ads.js |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | google_ads.js |
| `GOOGLE_ADS_REFRESH_TOKEN` | google_ads.js |
| `MAILCHIMP_API_KEY` | mailchimp.js |
| `TELEGRAM_BOT_TOKEN` | telegram.js |
| `TELEGRAM_CHAT_ID` | telegram.js |
