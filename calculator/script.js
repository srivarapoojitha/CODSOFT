/* ============================================================
   CALCULATOR — script.js
   ============================================================ */

/* ============================================================
   DOM REFERENCES
   ============================================================ */
const exprEl        = document.getElementById('expr-display');
const resultEl      = document.getElementById('result-display');
const histPanel     = document.getElementById('history-panel');
const histList      = document.getElementById('history-list');
const toastEl       = document.getElementById('toast');
const themeBtn      = document.getElementById('theme-btn');
const themeIcon     = document.getElementById('theme-icon');
const histToggleBtn = document.getElementById('hist-toggle-btn');
const clearHistBtn  = document.getElementById('clear-hist-btn');
const copyBtn       = document.getElementById('copy-btn');

/* ============================================================
   STATE VARIABLES
   ============================================================ */
let firstNum     = null;   // Left operand (number)
let operator     = null;   // Pending operator ( + − × ÷ )
let secondNum    = null;   // Right operand (number)
let displayStr   = '0';    // What shows on the big result display
let exprStr      = '';     // What shows on the small expression line
let typingSecond = false;  // True when user is typing the second number
let justCalc     = false;  // True right after pressing =
let history      = [];     // Array of { expr, result } objects

/* ============================================================
   RENDER — updates the display from current state
   ============================================================ */
function render() {
  resultEl.textContent = displayStr;
  exprEl.textContent   = exprStr;

  // Auto-shrink font size for long numbers
  const len = displayStr.length;
  resultEl.style.fontSize =
    len > 14 ? '20px' :
    len > 11 ? '26px' :
    len > 8  ? '34px' : '42px';
}

/* ============================================================
   UTILITY — show a brief toast notification
   ============================================================ */
let toastTimer;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
}

/* ============================================================
   UTILITY — result pop animation (triggered on =)
   ============================================================ */
function popResult() {
  resultEl.classList.remove('result-pop');
  void resultEl.offsetWidth; // force reflow to restart animation
  resultEl.classList.add('result-pop');
}

/* ============================================================
   UTILITY — shake the display on error
   ============================================================ */
function shakeDisplay() {
  const d = document.getElementById('display-area');
  d.classList.remove('shake');
  void d.offsetWidth;
  d.classList.add('shake');
  d.addEventListener('animationend', () => d.classList.remove('shake'), { once: true });
}

/* ============================================================
   UTILITY — format a number, removing floating-point noise
   ============================================================ */
function fmt(n) {
  if (!isFinite(n) || isNaN(n)) return 'Error';
  // Round to 10 decimal places to kill floating-point noise (e.g. 0.1+0.2)
  const rounded = Math.round(n * 1e10) / 1e10;
  return parseFloat(rounded.toPrecision(12)).toString();
}

/* ============================================================
   CORE — perform arithmetic
   ============================================================ */
function calculate(a, op, b) {
  switch (op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? null : a / b; // null signals divide-by-zero
    default:  return b;
  }
}

/* ============================================================
   HANDLER — digit button pressed (0–9)
   ============================================================ */
function handleDigit(d) {
  if (justCalc) {
    // Start a fresh calculation after pressing =
    firstNum     = null;
    operator     = null;
    secondNum    = null;
    exprStr      = '';
    typingSecond = false;
    justCalc     = false;
    displayStr   = d;
  } else if (typingSecond) {
    displayStr = (displayStr === '0') ? d : displayStr + d;
  } else {
    displayStr = (displayStr === '0') ? d : displayStr + d;
  }

  // Cap input at 15 digits
  if (displayStr.replace('-', '').length > 15) {
    displayStr = displayStr.slice(0, -1);
  }

  render();
}

/* ============================================================
   HANDLER — decimal point button pressed
   ============================================================ */
function handleDecimal() {
  if (justCalc) {
    // Start fresh with "0."
    displayStr   = '0.';
    firstNum     = null;
    operator     = null;
    secondNum    = null;
    exprStr      = '';
    typingSecond = false;
    justCalc     = false;
    render();
    return;
  }
  // Only add decimal if none already exists
  if (!displayStr.includes('.')) {
    displayStr += '.';
  }
  render();
}

