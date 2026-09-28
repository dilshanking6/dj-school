// ============================================================
//  CHEMICAL EQUATION BALANCER — exact atom-counting engine
//  Used by the Virtual Lab: checks balance and teaches the
//  step-by-step method. Pure vanilla JS, works offline.
// ============================================================

function bEscape(s) {
  return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// Convert all unicode subscript digits to plain digits.
function bNorm(s) {
  const D = {'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9'};
  return String(s).replace(/[₀-₉]/g, m => D[m]);
}

// Parse a chemical formula into {Element: count}. Handles parens + subscripts.
function parseFormula(f) {
  const SUBS = bNorm(String(f || '').replace(/\(aq\)|\(s\)|\(g\)|\(l\)|↓|↑|\s+/g, ''));
  let i = 0;
  function readGroup() {
    const local = {};
    while (i < SUBS.length) {
      const ch = SUBS[i];
      if (ch === ')') { i++; break; } // caller multiplies
      if (ch === '(') { i++; const inner = readGroup(); let mul = 0; while (i < SUBS.length && /\d/.test(SUBS[i])) { mul = mul * 10 + +SUBS[i]; i++; } if (!mul) mul = 1; for (const k in inner) local[k] = (local[k] || 0) + inner[k] * mul; continue; }
      if (ch === '[') { i++; const inner = readGroup(); let mul = 0; while (i < SUBS.length && /\d/.test(SUBS[i])) { mul = mul * 10 + +SUBS[i]; i++; } if (!mul) mul = 1; for (const k in inner) local[k] = (local[k] || 0) + inner[k] * mul; continue; }
      if (/[A-Z]/.test(ch)) {
        let sym = ch; i++;
        while (i < SUBS.length && /[a-z]/.test(SUBS[i])) { sym += SUBS[i]; i++; }
        let n = 0; while (i < SUBS.length && /\d/.test(SUBS[i])) { n = n * 10 + +SUBS[i]; i++; } if (!n) n = 1;
        local[sym] = (local[sym] || 0) + n;
        continue;
      }
      if (ch === '·' || ch === '.') { i = SUBS.length; continue; } // hydrates ignored entirely
      i++;
    }
    return local;
  }
  const counts = readGroup();
  return counts;
}

function splitTokens(raw) {
  return String(raw || '').split('+').map(t => t.trim()).filter(Boolean).map(t => {
    const m = /^(\d+\.?\d*|\.\d+)\s*([\s\S]*)$/.exec(t);
    if (m && m[1] && m[2]) return { coeff: parseFloat(m[1]), form: m[2] };
    return { coeff: 1, form: t };
  });
}

// Decompose "A + B → C + D" → { lhs:[{coeff,form}...], rhs:[...], arrow }
function bDecompose(eqStr) {
  let s = bNorm(String(eqStr || '').trim());
  let arrow = '→';
  let pos = s.search(/→|⇌|=/);
  if (pos < 0) { s += ' → '; pos = s.indexOf('→'); }
  const lhsRaw = s.slice(0, pos);
  const rhsRaw = s.slice(pos + 1);
  return { lhs: splitTokens(lhsRaw), rhs: splitTokens(rhsRaw), arrow };
}

// Total atom counts for one side (multiply each species by its coefficient).
function atomsOf(tokens) {
  const total = {};
  tokens.forEach(t => {
    const c = parseFormula(t.form);
    const k = t.coeff || 1;
    for (const e in c) total[e] = (total[e] || 0) + c[e] * k;
  });
  return total;
}

// atomsL / atomsR + balanced verdict. Returns null when unparseable.
function checkBalance(eqStr) {
  try {
    const { lhs, rhs } = bDecompose(eqStr);
    const L = atomsOf(lhs), R = atomsOf(rhs);
    const keys = Object.keys(L).concat(Object.keys(R)).filter((v, i, a) => a.indexOf(v) === i);
    for (const k of keys) if ((L[k] || 0) !== (R[k] || 0)) return { L, R, keys, balanced: false };
    return { L, R, keys, balanced: true };
  } catch (e) { return null; }
}

// ---------- integer-normalization helpers ----------
function fracOf(v) {
  if (Math.abs(v - Math.round(v)) < 1e-9) return { n: Math.round(v), d: 1 };
  for (let d = 1; d <= 500; d++) {
    const n = Math.round(v * d);
    if (Math.abs(v * d - n) < 1e-5 * (1 + Math.abs(v * d))) return { n, d };
  }
  return null;
}
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = b; b = a % b; a = t; } return a; }
function lcm(a, b) { return a / gcd(a, b) * b; }

