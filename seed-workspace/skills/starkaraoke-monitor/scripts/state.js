const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '..', 'state', 'state.json');
const MONTHLY_BUDGET = 5000; // kr hard cap

function load() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { monthlySpend: {}, executedActionIds: [], pendingActions: [], executionLog: [] };
  }
}

function save(state) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function monthKey() {
  return new Date().toISOString().slice(0, 7); // 'YYYY-MM'
}

function getMonthlySpend(state) {
  return state.monthlySpend?.[monthKey()] || 0;
}

function remainingBudget(state) {
  return MONTHLY_BUDGET - getMonthlySpend(state);
}

function recordSpend(state, amount) {
  const key = monthKey();
  if (!state.monthlySpend) state.monthlySpend = {};
  state.monthlySpend[key] = (state.monthlySpend[key] || 0) + amount;
}

function isExecuted(state, actionId) {
  return (state.executedActionIds || []).includes(actionId);
}

function markExecuted(state, actionId, result) {
  if (!state.executedActionIds) state.executedActionIds = [];
  if (!state.executionLog) state.executionLog = [];
  state.executedActionIds.push(actionId);
  state.executionLog.push({ id: actionId, executedAt: new Date().toISOString(), result });
  // Remove from pending
  state.pendingActions = (state.pendingActions || []).filter(a => a.id !== actionId);
}

function upsertPending(state, actions) {
  if (!state.pendingActions) state.pendingActions = [];
  for (const action of actions) {
    const existing = state.pendingActions.findIndex(a => a.id === action.id);
    if (existing >= 0) {
      state.pendingActions[existing] = { ...action, updatedAt: new Date().toISOString() };
    } else {
      state.pendingActions.push({ ...action, createdAt: new Date().toISOString() });
    }
  }
  // Remove pending actions whose targetDate has passed
  const today = new Date().toISOString().slice(0, 10);
  state.pendingActions = state.pendingActions.filter(a => a.targetDate >= today);
}

function findPending(state, actionId) {
  return (state.pendingActions || []).find(a => a.id === actionId) || null;
}

module.exports = { load, save, getMonthlySpend, remainingBudget, recordSpend, isExecuted, markExecuted, upsertPending, findPending, MONTHLY_BUDGET };
