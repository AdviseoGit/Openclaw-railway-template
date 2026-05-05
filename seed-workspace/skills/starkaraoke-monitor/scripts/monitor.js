#!/usr/bin/env node
'use strict';

const funbutler = require('./funbutler');
const { decide, DOW_NAMES, CAPACITY, OPEN_DOW } = require('./decisions');
const stateLib = require('./state');
const telegram = require('./telegram');
const googleAds = require('./google_ads');
const meta = require('./meta');
const mailchimp = require('./mailchimp');

// ─── helpers ─────────────────────────────────────────────────────────────────

function pad(n, w = 3) { return String(n).padStart(w, ' '); }

function formatOccupancyLine(day) {
  const dow = new Date(day.date + 'T12:00:00').getDay();
  if (!OPEN_DOW.has(dow)) return null;
  const cap = CAPACITY[dow];
  const pct = Math.round((day.persons / cap) * 100);
  const name = DOW_NAMES[dow];
  const flag = pct < 30 ? ' ← KRITISK' : pct < 50 ? ' ← LAG' : '';
  return `  ${name} ${day.date}: ${pad(day.persons)}/${cap} (${pad(pct, 2)}%)${flag}`;
}

function actionLabel(action) {
  const typeLabels = {
    flash_meta:         'Meta blixtannons',
    flash_google_ads:   'Google Ads blixt',
    flash_mailchimp:    'Mailchimp blixt',
    proactive_google_ads: 'Google Ads proaktiv AW',
    proactive_mailchimp:  'Mailchimp proaktiv AW'
  };
  const spendStr = action.estimatedSpend > 0 ? `~${action.estimatedSpend} kr` : '0 kr (ingen annons)';
  return `  [${action.id}]  ${typeLabels[action.type] || action.type} ${action.dayName} ${action.targetDate.slice(5)} (${action.occupancyPct}%, ${action.daysAway} dgr)  ${spendStr}`;
}

// ─── dispatch ─────────────────────────────────────────────────────────────────

async function executeAction(action) {
  switch (action.type) {
    case 'flash_meta':           return meta.runFlash(action);
    case 'flash_google_ads':     return googleAds.runFlash(action);
    case 'proactive_google_ads': return googleAds.runProactive(action);
    case 'flash_mailchimp':      return mailchimp.runFlash(action);
    case 'proactive_mailchimp':  return mailchimp.runProactive(action);
    default: throw new Error(`Unknown action type: ${action.type}`);
  }
}

// ─── report mode ─────────────────────────────────────────────────────────────

async function runReport() {
  console.log(`\n=== StarKaraoke Monitor ${new Date().toISOString()} ===\n`);

  const occupancy = await funbutler.fetchRange(14);
  const state = stateLib.load();

  const lines = occupancy.map(formatOccupancyLine).filter(Boolean);
  const occupancyBlock = lines.join('\n');
  console.log('Kommande öppetdagar:');
  console.log(occupancyBlock);

  const allActions = decide(occupancy);
  const newActions = allActions.filter(a => !stateLib.isExecuted(state, a.id));

  const remaining = stateLib.remainingBudget(state);
  const spent = stateLib.getMonthlySpend(state);

  // Filter by budget
  let runningCost = 0;
  const affordable = newActions.filter(a => {
    if (runningCost + a.estimatedSpend <= remaining) {
      runningCost += a.estimatedSpend;
      return true;
    }
    return false;
  });
  const budgetBlocked = newActions.filter(a => !affordable.includes(a));

  stateLib.upsertPending(state, affordable);
  stateLib.save(state);

  const budgetLine = `Budget: ${spent} kr förbrukad, ${remaining} kr kvar av ${stateLib.MONTHLY_BUDGET} kr/mån`;
  console.log(`\n${budgetLine}`);

  if (affordable.length === 0) {
    const noneMsg = newActions.length === 0
      ? 'Inga åtgärder behövs – beläggningen är OK.'
      : 'Inga åtgärder ryms inom budgeten.';
    console.log(`\n${noneMsg}`);

    await telegram.send(
      `<b>StarKaraoke Dagrapport</b>\n\n${occupancyBlock}\n\n${budgetLine}\n\n${noneMsg}`
    );
    return;
  }

  const actionLines = affordable.map(actionLabel).join('\n');
  console.log('\nRekommenderade åtgärder (väntar på godkännande):');
  console.log(actionLines);

  if (budgetBlocked.length > 0) {
    console.log(`\n${budgetBlocked.length} åtgärder blockerade av budget.`);
  }

  console.log('\nGodkänn: säg "execute <id>" till agenten för att köra en åtgärd.');

  const tgMsg =
    `<b>StarKaraoke Dagrapport</b>\n\n` +
    `<pre>${occupancyBlock}</pre>\n\n` +
    `${budgetLine}\n\n` +
    `<b>Väntar på godkännande:</b>\n<pre>${actionLines}</pre>\n\n` +
    `Svara med: <code>execute &lt;id&gt;</code>`;

  await telegram.send(tgMsg);
}

// ─── execute mode ─────────────────────────────────────────────────────────────

async function runExecute(actionId) {
  const state = stateLib.load();

  if (stateLib.isExecuted(state, actionId)) {
    const msg = `Åtgärd ${actionId} är redan utförd.`;
    console.log(msg);
    await telegram.send(msg);
    return;
  }

  const action = stateLib.findPending(state, actionId);
  if (!action) {
    const msg = `Åtgärd ${actionId} hittades inte i väntande listan. Kör --report för att uppdatera.`;
    console.error(msg);
    await telegram.send(`⚠️ ${msg}`);
    process.exit(1);
  }

  const remaining = stateLib.remainingBudget(state);
  if (action.estimatedSpend > remaining) {
    const msg = `Budget otillräcklig för ${actionId}: behövs ${action.estimatedSpend} kr, kvar ${remaining} kr.`;
    console.error(msg);
    await telegram.send(`⚠️ ${msg}`);
    process.exit(1);
  }

  console.log(`Kör: ${actionId} (${action.type} för ${action.dayName} ${action.targetDate})...`);

  let result;
  try {
    result = await executeAction(action);
  } catch (err) {
    const msg = `Fel vid körning av ${actionId}: ${err.message}`;
    console.error(msg);
    await telegram.send(`❌ ${msg}`);
    process.exit(1);
  }

  stateLib.markExecuted(state, actionId, result);
  stateLib.recordSpend(state, action.estimatedSpend);
  stateLib.save(state);

  const spent = stateLib.getMonthlySpend(state);
  const newRemaining = stateLib.remainingBudget(state);
  const summary = `✅ ${actionId} utförd.\nResultat: ${result}\nBudget: ${spent} kr förbrukad, ${newRemaining} kr kvar.`;
  console.log(summary);
  await telegram.send(summary);
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const [,, mode, arg] = process.argv;

  if (mode === '--report') {
    await runReport();
  } else if (mode === '--execute' && arg) {
    await runExecute(arg);
  } else {
    console.error('Usage: monitor.js --report | --execute <action-id>');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  telegram.send(`❌ StarKaraoke Monitor fatal: ${err.message}`).finally(() => process.exit(1));
});
