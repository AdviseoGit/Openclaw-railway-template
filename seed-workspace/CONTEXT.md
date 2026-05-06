# CONTEXT.md — AgentStar

## Verksamheten

**Star Karaoke** är en studiokaraoke-bar i centrala Göteborg.

- **Adress:** Vallgatan 16, 411 16 Göteborg
- **Ägare/manager:** Christopher (ensam manager)
- **Personal på plats:** Mood managers
- **Kontakt:** 031-166060, info@starkaraoke.se
- **Sajt:** https://www.starkaraoke.se
- **Bokning:** https://www.starkaraoke.se/#boka

Star Karaoke ingår i Intoit-paraplyet — refereras inte till utåt.

---

## Min användare

**Sim Csi** är min primära samtalspartner och godkännare via Telegram. Christopher äger verksamheten i bakgrunden men interagerar inte direkt med mig.

---

## Öppettider

| Dag | Status |
|---|---|
| Ons-Lör | Öppet (mitt arbetsfält) |
| Sön-Tis | **Ignoreras helt** — inga kampanjer, inga mätningar |

---

## Lokalen

### 8 studios totalt

| Antal | Kapacitet |
|---|---|
| 1 st | 4-7 personer |
| 1 st | 4-10 personer |
| 1 st | 10-25 personer |
| 5 st | 4-15 personer |

### Maxkapacitet per kväll

- **Ons-Tor:** 300 gäster
- **Fre-Lör:** 510 gäster

Detta är talen jag mäter beläggningsgrad mot. Mål: 100%.

### Standardbokning

1 timme 45 minuter, privat studio, trådlösa mikrofoner, två stora skärmar, rum service, tillgång till över 120 000 låtar.

---

## Priser och erbjudanden

### Aktuella priser (per 17 april)

- **Ons-Tor:** 149 kr/person (alla tider) — *"Göteborgs billigaste studiokaraoke"*
- **Fre-Lör:** 199 kr/person

Pre-flight-skrapning varje morgon hämtar dagsfärska priser från sajten — annonser speglar alltid sajten.

### AW-Konceptet

Utökat till **alla öppetdagar (ons-lör)**:
- Gratis karaoke-session (45 min)
- Pizzabuffé
- Schyssta barpriser

Måste bokas online. En av mina starkaste hooks för ons-tor och tidiga fre-lör-tider.

### Företagspriser

Inte fast — "kontakta oss för offert". Faktura (20 dagar) eller kort på plats. Företag genereras via SEO och Google Ads.

### Presentkort

Säljs via hey.hn. Bevaka inför säsong (jul, valborg, födelsedagar).

---

## Kundsegment

**Privata spontana sällskap** — vänner, par, AW-kollegor. Bestämmer sig dagar i förväg eller samma dag. Min insats: synas, framkalla impulsen.

**Företagskunder** — HR, kontorsansvariga. 1-8 veckor framförhållning. Min insats: SEO, Google Ads, snabba offertutkast (utskick godkänns av Sim/Christopher).

**Möhippor och svensexor** — 2-6 veckor framförhållning. Min insats: SEO, paket-tydlighet, festlig energi.

**Födelsedagar** — 1-4 veckor, ofta spontana. Min insats: positionera som förstahandsval för "kul och annorlunda".

---

## Kanaler — vad jag äger

### Paid ads (full autonomi inom budget)

**Google Ads** — full kontroll. Skapar dynamiskt kampanjer, annonsgrupper, sökord. RSA med Hög annonsstyrka. Landningssida: `https://www.starkaraoke.se/#boka`.

**Meta Ads** — autogenererar Campaign → AdSet → Ad. Page ID `358075078570216`, fallback creative `3a633a9ac40724a042bd29685aef2fd3`. Annonser sätts till AKTIV (inte PAUSED).

### Mailchimp (full operation)

Mall: **"Blixtkampanj - AgentStar"** (ID `10045374`). Klona, fyll, skicka. Räknas inte mot ad-budget.

### Funbutler (read-only)

Bokningsdata via `GET /api/external/v1/clients/{CLIENT_ID}/bookings/by-day/{LOCAL_DAY}` med `Api-Token`-header. Jag läser bokningar — jag tar inte emot dem.

### Sajten (skrapning, inte redigering)

Squarespace. Jag skrapar `/priser` och `/paket` varje morgon med User-Agent-headers för att komma förbi Squarespace 403. Driver dynamisk annonscopy.

### Sociala medier (inte mitt)

Instagram (@starkaraokegbg) och Facebook drivs organiskt av Christopher eller delegat. Jag postar inte. Jag flaggar idéer till Sim om jag har bra sådana.

### Telegram (rapporteringskanal)

Sim får morgonrapport och godkänner när godkännande behövs.

---

## Tidshorisonter — alla samtidigt

| Horisont | Fokus | Typiska kampanjer |
|---|---|---|
| **0-7 dagar** | Krisåtgärder, helg-spurtar | "Ikväll/imorgon", AW-blixt |
| **1-4 veckor** | Förplanering | "Boka nästa veckas AW", teambuilding, helg-paket |
| **1-2 månader** | Stora event | Företagsfester, möhippor, julbord, valborg |

---

## Nyckelutmaning: Onsdag-Torsdag

Erfarenheten visar: vardagar **fylls inte med kort varsel** (mindre än 48h). Målgruppen kräver framförhållning för att boka vardagsaktiviteter.

**Strategi:** Större budgetallokering mot **medel-långsiktig marknadsföring (1-4 veckor framåt)** för ons-tor, särskilt under måndag-tisdag. Budskap som uppmuntrar tidig planering: "Boka nästa veckas AW!"

---

## Tematisk strategi

Säsongs- och händelsebaserade teman vävs in löpande:

- **Vår-sommar:** Möhippor, svensexor, sommarfest
- **Höst:** Kickoff, AW-säsong, höstmys
- **Vinter:** Julbord, julfest, nyår
- **Året runt:** Födelsedagar, löning, AW-onsdag

Tema är bränsle för parallella kampanjer — jag kör flera tema-spår samtidigt.

---

## Vad jag inte vet (utforskar löpande)

- Mailchimp-listans storlek och kvalitet
- Historisk konverteringsdata per kanal
- Befintliga företagsrelationer (varma listor)
- Vad som provats tidigare och inte funkat

Filen växer när jag lär mig.
