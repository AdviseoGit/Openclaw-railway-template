# HEARTBEAT.md — Daglig drift

## Morgonrapport (cron)

- **När:** Varje morgon kl 08:00 lokal (06:00 UTC sommartid)
- **Kommando:** `node /data/workspace/skills/starkaraoke-monitor/scripts/monitor.js --report`

### Steg

1. Skrapa `https://www.starkaraoke.se/priser` och `/paket` för dagsfärska erbjudanden
2. Hämta Funbutler-data 14 dagar framåt
3. Räkna beläggningsgrad (max 300 ons-tor, 510 fre-lör)
4. Kör beslutsregler enligt SKILL.md
5. Identifiera åtgärder med action-IDs (`sk_YYYY-MM-DD_typ`)
6. Skicka rapport till Sim via Telegram
7. Verifiera spend mot 5 000 kr/mån-budget

### Vad som körs autonomt vs. kräver godkännande

- **Löpande optimering** (pausa underpresterande, justera bud, skifta budget) körs direkt
- **Beslutsregel-utlösta åtgärder** (Meta-blixt, Google-blixt, Mailchimp till företag, AW-mail) körs direkt så länge de är inom etablerade ramar
- **Endast åtgärder som rör undantagen i GUARDRAILS.md** kräver `execute <id>` från Sim:
  - Helt nya rabatter
  - Sön-tis-kampanjer
  - Budget över 5 000 kr/mån
  - Helt nya kanaler

---

## Cron-registrering (om saknas)

```
/cron add "starkaraoke-morning-report" "0 6 * * *" "node /data/workspace/skills/starkaraoke-monitor/scripts/monitor.js --report"
```

## Godkännande av åtgärd

När Sim svarar `execute sk_YYYY-MM-DD_typ`:
```
node /data/workspace/skills/starkaraoke-monitor/scripts/monitor.js --execute sk_YYYY-MM-DD_typ
```

---

## Heartbeat-checklist (mellan körningar)

Gå igenom i ordning:

1. **Spend** — över 80% av månadsbudget? Flagga.
2. **Funbutler delta** — bokningsläget förändrat? Påverkar aktuella kampanjer?
3. **Ads-prestanda** — något att pausa (CPA 3x över mål, eller 200+ klick utan konvertering)?
4. **Tema-horisont** — närmar sig säsong (jul, valborg, sommar) som behöver kampanjstart?
5. **Idempotens** — inga ofullständiga åtgärder som hängt sig?

Om inget kräver uppmärksamhet: `HEARTBEAT_OK`.

### Tystnadsperioder

- 00:00-08:00 — tystnad om inte akut
- Senaste kontroll <30 min sedan — hoppa över

---

## Proaktivt arbete utanför rapport

Mellan morgonrapporter kör jag fritt:

- Skapa nya parallella kampanjer för olika tidshorisonter
- Pausa underpresterande kampanjer
- Skifta budget mellan plattformar
- Skicka Mailchimp-utskick (med smak-regeln, inte spam)
- Föreslå nya kanaler/metoder till Sim när befintliga inte räcker
- Uppdatera MEMORY.md med lärdomar

Allt rapporteras i nästa morgonrapport.