// ---------- Gauss-Jordan null space ----------
function computeBalancing(lhs, rhs) {
  const formsL = lhs.map(t => (typeof t === 'string' ? t : t.form));
  const formsR = rhs.map(t => (typeof t === 'string' ? t : t.form));
  const species = formsL.concat(formsR);
  const allElems = [];
  const atom = [];
  species.forEach(t => atom.push(parseFormula(t)));
  atom.forEach(c => { for (const k in c) if (allElems.indexOf(k) < 0) allElems.push(k); });

  // rows = elements, cols = species. LHS gets -count, RHS +count  → A·v = 0
  const rows = allElems.filter(e => atom.some(c => (c[e] || 0) !== 0));
  if (!rows.length) return null;
  const m = rows.map(e => species.map((_, j) => (j < lhs.length ? -1 : 1) * (atom[j][e] || 0)));

  // RREF
  const R = m.map(r => r.slice());
  const nr = R.length, nc = species.length;
  let pivRow = 0;
  const pivots = [];
  for (let col = 0; col < nc && pivRow < nr; col++) {
    let sel = -1;
    for (let r = pivRow; r < nr; r++) if (Math.abs(R[r][col]) > 1e-9) { sel = r; break; }
    if (sel < 0) continue;
    [R[pivRow], R[sel]] = [R[sel], R[pivRow]];
    const pv = R[pivRow][col];
    for (let c2 = 0; c2 < nc; c2++) R[pivRow][c2] /= pv;
    for (let r = 0; r < nr; r++) {
      if (r === pivRow) continue;
      const f = R[r][col];
      if (Math.abs(f) < 1e-12) continue;
      for (let c2 = 0; c2 < nc; c2++) R[r][c2] -= f * R[pivRow][c2];
    }
    pivots[col] = pivRow;
    pivRow++;
  }

  const free = [];
  for (let c = 0; c < nc; c++) if (pivots[c] === undefined) free.push(c);
  if (!free.length) return null; // only trivial solution

  // basis for null space: one vector per free var
  const basis = [];
  free.forEach(fc => {
    const x = new Array(nc).fill(0);
    x[fc] = 1;
    for (let c = 0; c < nc; c++) {
      if (pivots[c] === undefined) continue;
      const row = pivots[c];
      let s = 0;
      for (let c2 = 0; c2 < nc; c2++) if (c2 !== c) s += -R[row][c2] * x[c2];
      x[c] = s;
    }
    basis.push(x);
  });

  // combine with all-ones weights (works for our 1-DOF classroom equations)
  const x = new Array(nc).fill(0);
  basis.forEach(b => { for (let c = 0; c < nc; c++) x[c] += b[c]; });

  // normalize to smallest positive integers
  const fr = x.map(fracOf);
  if (fr.some(f => !f)) return null;
  let den = 1;
  fr.forEach(f => { den = lcm(den, f.d); });
  let ints = x.map((v, j) => Math.round(v * den));
  let g = 1;
  ints.forEach(v => g = gcd(g, v));
  if (g > 1) ints = ints.map(v => v / g);
  if (ints.some(v => !Number.isInteger(v))) return null;

  // drop the trivial all-zero case (no species present twice)
  const negL = ints.slice(0, lhs.length).some(v => v < 0);
  const negR = ints.slice(lhs.length).some(v => v < 0);
  if (negL || negR) return null; // equation cannot balance as written
  return { coeffs: ints, weights: x };
}

function balanceEquation(eqStr) {
  try {
    const { lhs, rhs, arrow } = bDecompose(eqStr);
    const sol = computeBalancing(lhs, rhs);
    if (!sol) return null;
    const lhsCoeff = sol.coeffs.slice(0, lhs.length);
    const rhsCoeff = sol.coeffs.slice(lhs.length);
    const build = (t, c) => {
      const c1 = Math.round(c);
      if (c1 === 1) return t.form;
      return c1 + t.form;
    };
    const eqText = lhs.map((t, i) => build(t, lhsCoeff[i])).join(' + ') + ' ' + arrow + ' ' + rhs.map((t, i) => build(t, rhsCoeff[i])).join(' + ');
    return { lhs, rhs, lhsCoeff, rhsCoeff, eq: eqText, arrow };
  } catch (e) { return null; }
}

// ---------- step-by-step teaching ----------
function bracketText(eq) {
  return bEscape(eq);
}

