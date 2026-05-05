# Installation — starkaraoke-monitor

## Registrera cron (kör en gång)

Registrera det dagliga morgonrapport-jobbet via OpenClaw:

```
/cron add "starkaraoke-morning-report" "0 6 * * *" "node /data/workspace/skills/starkaraoke-monitor/scripts/monitor.js --report"
```

> Kl 06:00 UTC = kl 08:00 Stockholm sommartid (CEST, UTC+2).  
> Justera till `0 7 * * *` vintertid (CET, UTC+1) om det behövs.

## Testa manuellt

```bash
node /data/workspace/skills/starkaraoke-monitor/scripts/monitor.js --report
```

## Exekvera en åtgärd manuellt

```bash
node /data/workspace/skills/starkaraoke-monitor/scripts/monitor.js --execute sk_2026-05-09_flash_meta
```

## State-fil

`/data/workspace/skills/starkaraoke-monitor/state/state.json`

Skapas automatiskt vid första körning. Innehåller:
- `monthlySpend`: förbrukad budget per kalendermånad
- `executedActionIds`: lista med körda action-ID (idempotensgaranti)
- `pendingActions`: väntande åtgärder sedan senaste rapport
- `executionLog`: historik med timestamp och resultat

## Node-paket

`google-ads-api` måste vara installerat i workspace:

```bash
cd /data/workspace && npm install google-ads-api
```

Övriga moduler (`https`, `querystring`, `fs`, `path`) är inbyggda i Node.js.
