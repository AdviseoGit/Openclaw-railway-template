# TOOLS.md — Lokala konfigurationer

Skills definierar *hur* verktyg fungerar. Den här filen är *mina specifika* — det som är unikt för Star Karaoke-uppsättningen.

---

## Funbutler (bokningsdata, read-only)

- **Endpoint:** `GET /api/external/v1/clients/{CLIENT_ID}/bookings/by-day/{LOCAL_DAY}`
- **Auth:** `Api-Token` header
- **Miljönycklar:** `FUNBUTLER_CLIENT_ID`, `FUNBUTLER_API_TOKEN`
- **Tidshorisont:** 14 dagar framåt, hämtas varje morgon
- **Backa av vid 429**

---

## Meta Ads

- **Page ID:** `358075078570216`
- **Fallback creative:** `3a633a9ac40724a042bd29685aef2fd3`
- **Miljönyckel:** `META_ACCESS_TOKEN`
- **Struktur:** Campaign → AdSet → Ad
- **Status:** AKTIV (inte PAUSED) i skarpt läge

---

## Google Ads

- **Landningssida:** `https://www.starkaraoke.se/#boka`
- **Miljönycklar:**
  - `GOOGLE_ADS_CLIENT_ID`
  - `GOOGLE_ADS_CLIENT_SECRET`
  - `GOOGLE_ADS_DEVELOPER_TOKEN`
  - `GOOGLE_ADS_REFRESH_TOKEN`

### RSA-krav (Hög/Excellent annonsstyrka)

- Minst 10-15 unika rubriker
- Minst 4 unika beskrivningar (90 tecken)
- Sökordsvarianter: "Karaoke", "Boka Karaoke Göteborg", "Drop in", "AW Göteborg", "Studiokaraoke", "Möhippa Göteborg", "Födelsedag Göteborg", "Företagsfest Göteborg"

---

## Mailchimp

- **Mall:** "Blixtkampanj - AgentStar" (ID: `10045374`)
- **Metod:** Klona mallen, injicera text, skicka till relevant segment
- **Miljönyckel:** `MAILCHIMP_API_KEY`
- **Räknas inte mot ad-budget**

---

## Telegram

- **Miljönycklar:** `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
- **Chat:** Sim Csi (primär kanal)
- **Format:** Markdown-light, punktlistor, kort

---

## Sajten — skrapning

- **URL:s att skrapa varje morgon:**
  - `https://www.starkaraoke.se/priser`
  - `https://www.starkaraoke.se/paket`
- **Metod:** Falska User-Agent-headers för att komma förbi Squarespace 403
- **Användning:** Driver dynamisk annonscopy så annonser alltid speglar dagsfärsk hemsidekommunikation

---

## State

- **Path:** `state/state.json`
- **Innehåll:**
  - Utförda action-IDs (idempotens)
  - Månadsspend per plattform
  - Senaste skrapnings-data
  - Senaste Funbutler-prognos
- **Reset:** Månadsspend nollställs vid ny kalendermånad

## Heartbeat-state

- **Path:** `memory/heartbeat-state.json`
- **Innehåll:** Timestamps för senaste kontroller (Funbutler, ads, Mailchimp, spend)

---

## Skript

- **Monitor:** `/data/workspace/skills/starkaraoke-monitor/scripts/monitor.js`
- **Rapport-läge:** `node monitor.js --report`
- **Exekvera-läge:** `node monitor.js --execute <action-id>`

## Cron

- **Morgonrapport:** `0 6 * * *` (06:00 UTC = 08:00 lokal sommartid)
- **Kommando:** `node /data/workspace/skills/starkaraoke-monitor/scripts/monitor.js --report`

---

Lägg till vad som hjälper. Detta är mitt fusklapp.