function balanceSteps(eqStr) {
  const { lhs, rhs, arrow } = bDecompose(eqStr);
  const L = atomsOf(lhs), R = atomsOf(rhs);
  const keys = Object.keys(L).concat(Object.keys(R)).filter((v, i, a) => a.indexOf(v) === i);
  const rows = keys.map(k => ({ el: k, l: L[k] || 0, r: R[k] || 0 }));

  const steps = [];
  steps.push(`समीकरण लिखो: <b>${bracketText(eqStr)}</b>`);
  steps.push(`चरण 1 — हर तत्व के परमाणु गिनो (बाईं ओर vs दाईं ओर):`);
  let unbalancedEls = rows.filter(r => r.l !== r.r);
  const diff = unbalancedEls.map(r => `${r.el}: ${r.l} ≠ ${r.r}`).join('; ') || 'सभी बराबर ✓';
  steps.push(`<div class="bal-table">${rows.map(r => `<div class="bal-row"><span>${r.el}</span><b>${r.l}</b><i>${r.l === r.r ? '=' : '≠'}</i><b>${r.r}</b></div>`).join('')}${rows.length ? '' : '<i>कोई तत्व नहीं मिला</i>'}</div>`);
  steps.push(`<div class="bal-diff">${diff}</div>`);

  steps.push(`चरण 2 — उस तत्व से शुरू करो जो दोनों ओर सिर्फ़ एक-एक यौगिक में है। फिर ऐसे गुणांक (coefficient) डालो कि दोनों ओर के परमाणु बराबर हो जाएँ।`);
  steps.push('चरण 3 — हर बार डालने के बाद फिर गिनो। अगर अंश (fraction) आ जाए, तो पूरे समीकरण को ऐसी संख्या से गुणा करो जिससे सब पूर्णांक हो जाएँ।');

  const sol = balanceEquation(eqStr);
  if (sol) {
    const tblL = {};
    lhs.forEach((sp, i) => { if (!tblL[sp]) tblL[sp] = sol.lhsCoeff[i]; });
    steps.push(`चरण 4 — संतुलित समीकरण: <b class="bal-ans">${bracketText(sol.eq)}</b>`);
    steps.push(`जाँच: दोनों ओर हर तत्व के परमाणु अब बराबर हैं ✓ (परमाणु न तो बनते हैं न मिटते हैं — बस इधर से उधर जाते हैं।)`);
  } else {
    steps.push('<div class="bal-diff">इस समीकरण को स्वतः संतुलित करना इस संस्करण में संभव नहीं — परमाणु गिनती के नियम से हाथ से करो।</div>');
  }
  return steps.join('\n');
}

const BAL_PRACTICE = [
  'H2 + O2 → H2O',
  'Fe + O2 → Fe2O3',
  'H2SO4 + NaOH → Na2SO4 + H2O',
  'Al + HCl → AlCl3 + H2',
  'CH4 + O2 → CO2 + H2O',
  'NaHCO3 → Na2CO3 + CO2 + H2O',
  'FeCl3 + NaOH → Fe(OH)3 + NaCl',
  'C3H8 + O2 → CO2 + H2O',
  'N2 + H2 → NH3',
  'KClO3 → KCl + O2',
  'Zn + AgNO3 → Zn(NO3)2 + Ag',
  'CaCO3 → CaO + CO2'
];

// ---------- UI ----------
function renderBalanceLab(elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = `
    <div class="bal-wrap">
      <div class="bal-head">
        <h3>⚖️ रासायनिक समीकरण संतुलन — सीखो और अभ्यास करो</h3>
        <p>नीचे किसी समीकरण पर click करो — हर तत्व के परमाणु गिने (LHS vs RHS), फिर चरण-दर-चरण संतुलित समीकरण देखो।</p>
      </div>
      <div class="bal-chips" id="balChips"></div>
      <div class="bal-out" id="balOut"></div>
      <div class="bal-custom">
        <input id="balInput" placeholder="अपना समीकरण लिखो, जैसे: H2 + O2 → H2O (→ या = लिखो)" value="">
        <button class="btn" onclick="balCustom()">⚖️ संतुलन जाँचो</button>
      </div>
    </div>`;
  const chips = document.getElementById('balChips');
  chips.innerHTML = BAL_PRACTICE.map(s =>
    `<button class="ml-chip" onclick="document.getElementById('balInput').value='${s.replace(/'/g, '')}';balCustom()">${bEscape(s).replace(/→/g, '➞')}</button>`
  ).join('');
}

function balCustom() {
  const input = document.getElementById('balInput');
  const out = document.getElementById('balOut');
  if (!input || !out) return;
  const eq = input.value.trim();
  if (!eq) { out.innerHTML = '<div class="bal-diff">पहले समीकरण लिखो।</div>'; return; }
  out.innerHTML = `<div class="bal-card">${balanceSteps(eq)}</div>`;
}

function openBalancer(eq, outId) {
  if (typeof document === 'undefined') return;
  let out = document.getElementById(outId);
  if (!out) {
    const el2 = document.getElementById('balOut');
    if (el2) out = el2; else return;
  }
  const input = document.getElementById('balInput');
  if (input) input.value = eq;
  out.innerHTML = `<div class="bal-card">${balanceSteps(eq)}</div>`;
  const head = document.querySelector('#balanceLabSection');
  if (head) head.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseFormula, bDecompose, checkBalance, balanceEquation, balanceSteps, computeBalancing, BAL_PRACTICE, renderBalanceLab, balCustom };
}