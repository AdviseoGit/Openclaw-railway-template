// Deterministic rules engine — mirrors the rules in MEMORY.md

const OPEN_DOW = new Set([3, 4, 5, 6]); // Wed=3, Thu=4, Fri=5, Sat=6
const CAPACITY = { 3: 300, 4: 300, 5: 510, 6: 510 };
const DOW_NAMES = { 3: 'Ons', 4: 'Tor', 5: 'Fre', 6: 'Lör' };

const ESTIMATED_SPEND = {
  flash_meta: 150,
  flash_google_ads: 250,
  flash_mailchimp: 0,
  proactive_google_ads: 300,
  proactive_mailchimp: 0
};

function getDow(dateStr) {
  // dateStr = 'YYYY-MM-DD'; parse as local noon to avoid DST edge cases
  return new Date(dateStr + 'T12:00:00').getDay();
}

function daysUntil(dateStr) {
  const todayMs = Date.now() - (Date.now() % 86400000); // midnight UTC
  const targetMs = new Date(dateStr + 'T00:00:00Z').getTime();
  return Math.round((targetMs - todayMs) / 86400000);
}

function actionId(dateStr, type) {
  return `sk_${dateStr}_${type}`;
}

function decide(occupancyData) {
  const actions = [];

  for (const day of occupancyData) {
    const dow = getDow(day.date);
    if (!OPEN_DOW.has(dow)) continue;

    const capacity = CAPACITY[dow];
    const pct = Math.round((day.persons / capacity) * 100);
    const daysAway = daysUntil(day.date);
    const dayName = DOW_NAMES[dow];

    if (daysAway < 0 || daysAway > 14) continue;

    const base = { targetDate: day.date, dayName, occupancyPct: pct, persons: day.persons, capacity, daysAway };

    if (daysAway <= 7 && pct < 30) {
      actions.push({ ...base, id: actionId(day.date, 'flash_meta'), type: 'flash_meta', estimatedSpend: ESTIMATED_SPEND.flash_meta });
      actions.push({ ...base, id: actionId(day.date, 'flash_google_ads'), type: 'flash_google_ads', estimatedSpend: ESTIMATED_SPEND.flash_google_ads });
    }

    if (daysAway <= 3 && pct < 50) {
      actions.push({ ...base, id: actionId(day.date, 'flash_mailchimp'), type: 'flash_mailchimp', estimatedSpend: ESTIMATED_SPEND.flash_mailchimp });
    }

    if (daysAway >= 8 && daysAway <= 14 && pct < 50) {
      actions.push({ ...base, id: actionId(day.date, 'proactive_google_ads'), type: 'proactive_google_ads', estimatedSpend: ESTIMATED_SPEND.proactive_google_ads });
    }

    if (daysAway >= 8 && daysAway <= 14 && pct < 30) {
      actions.push({ ...base, id: actionId(day.date, 'proactive_mailchimp'), type: 'proactive_mailchimp', estimatedSpend: ESTIMATED_SPEND.proactive_mailchimp });
    }
  }

  return actions;
}

module.exports = { decide, CAPACITY, OPEN_DOW, DOW_NAMES };