/* ============================================================
   HANDLER — operator button pressed ( + − × ÷ )
   ============================================================ */
function handleOperator(op) {
  justCalc = false;

  // If there's already a pending operation with a second number, chain it
  if (operator !== null && typingSecond && displayStr !== '0') {
    const b   = parseFloat(displayStr);
    const res = calculate(firstNum, operator, b);
    if (res === null) { showDivError(); return; }
    firstNum   = res;
    displayStr = fmt(res);
    exprStr    = fmt(res) + ' ' + op;
  } else {
    // Store the current display as the first number
    firstNum = parseFloat(displayStr);
    exprStr  = displayStr + ' ' + op;
  }

  operator     = op;
  typingSecond = true;
  displayStr   = '0'; // Ready for second number entry
  render();
}

/* ============================================================
   HANDLER — equals button pressed
   ============================================================ */
function handleEquals() {
  // Need an operator and at least one digit of the second number
  if (operator === null || !typingSecond) return;

  const b      = parseFloat(displayStr);
  const result = calculate(firstNum, operator, b);

  if (result === null) { showDivError(); return; }

  const fullExpr  = (exprStr || fmt(firstNum) + ' ' + operator) + ' ' + fmt(b) + ' =';
  const resultFmt = fmt(result);

  // Save to history
  addHistory(fullExpr.replace(' =', ''), resultFmt);

  exprStr    = fullExpr;
  displayStr = resultFmt;

  // Save state so user can chain or type a new number
  firstNum     = result;
  operator     = null;
  secondNum    = b;
  typingSecond = false;
  justCalc     = true;

  render();
  popResult();

  // Persist to localStorage
  localStorage.setItem('calc_last', JSON.stringify({ expr: fullExpr, result: resultFmt }));
}

/* ============================================================
   HANDLER — AC (All Clear)
   ============================================================ */
function handleClear() {
  firstNum     = null;
  operator     = null;
  secondNum    = null;
  displayStr   = '0';
  exprStr      = '';
  typingSecond = false;
  justCalc     = false;
  render();
}

/* ============================================================
   HANDLER — Delete (backspace)
   ============================================================ */
function handleDelete() {
  if (justCalc) { handleClear(); return; }

  if (displayStr.length <= 1 || displayStr === '-0') {
    displayStr = '0';
  } else {
    displayStr = displayStr.slice(0, -1);
    if (displayStr === '-') displayStr = '0';
  }
  render();
}

/* ============================================================
   HANDLER — Percent (÷ 100)
   ============================================================ */
function handlePercent() {
  const val = parseFloat(displayStr);
  if (isNaN(val)) return;
  displayStr = fmt(val / 100);
  render();
}

/* ============================================================
   HANDLER — Negate (+/−)
   ============================================================ */
function handleNegate() {
  if (displayStr === '0') return;
  displayStr = displayStr.startsWith('-')
    ? displayStr.slice(1)
    : '-' + displayStr;
  render();
}

/* ============================================================
   ERROR — Division by zero
   ============================================================ */
function showDivError() {
  displayStr = 'Error';
  render();
  shakeDisplay();
  showToast('Cannot divide by zero');
  setTimeout(handleClear, 1400);
}

/* ============================================================
   HISTORY — add a new entry
   ============================================================ */
function addHistory(expr, result) {
  history.unshift({ expr, result });
  if (history.length > 30) history.pop(); // keep last 30
  renderHistory();
}

/* ============================================================
   HISTORY — render the history list in the panel
   ============================================================ */
function renderHistory() {
  if (history.length === 0) {
    histList.innerHTML = '<p class="history-empty">No calculations yet</p>';
    return;
  }

  histList.innerHTML = history.map((h, i) => `
    <div class="history-item" data-index="${i}" role="button" tabindex="0">
      <span class="hist-expr">${h.expr}</span>
      <span class="hist-result">${h.result}</span>
    </div>
  `).join('');

  // Clicking a history item loads that result back into the display
  histList.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', () => {
      const h      = history[parseInt(el.dataset.index)];
      displayStr   = h.result;
      firstNum     = parseFloat(h.result);
      operator     = null;
      typingSecond = false;
      justCalc     = true;
      exprStr      = h.expr + ' =';
      render();
      showToast('Result loaded');
    });
  });
}

/* ============================================================
   BUTTON CLICK — attach listeners to all calc buttons
   ============================================================ */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', e => {
    addRipple(btn, e);

    const action = btn.dataset.action;
    const value  = btn.dataset.value;

    switch (action) {
      case 'digit':    handleDigit(value);   break;
      case 'decimal':  handleDecimal();       break;
      case 'operator': handleOperator(value); break;
      case 'equals':   handleEquals();        break;
      case 'clear':    handleClear();         break;
      case 'delete':   handleDelete();        break;
      case 'percent':  handlePercent();       break;
      case 'negate':   handleNegate();        break;
    }
  });
});

/* ============================================================
   RIPPLE — create a ripple effect on button click
   ============================================================ */
function addRipple(btn, e) {
  const r     = document.createElement('span');
  r.className = 'ripple';
  const rect  = btn.getBoundingClientRect();
  r.style.left = (e.clientX - rect.left) + 'px';
  r.style.top  = (e.clientY - rect.top)  + 'px';
  btn.appendChild(r);
  r.addEventListener('animationend', () => r.remove());
}

/* ============================================================
   KEYBOARD SUPPORT
   Keys: 0-9, + - * /, Enter, Backspace, Escape, %, H, T
   ============================================================ */
document.addEventListener('keydown', e => {
  const k = e.key;

  if (k >= '0' && k <= '9') { handleDigit(k); return; }

  switch (k) {
    case '+':         handleOperator('+');               break;
    case '-':         handleOperator('−');               break;
    case '*':         handleOperator('×');               break;
    case '/':         e.preventDefault(); handleOperator('÷'); break;
    case '.':
    case ',':         handleDecimal();                   break;
    case 'Enter':
    case '=':         handleEquals();                    break;
    case 'Backspace': handleDelete();                    break;
    case 'Escape':    handleClear();                     break;
    case '%':         handlePercent();                   break;
    case 'h':
    case 'H':         toggleHistory();                   break;
    case 't':
    case 'T':         toggleTheme();                     break;
  }
});

/* ============================================================
   THEME TOGGLE — switches between dark and light mode
   ============================================================ */
const moonSVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>`;
const sunSVG  = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;

function toggleTheme() {
  const isDark = document.documentElement.dataset.theme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'light' : 'dark';
  themeIcon.innerHTML = isDark ? moonSVG : sunSVG;
  localStorage.setItem('calc_theme', isDark ? 'light' : 'dark');
}

themeBtn.addEventListener('click', toggleTheme);

/* ============================================================
   HISTORY PANEL — open/close the sliding history panel
   ============================================================ */
function toggleHistory() {
  histPanel.classList.toggle('open');
}

histToggleBtn.addEventListener('click', toggleHistory);

clearHistBtn.addEventListener('click', () => {
  history = [];
  renderHistory();
});

/* ============================================================
   COPY RESULT — copies the current result to clipboard
   ============================================================ */
copyBtn.addEventListener('click', () => {
  if (!displayStr || displayStr === '0') return;
  navigator.clipboard.writeText(displayStr)
    .then(() => showToast('Copied!'))
    .catch(() => showToast('Copy failed'));
});

/* ============================================================
   INIT — runs once on page load
   ============================================================ */
(function init() {
  // Restore saved theme
  const savedTheme = localStorage.getItem('calc_theme') || 'dark';
  document.documentElement.dataset.theme = savedTheme;
  themeIcon.innerHTML = savedTheme === 'light' ? moonSVG : sunSVG;

  // Restore last calculation from localStorage
  try {
    const last = JSON.parse(localStorage.getItem('calc_last'));
    if (last && last.result && last.result !== 'Error') {
      displayStr = last.result;
      exprStr    = 'Last: ' + last.expr;
      firstNum   = parseFloat(last.result);
      justCalc   = true;
    }
  } catch (_) {
    // Ignore any parse errors
  }

  render();
  renderHistory();
})();
