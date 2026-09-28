// ============================================================
//  MATH LAB — JAC Class 10
//  Graph plotter, equation solver (x निकालो), derivative
//  calculator (d निकालो), AP and coordinate-geometry tools.
//  Pure vanilla JS — works offline on file://.
// ============================================================

// ---------- GraphLab: Advanced Canvas Grapher ----------
const GL_COLORS = ['#1976d2','#e53935','#43a047','#8e24aa','#fb8c00','#00897b','#d81b60','#5c6bc0'];
let glExprs = [{ id:1, value:'x^2', color:GL_COLORS[0] }];
let glNextId = 2;
let glScale = 50, glOffX = 0, glOffY = 0;
let glDragging = false, glLastX = 0, glLastY = 0;
let glCanvas, glCtx;

function glInit() {
  glCanvas = document.getElementById('glCanvas');
  if (!glCanvas) return;
  glCtx = glCanvas.getContext('2d');
  glResize();
  glRenderExprs();
  glBindEvents();
  window.addEventListener('resize', glResize);
}

function glResize() {
  if (!glCanvas) return;
  const r = glCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  glCanvas.width = r.width * dpr;
  glCanvas.height = r.height * dpr;
  glCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  glDraw();
}

function glW2S(x, y) {
  const w = glCanvas.clientWidth, h = glCanvas.clientHeight;
  return { x: w / 2 + glOffX + x * glScale, y: h / 2 + glOffY - y * glScale };
}
function glS2W(sx, sy) {
  const w = glCanvas.clientWidth, h = glCanvas.clientHeight;
  return { x: (sx - w / 2 - glOffX) / glScale, y: -(sy - h / 2 - glOffY) / glScale };
}

function glDraw() {
  if (!glCtx || !glCanvas) return;
  const W = glCanvas.clientWidth, H = glCanvas.clientHeight;
  const c = glCtx;
  c.clearRect(0, 0, W, H);
  c.fillStyle = '#fff';
  c.fillRect(0, 0, W, H);

  const cx = W / 2 + glOffX, cy = H / 2 + glOffY;

  // Grid
  c.lineWidth = 1;
  c.strokeStyle = '#f0f0f0';
  for (let x = cx % glScale; x < W; x += glScale) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
  for (let y = cy % glScale; y < H; y += glScale) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }

  // Axes
  c.strokeStyle = '#888';
  c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(0, cy); c.lineTo(W, cy); c.stroke();
  c.beginPath(); c.moveTo(cx, 0); c.lineTo(cx, H); c.stroke();

  // Tick labels
  c.fillStyle = '#666';
  c.font = '11px Consolas, monospace';
  const step = glScale;
  for (let x = cx + step; x < W; x += step) { const v = Math.round((x - cx) / glScale); if (v !== 0) c.fillText(v, x + 3, cy - 5); }
  for (let x = cx - step; x > 0; x -= step) { const v = Math.round((x - cx) / glScale); if (v !== 0) c.fillText(v, x + 3, cy - 5); }
  for (let y = cy - step; y > 0; y -= step) { const v = Math.round((cy - y) / glScale); if (v !== 0) c.fillText(v, cx + 5, y - 3); }
  for (let y = cy + step; y < H; y += step) { const v = Math.round((cy - y) / glScale); if (v !== 0) c.fillText(v, cx + 5, y - 3); }

  // Origin
  c.fillStyle = '#888';
  c.fillText('O', cx - 14, cy + 14);

  // Plot each expression
  glExprs.forEach(expr => {
    if (!expr.value.trim()) return;
    let fn;
    try { fn = parseMath(expr.value); } catch (e) { return; }
    c.strokeStyle = expr.color;
    c.lineWidth = 2.5;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.beginPath();
    let started = false;
    for (let px = 0; px < W; px++) {
      const w = glS2W(px, 0);
      let y;
      try { y = fn(w.x); } catch (e) { y = NaN; }
      if (!isFinite(y)) { started = false; continue; }
      const s = glW2S(w.x, y);
      if (s.y < -5000 || s.y > H + 5000) { started = false; continue; }
      if (!started) { c.moveTo(s.x, s.y); started = true; } else { c.lineTo(s.x, s.y); }
    }
    c.stroke();

    // Mark roots (where y ≈ 0)
    try {
      const roots = [];
      const N = 800;
      const xMin = glS2W(0, 0).x, xMax = glS2W(W, 0).x;
      const dx = (xMax - xMin) / N;
      let prevY = null, prevX = null;
      for (let k = 0; k <= N; k++) {
        const xv = xMin + dx * k;
        let yv;
        try { yv = fn(xv); } catch (e) { yv = NaN; }
        if (isFinite(yv)) {
          if (prevY !== null && prevY * yv <= 0) {
            // bisect
            let a = prevX, b = xv, fa = prevY, fb = yv;
            for (let it = 0; it < 40; it++) {
              const m = (a + b) / 2;
              let fm;
              try { fm = fn(m); } catch (e) { fm = NaN; }
              if (!isFinite(fm)) break;
              if (fa * fm < 0) { b = m; fb = fm; } else { a = m; fa = fm; }
            }
            const r = (a + b) / 2;
            if (!roots.some(z => Math.abs(z - r) < 1e-4)) roots.push(r);
          }
          prevY = yv; prevX = xv;
        } else { prevY = null; }
      }
      roots.forEach(r => {
        const s = glW2S(r, 0);
        c.beginPath();
        c.arc(s.x, s.y, 5, 0, Math.PI * 2);
        c.fillStyle = expr.color;
        c.fill();
        c.strokeStyle = '#fff';
        c.lineWidth = 2;
        c.stroke();
        c.fillStyle = expr.color;
        c.font = 'bold 11px Consolas, monospace';
        c.fillText('x=' + (Math.round(r * 100) / 100), s.x + 8, s.y - 8);
      });
    } catch (e) {}
  });
}

function glRenderExprs() {
  const box = document.getElementById('glExpressions');
  if (!box) return;
  box.innerHTML = '';
  glExprs.forEach(expr => {
    const div = document.createElement('div');
    div.className = 'gl-expr';
    div.innerHTML = `<div class="gl-color-dot" style="background:${expr.color}"></div>` +
      `<input class="gl-expr-input" value="${mlescape(expr.value)}" placeholder="f(x) जैसे x^2" data-id="${expr.id}">` +
      `<button class="gl-expr-del" data-del="${expr.id}">×</button>`;
    box.appendChild(div);
    div.querySelector('.gl-expr-input').addEventListener('input', e => {
      expr.value = e.target.value;
      glDraw();
    });
    div.querySelector('.gl-expr-del').addEventListener('click', () => {
      glExprs = glExprs.filter(e => e.id !== expr.id);
      glRenderExprs();
      glDraw();
    });
  });
}

function glAddExpression() {
  glExprs.push({ id: glNextId++, value: '', color: GL_COLORS[glExprs.length % GL_COLORS.length] });
  glRenderExprs();
  const inputs = document.querySelectorAll('.gl-expr-input');
  if (inputs.length) inputs[inputs.length - 1].focus();
}

function glClearAll() {
  glExprs = [];
  glRenderExprs();
  glDraw();
}

function glResetView() {
  glScale = 50; glOffX = 0; glOffY = 0;
  glDraw();
}

function glZoom(f) {
  glScale *= f;
  glScale = Math.max(8, Math.min(glScale, 600));
  glDraw();
}

function glBindEvents() {
  if (!glCanvas) return;

  // Mouse drag
  glCanvas.addEventListener('mousedown', e => {
    glDragging = true;
    glCanvas.classList.add('dragging');
    glLastX = e.clientX;
    glLastY = e.clientY;
  });
  window.addEventListener('mouseup', () => { glDragging = false; if (glCanvas) glCanvas.classList.remove('dragging'); });
  window.addEventListener('mousemove', e => {
    if (!glDragging) return;
    glOffX += e.clientX - glLastX;
    glOffY += e.clientY - glLastY;
    glLastX = e.clientX;
    glLastY = e.clientY;
    glDraw();
  });

  // Wheel zoom
  glCanvas.addEventListener('wheel', e => {
    e.preventDefault();
    const mx = e.offsetX, my = e.offsetY;
    const before = glS2W(mx, my);
    glScale *= e.deltaY < 0 ? 1.12 : 0.89;
    glScale = Math.max(8, Math.min(glScale, 600));
    const after = glS2W(mx, my);
    glOffX += (after.x - before.x) * glScale;
    glOffY -= (after.y - before.y) * glScale;
    glDraw();
  }, { passive: false });

  // Touch support
  let touchStart = null, pinchDist = null;
  glCanvas.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchDist = Math.sqrt(dx * dx + dy * dy);
    }
  }, { passive: true });
  glCanvas.addEventListener('touchmove', e => {
    if (e.touches.length === 1 && touchStart) {
      glOffX += e.touches[0].clientX - touchStart.x;
      glOffY += e.touches[0].clientY - touchStart.y;
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      glDraw();
    } else if (e.touches.length === 2 && pinchDist) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.sqrt(dx * dx + dy * dy);
      glZoom(newDist / pinchDist);
      pinchDist = newDist;
    }
  }, { passive: true });
  glCanvas.addEventListener('touchend', () => { touchStart = null; pinchDist = null; });

  // Coordinates display
  glCanvas.addEventListener('mousemove', e => {
    const w = glS2W(e.offsetX, e.offsetY);
    const coordEl = document.getElementById('glCoords');
    if (coordEl) coordEl.innerHTML = 'x: ' + w.x.toFixed(2) + ' &nbsp; y: ' + w.y.toFixed(2);
  });

  // Double click to zoom in
  glCanvas.addEventListener('dblclick', e => { e.preventDefault(); glZoom(1.5); });
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', glInit);
}

function mlescape(str) {
  return String(str || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// ---------- safe math expression parser ----------
function parseMath(src) {
  const s = (src || '').replace(/\s+/g, '').toLowerCase();
  let i = 0;
  function fail(msg) { throw new Error('🤔 व्यंजक त्रुटि: ' + msg); }
  function peek() { return s[i]; }
  function next() { return s[i++]; }

  function parseExpr() {
    let left = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = next();
      const right = parseTerm();
      const L = left;
      left = op === '+' ? (x => L(x) + right(x)) : (x => L(x) - right(x));
    }
    return left;
  }
  function parseTerm() {
    let left = parseFactor();
    while (true) {
      const c = peek();
      if (c === '*') {
        next();
        const f = parseFactor();
        const L = left;
        left = (x => L(x) * f(x));
      }
      else if (c === '/') {
        next();
        const f = parseFactor();
        const L = left;
        left = (x => L(x) / f(x));
      }
      else if (c !== undefined && /^(\d|\.|x|sin|cos|tan|asin|acos|atan|sqrt|abs|ln|log|floor|ceil|round|\(|pi|e)/.test(s.slice(i))) {
        // implicit multiplication: 2x, 3(x+1), 2sin(x), xpi ...
        const f = parseFactor();
        const L = left;
        left = (x => L(x) * f(x));
      }
      else break;
    }
    return left;
  }
  function parseFactor() {
    if (peek() === '+') { next(); return parseFactor(); }
    if (peek() === '-') { next(); const f = parseFactor(); return (x => -f(x)); }
    const base = parsePrimary();
    if (peek() === '^') { next(); const e = parseFactor(); return (x => Math.pow(base(x), e(x))); }
    return base;
  }
  function parsePrimary() {
    const c = peek();
    if (c === undefined) fail('व्यंजक खाली है');
    if (c === '(') {
      next(); const inner = parseExpr();
      if (peek() !== ')') fail('")" नहीं मिला');
      next(); return inner;
    }
    const fm = /^(sin|cos|tan|asin|acos|atan|sqrt|abs|ln|log|floor|ceil|round)/.exec(s.slice(i));
    if (fm) {
      i += fm[1].length;
      if (peek() !== '(') fail(fm[1] + ' के बाद "(" चाहिए');
      next();
      const inner = parseExpr();
      if (peek() !== ')') fail(fm[1] + ' के बाद ")" नहीं मिला');
      next();
      const f = {
        sin: Math.sin, cos: Math.cos, tan: Math.tan,
        asin: Math.asin, acos: Math.acos, atan: Math.atan,
        sqrt: Math.sqrt, abs: Math.abs, ln: Math.log,
        log: Math.log10, floor: Math.floor, ceil: Math.ceil, round: Math.round
      }[fm[1]];
      return (x => f(inner(x)));
    }
    const nm = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));
    if (nm) { i += nm[1].length; const v = parseFloat(nm[1]); return (() => v); }
    if (c === 'x') { next(); return (x => x); }
    if (s.startsWith('pi', i)) { i += 2; return () => Math.PI; }
    if (c === 'e') { i += 1; return () => Math.E; }
    fail('अज्ञात प्रतीक "' + c + '" — x, संख्याएँ, sin/cos/tan/sqrt/abs/ln और + - * / ^ ठीक हैं');
  }

  if (!s) fail('व्यंजक दर्ज करें');
  const f = parseExpr();
  if (peek() !== undefined) fail('अज्ञात प्रतीक "' + peek() + '" बचा है');
  return f;
}

function evalExpr(src, x) { return parseMath(src)(x); }

// ---------- pretty number ----------
function mfmt(n) {
  if (typeof n !== 'number' || !isFinite(n)) return '∞';
  if (Math.abs(n) < 1e-10) n = 0;
  const r = Math.round(n * 1e6) / 1e6;
  return String(r);
}

// ---------- tidy tick step ----------
function niceStep(range, target) {
  if (!(range > 0)) return 1;
  const raw = range / Math.max(1, target);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  return step;
}

// ---------- graph drawing (SVG) ----------
function drawGraph(elId, exprStr, xmin, xmax, roots, opts) {
  const svg = document.getElementById(elId);
  if (!svg) return;
  opts = opts || {};
  const W = 640, H = 400, pad = 44;
  let fn;
  try { fn = parseMath(exprStr); }
  catch (e) {
    svg.innerHTML = `<rect x="0" y="0" width="${W}" height="${H}" rx="10" fill="${opts.theme === 'dark' ? '#0b1220' : '#fbfdff'}"/>
      <text x="16" y="118" fill="#dc2626" font-size="16" font-weight="700">⚠️ ${mlescape(e.message)}</text>
      <text x="16" y="148" fill="${opts.theme === 'dark' ? '#64748b' : '#94a3b8'}" font-size="13">सही समीकरण लिखो — जैसे x^2-5x+6, sin(x), 2x+3</text>`;
    return { ok: false };
  }

  xmin = Number(xmin); xmax = Number(xmax);
  if (!isFinite(xmin) || !isFinite(xmax) || xmin >= xmax) { xmin = -10; xmax = 10; }

  const dark = opts.theme === 'dark';
  const curveCol = opts.color || (dark ? '#38bdf8' : '#0ea5e9');
  const bg = dark ? '#0b1220' : '#fbfdff';
  const gridCol = dark ? '#1b2536' : '#e2e8f0';
  const axisCol = dark ? '#475569' : '#334155';
  const arrowCol = dark ? '#475569' : '#334155';
  const tickCol = dark ? '#7d8daa' : '#64748b';
  const fnCol = dark ? '#94a3b8' : '#475569';
  const rootFill = dark ? '#f87171' : '#dc2626';

  const N = 700;
  const dx = (xmax - xmin) / N;
  const pts = [];
  for (let k = 0; k <= N; k++) {
    const xv = xmin + dx * k;
    let y;
    try { y = fn(xv); } catch (e) { y = NaN; }
    pts.push({ x: xv, y });
  }

  let yMin = Infinity, yMax = -Infinity;
  pts.forEach(p => { if (isFinite(p.y)) { if (p.y < yMin) yMin = p.y; if (p.y > yMax) yMax = p.y; } });
  if (!isFinite(yMin)) { yMin = -10; yMax = 10; }
  const span = yMax - yMin;
  if (span > 1e9 || span <= 0) { yMin = -10; yMax = 10; }
  else { const m = (yMax + yMin) / 2; const h = Math.min(Math.max(span * 0.55, 0.5), 50); yMin = m - h; yMax = m + h; }

  const X = x => pad + (x - xmin) / (xmax - xmin) * (W - 2 * pad);
  const Y = y => H - pad - (y - yMin) / (yMax - yMin) * (H - 2 * pad);

  const stepX = niceStep(xmax - xmin, 12);
  const stepY = niceStep(yMax - yMin, 10);

  let grid = '', ticks = '';
  const y0 = (yMin <= 0 && yMax >= 0) ? Y(0) : H - pad;
  const x0 = (xmin <= 0 && xmax >= 0) ? X(0) : pad;

  for (let v = Math.ceil(yMin / stepY) * stepY; v <= yMax + 1e-9; v += stepY) {
    if (Math.abs(v) < 1e-9) continue;
    grid += `<line x1="${pad}" y1="${Y(v)}" x2="${W - pad}" y2="${Y(v)}" stroke="${gridCol}" stroke-width="1"/>`;
    ticks += `<text x="${pad - 10}" y="${Y(v) + 4}" text-anchor="end" fill="${tickCol}" font-size="11">${mfmt(v)}</text>`;
  }
  for (let u = Math.ceil(xmin / stepX) * stepX; u <= xmax - stepX / 2; u += stepX) {
    if (Math.abs(u) < 1e-9) continue;
    grid += `<line x1="${X(u)}" y1="${pad}" x2="${X(u)}" y2="${H - pad}" stroke="${gridCol}" stroke-width="1"/>`;
    ticks += `<text x="${X(u)}" y="${H - pad + 20}" text-anchor="middle" fill="${tickCol}" font-size="11">${mfmt(u)}</text>`;
  }

  // function path (break on gaps / asymptote jumps)
  let d = '', pen = false, segs = 0, firstX = 0, firstY = 0, lastX = 0, lastY = 0;
  for (let k = 0; k < pts.length; k++) {
    const y = pts[k].y;
    if (!isFinite(y)) { pen = false; continue; }
    if (k > 0 && !isFinite(pts[k - 1].y)) { pen = false; }
    const xa = X(pts[k].x).toFixed(2), ya = Y(y).toFixed(2);
    if (pen && Math.abs(y - pts[k - 1].y) > (yMax - yMin) * 5) { pen = false; }
    if (!pen) { segs++; firstX = xa; firstY = ya; }
    d += (pen ? ' L' : ' M') + xa + ' ' + ya;
    lastX = xa; lastY = ya;
    pen = true;
  }

  let rootMarks = '';
  (roots || []).forEach(r => {
    if (isFinite(r) && r >= xmin && r <= xmax) {
      rootMarks += `<circle cx="${X(r)}" cy="${y0}" r="6" fill="${rootFill}" stroke="#fff" stroke-width="2"/>`;
      rootMarks += `<text x="${X(r)}" y="${y0 - 14}" text-anchor="middle" fill="${rootFill}" font-size="11" font-weight="700">x=${mfmt(r)}</text>`;
    }
  });

  const gradId = 'mlGrad' + String(elId).replace(/[^a-zA-Z0-9]/g, '');
  const canFill = opts.fill && d && segs <= 1;
  const fillD = canFill ? (d + ` L${lastX} ${y0.toFixed(2)} L${firstX} ${y0.toFixed(2)} Z`) : '';
  const curvePath = `<path d="${d}" pathLength="1" fill="none" stroke="${curveCol}" stroke-width="${dark ? 3 : 2.5}" stroke-linecap="round" stroke-linejoin="round"${dark && opts.animate ? ' class="ml-path-anim" style="--lc:' + curveCol + '"' : ''}/>`;
  const fillPath = fillD ? `<path d="${fillD}" class="ml-fill" style="fill:url(#${gradId});--lc:${curveCol}"/>` : '';

  svg.innerHTML = `
    <rect x="0" y="0" width="${W}" height="${H}" rx="10" fill="${bg}"/>
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${curveCol}" stop-opacity=".32"/>
        <stop offset="1" stop-color="${curveCol}" stop-opacity=".03"/>
      </linearGradient>
    </defs>
    ${grid}
    <line x1="${pad}" y1="${y0}" x2="${W - pad}" y2="${y0}" stroke="${axisCol}" stroke-width="2"/>
    <line x1="${x0}" y1="${pad}" x2="${x0}" y2="${H - pad}" stroke="${axisCol}" stroke-width="2"/>
    <text x="${W - pad + 4}" y="${y0 + 4}" fill="${arrowCol}" font-size="14" font-weight="900">›</text>
    <text x="${x0 + 4}" y="${pad - 6}" fill="${arrowCol}" font-size="14" font-weight="900">^</text>
    ${fillPath}
    ${curvePath}
    ${rootMarks}
    ${ticks}
    <text x="${W - 90}" y="${H - 10}" fill="${fnCol}" font-size="12" font-style="italic">y = ${mlescape(exprStr)}</text>`;
  return { ok: true };
}

// ---------- polynomial tools ----------
// Extract coefficients assuming f is (near) polynomial up to degree degMax.
// Samples at 0..degMax and solves the Vandermonde system.
function polyCoeffs(f, degMax) {
  const n = degMax + 1;
  const xs = [], ys = [];
  for (let k = 0; k <= n; k++) xs.push(k);
  let bad = false;
  for (const x of xs) {
    let v;
    try { v = f(x); } catch (e) { v = NaN; }
    if (!isFinite(v)) { bad = true; break; }
    ys.push(v);
  }
  if (bad) return null;
  // solve upper triangular system
  const A = xs.map((x, r) => {
    const row = [];
    for (let c = 0; c < n; c++) row.push(Math.pow(x, c));
    row.push(ys[r]);
    return row;
  });
  for (let c = 0; c < n; c++) {
    let piv = -1;
    for (let r = c; r < n; r++) if (Math.abs(A[r][c]) > 1e-9) { piv = r; break; }
    if (piv < 0) continue;
    [A[c], A[piv]] = [A[piv], A[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = A[r][c] / A[c][c];
      for (let j = c; j <= n; j++) A[r][j] -= f * A[c][j];
    }
  }
  const coeffs = [];
  for (let c = 0; c < n; c++) coeffs.push(A[c][c] ? A[c][n] / A[c][c] : 0);
  return coeffs; // [c0, c1, ...]
}

function detectDegree(coeffs) {
  let d = coeffs.length - 1;
  while (d > 0 && Math.abs(coeffs[d]) < 1e-7) d--;
  return d;
}

function polyStr(coeffs) {
  const terms = [];
  for (let p = coeffs.length - 1; p >= 0; p--) {
    const c = coeffs[p];
    if (Math.abs(c) < 1e-9) continue;
    const absC = Math.abs(c);
    const sign = terms.length ? (c < 0 ? ' − ' : ' + ') : (c < 0 ? '-' : '');
    let term;
    if (p === 0) term = mfmt(absC);
    else if (p === 1) term = (absC === 1 ? '' : mfmt(absC)) + 'x';
    else term = (absC === 1 ? '' : mfmt(absC)) + 'x^' + p;
    terms.push(sign + term);
  }
  return terms.join('') || '0';
}

function coeffEval(coeffs, x) {
  let v = 0;
  for (let k = coeffs.length - 1; k >= 0; k--) v = v * x + coeffs[k];
  return v;
}

function polyFits(coeffs, f, a, b, n) {
  let worst = 0;
  for (let j = 0; j < n; j++) {
    const x = a + (b - a) * j / (n - 1);
    const e = Math.abs(coeffEval(coeffs, x) - f(x));
    if (e > worst) worst = e;
  }
  return worst;
}

function polyInfoForFn(f) {
  const coeffs = polyCoeffs(f, 6);
  if (!coeffs) return { f, coeffs: null, deg: -1 };
  if (polyFits(coeffs, f, -12, 12, 40) > 0.25) return { f, coeffs: null, deg: -1 };
  const deg = detectDegree(coeffs);
  return { f, coeffs, deg };
}

function polynomialInfo(exprStr) {
  const f = parseMath(exprStr);
  return polyInfoForFn(f);
}

// ---------- graph type description ----------
function graphType(deg, coeffs) {
  if (deg <= 1) return { name: 'सीधी रेखा (Straight Line)', color: '#2563eb' };
  if (deg === 2) return { name: 'परवलय (Parabola)', color: '#7c3aed' };
  if (deg === 3) return { name: 'घन वक्र (Cubic Curve)', color: '#db2777' };
  return { name: deg + '-डिग्री वक्र (Polynomial Curve)', color: '#0d9488' };
}

// ---------- equation solver ----------
function splitEquation(str) {
  const s = String(str || '').replace(/\s+/g, '').toLowerCase();
  const eqPos = s.indexOf('=');
  if (eqPos < 0) return { lhs: s, rhs: '0' };
  return { lhs: s.slice(0, eqPos), rhs: s.slice(eqPos + 1) };
}

function solveEquation(outId, eqStr, svgId) {
  const out = document.getElementById(outId);
  const svgEl = svgId || 'eqSvg';
  if (!out) return;
  let html = '';
  try {
    const { lhs, rhs } = splitEquation(eqStr);
    if (!lhs) throw new Error('समीकरण खाली है');
    const h = x => evalExpr(lhs, x) - evalExpr(rhs, x);

    const info = polyInfoForFn(h);
    const coeffs = info.coeffs;
    let deg = 0, c = coeffs ? coeffs.slice() : [];
    if (coeffs) {
      deg = detectDegree(coeffs);
      c = coeffs.slice(0, deg + 1);
    }

    html += `<div class="ml-step">📝 दिया गया समीकरण: <b>${mlescape(eqStr)}</b></div>`;

    if (!coeffs) {
      // non-polynomial: numeric root scan
      const roots = numericRoots(h, -20, 20);
      html += `<div class="ml-step">🔎 यह बहुपद नहीं है — संख्यात्मक विधि से मूल खोजे गए।</div>`;
      if (!roots.length) html += `<div class="ml-note">कोई वास्तविक मूल नहीं मिला (रेंज -20 से 20)।</div>`;
      drawGraph(svgEl, eqStr, -10, 10, roots);
      html += roots.map(r => `<div class="ml-ans">✅ x ≈ ${mfmt(r)}</div>`).join('');
      writeGraphInfo(eqStr, graphType(3, [0]).name, svgEl + 'Info');
      out.innerHTML = html;
      return;
    }

    html += `<div class="ml-step">🎯 बहुपद रूप: <b>${polyStr(c)} = 0</b></div>`;

    if (deg === 0) {
      html += `<div class="ml-note">x का कोई गुणांक नहीं — ${Math.abs(c[0]) < 1e-9 ? 'यह हर x के लिए सत्य है (अनंत हल)' : 'कोई हल नहीं (विरोधाभास)'}।</div>`;
    } else if (deg === 1) {
      const a = c[1], b = c[0];
      const x = -b / a;
      html += `<div class="ml-step">रैखिक समीकरण ${mfmt(a)}x ${b < 0 ? '− ' + mfmt(-b) : '+ ' + mfmt(b)} = 0</div>`;
      html += `<div class="ml-step">x = −b/a = −(${mfmt(b)})/${mfmt(a)}</div>`;
      html += `<div class="ml-ans">✅ x = ${mfmt(x)}</div>`;
      drawGraph(svgEl, eqStr, -10, 10, [x]);
      writeGraphInfo(eqStr, graphType(1, c).name, svgEl + 'Info');
    } else if (deg === 2) {
      const a = c[2], b = c[1], cc = c[0];
      const D = b * b - 4 * a * cc;
      html += `<div class="ml-step">द्विघात: a=${mfmt(a)}, b=${mfmt(b)}, c=${mfmt(cc)}  (ax² + bx + c = 0)</div>`;
      html += `<div class="ml-step">विविक्तकर D = b² − 4ac = ${mfmt(D)}</div>`;
      let roots;
      if (D > 0) {
        const r1 = (-b + Math.sqrt(D)) / (2 * a);
        const r2 = (-b - Math.sqrt(D)) / (2 * a);
        roots = [r1, r2];
        html += `<div class="ml-step">D > 0 ⇒ दो भिन्न वास्तविक मूल</div>`;
        html += `<div class="ml-step">x = [−b ± √D] / 2a = [${mfmt(-b)} ± √${mfmt(D)}] / ${mfmt(2 * a)}</div>`;
        html += `<div class="ml-ans">✅ x = ${mfmt(r1)}  या  x = ${mfmt(r2)}</div>`;
      } else if (D === 0) {
        const r1 = -b / (2 * a);
        roots = [r1];
        html += `<div class="ml-step">D = 0 ⇒ दो बराबर (वास्तविक) मूल</div>`;
        html += `<div class="ml-ans">✅ x = ${mfmt(r1)} (दोनों बराबर)</div>`;
      } else {
        const re = -b / (2 * a), im = Math.sqrt(-D) / (2 * a);
        roots = [];
        html += `<div class="ml-note">D < 0 ⇒ कोई वास्तविक मूल नहीं (जटिल मूल: ${mfmt(re)} ± ${mfmt(im)}i)</div>`;
      }
      drawGraph(svgEl, eqStr, -10, 10, roots);
      writeGraphInfo(eqStr, graphType(2, c).name, svgEl + 'Info');
    } else {
      // cubic & higher: rational root search
      const roots = [];
      const intRoots = rationalRoots(c);
      intRoots.forEach(r => {
        if (Math.abs(h(r)) < 1e-4) roots.push(r);
      });
      if (!roots.length) {
        numericRoots(h, -50, 50).forEach(r => {
          if (!roots.some(z => Math.abs(z - r) < 1e-3)) roots.push(r);
        });
      }
      html += `<div class="ml-step">डिग्री ${deg} का बहुपद — परीक्षण (फैक्टर थ्योरम) से मूल खोजे गए।</div>`;
      if (roots.length) {
        roots.sort((a, b) => a - b).forEach(r => html += `<div class="ml-ans">✅ x ≈ ${mfmt(r)}</div>`);
      } else {
        html += `<div class="ml-note">सामान्य रेंज में कोई वास्तविक मूल नहीं मिला।</div>`;
      }
      const gt = graphType(deg, c);
      drawGraph(svgEl, eqStr, -10, 10, roots.slice(0, 3));
      writeGraphInfo(eqStr, gt.name, svgEl + 'Info');
    }
  } catch (e) {
    html = `<div class="ml-note" style="color:#dc2626">⚠️ ${mlescape(e.message)}</div>`;
  }
  out.innerHTML = html;
}

function rationalRoots(coeffs) {
  const roots = [];
  const a0 = Math.round(coeffs[coeffs.length - 1] || 1);
  const an = Math.round(coeffs[0] || 1);
  if (a0 === 0) roots.push(0);
  const divs0 = divisors(Math.abs(a0));
  const divsn = divisors(Math.abs(an));
  for (const p of divs0) for (const q of divsn) {
    const cands = [p / q, -p / q];
    for (const cand of cands) {
      let v = 0;
      for (let i = coeffs.length - 1; i >= 0; i--) v = v * cand + coeffs[i];
      if (Math.abs(v) < 1e-5 && !roots.some(r => Math.abs(r - cand) < 1e-6)) roots.push(cand);
    }
  }
  roots.sort((a, b) => a - b);
  return roots;
}

function divisors(n) {
  const out = [];
  for (let d = 1; d <= n; d++) if (n % d === 0) out.push(d);
  return out;
}

function numericRoots(f, lo, hi) {
  const roots = [];
  const N = 1200;
  const dx = (hi - lo) / N;
  let prev = 0, prevX = lo, prevOk = false;
  for (let k = 0; k <= N; k++) {
    const x = lo + dx * k;
    let v = NaN;
    try { v = f(x); } catch (e) { v = NaN; }
    if (isFinite(v)) {
      if (prevOk && prev * v <= 0) {
        // bisection refine
        let a = prevX, b = x, fa = prev, fb = v;
        for (let it = 0; it < 60 && Math.abs(b - a) > 1e-9; it++) {
          const m = (a + b) / 2;
          let fm = NaN;
          try { fm = f(m); } catch (e) { fm = NaN; }
          if (!isFinite(fm)) break;
          if (fm === 0) { a = b = m; break; }
          if (fa * fm < 0) { b = m; fb = fm; } else { a = m; fa = fm; }
        }
        const r = (a + b) / 2;
        if (!roots.some(z => Math.abs(z - r) < 1e-3)) roots.push(r);
      }
      prev = v; prevX = x; prevOk = true;
    } else {
      prevOk = false;
    }
  }
  return roots;
}

function writeGraphInfo(eqStr, typeName, infoId) {
  const el = document.getElementById(infoId || 'graphInfo');
  if (el) el.innerHTML = `📈 <b>${mlescape(eqStr)}</b> → इसका ग्राफ: <b>${typeName}</b>`;
}

// ---------- derivative calculator (symbolic, class-10 friendly) ----------
function derivTerms(src) {
  // returns array of { c, base:'x'|'sin'|'cos'|'tan'|'e'|'ln'|'sqrt', p } describing c*(base^p)
  const s = (src || '').replace(/\s+/g, '').toLowerCase();
  const terms = [];
  let i = 0;
  const sign = () => {
    let sg = 1;
    while (s[i] === '+' || s[i] === '-') { if (s[i] === '-') sg = -sg; i++; }
    return sg;
  };
  function readTerm() {
    const c = sign();
    let coeff = c, base = null, p = 1;
    const num = /^\d+\.?\d*/.exec(s.slice(i));
    if (num) { coeff = c * parseFloat(num[0]); i += num[0].length; }
    if (s[i] === 'x') {
      base = 'x'; i++;
      if (s[i] === '^') { i++; const pn = /^\d+\.?\d*/.exec(s.slice(i)); if (pn) { p = parseFloat(pn[0]); i += pn[0].length; } }
    } else if (s[i] === 'e' && s.slice(i, i + 2) === 'e^') {
      base = 'e'; i += 2; if (s[i] === 'x') i++; p = 1; // e^x only
    } else {
      const fm = /^(sin|cos|tan|ln|sqrt)\(x\)/.exec(s.slice(i));
      if (fm) { base = fm[1]; i += fm[1].length + 3; p = 1; }
    }
    terms.push({ c: coeff, base, p });
  }
  while (i < s.length) readTerm();
  return terms;
}

function derivFormula(src) {
  const terms = derivTerms(src);
  const out = [];
  for (const t of terms) {
    if (t.base === null || t.base === undefined || t.p === 0) { out.push({ c: 0, base: null, p: 0 }); continue; }
    if (t.base === 'x') {
      out.push({ c: t.c * t.p, base: 'x', p: t.p - 1 });
    } else if (t.base === 'sin') { out.push({ c: t.c, base: 'cos', p: 1 }); }
    else if (t.base === 'cos') { out.push({ c: -t.c, base: 'sin', p: 1 }); }
    else if (t.base === 'tan') { out.push({ c: t.c, base: 'sec2', p: 1 }); }
    else if (t.base === 'e') { out.push({ c: t.c, base: 'e', p: 1 }); }
    else if (t.base === 'sqrt') { out.push({ c: t.c / 2, base: 'sqrt', p: 1 }); }
    else if (t.base === 'ln') { out.push({ c: t.c, base: 'invx', p: 1 }); }
  }
  return out;
}

function derivTermStr(t) {
  if (!t || t.c === 0) return '';
  const cAbs = Math.abs(t.c);
  const sgn = t.c < 0 ? '-' : '+';
  let b;
  switch (t.base) {
    case 'x': b = t.p === 1 ? 'x' : (t.p === 0 ? '' : 'x^' + mfmt(t.p)); break;
    case 'cos': b = 'cos(x)'; break;
    case 'sin': b = 'sin(x)'; break;
    case 'sec2': b = 'sec²(x)'; break;
    case 'e': b = 'e^x'; break;
    case 'sqrt': b = '1/√x'; break;
    case 'invx': b = '1/x'; break;
    default: b = '';
  }
  if (!b) return sgn + mfmt(cAbs);
  if (cAbs === 1 && t.base !== 'invx') return sgn + b;
  return sgn + mfmt(cAbs) + '·' + b;
}

function dydx(src) {
  const terms = derivFormula(src);
  const str = terms.map(derivTermStr).filter(Boolean).join(' ');
  return str.replace(/^\+/, '').replace(/\+ -/g, '- ') || '0';
}

function derivToMath(str) {
  return String(str || '')
    .replace(/sec²\(x\)/g, '(1/(cos(x)*cos(x)))')
    .replace(/√x/g, 'sqrt(x)')
    .replace(/·/g, '*')
    .replace(/\s+/g, '');
}

function runDerivative(outId, src) {
  const out = document.getElementById(outId || 'derivOut');
  if (!out) return;
  const input = src || document.getElementById('derivInput')?.value || '';
  let html = '';
  try {
    const df = dydx(input);
    html += `<div class="ml-step">फलन: <b>y = ${mlescape(input)}</b></div>`;
    html += `<div class="ml-step">डेरिवेटिव नियम: d/dx (xⁿ) = n·xⁿ⁻¹ &nbsp;•&nbsp; d/dx (sin x) = cos x &nbsp;•&nbsp; d/dx (cos x) = −sin x</div>`;
    html += `<div class="ml-ans">✅ dy/dx = ${mlescape(df)}</div>`;
    const x0 = parseFloat(document.getElementById('derivX')?.value);
    if (isFinite(x0)) {
      let v = NaN;
      try { v = evalExpr(derivToMath(df), x0); } catch (e) {}
      html += (isFinite(v)
        ? `<div class="ml-ans">✅ x = ${mfmt(x0)} पर dy/dx = ${mfmt(v)}</div>`
        : '<div class="ml-note">इस बिंदु पर मान निकालना संभव नहीं।</div>');
    }
  } catch (e) {
    html = `<div class="ml-note" style="color:#dc2626">⚠️ ${mlescape(e.message)}</div>`;
  }
  out.innerHTML = html;
}

// ---------- AP calculator ----------
function runAP(outId) {
  const out = document.getElementById(outId);
  if (!out) return;
  const a = parseFloat(document.getElementById('apA')?.value);
  const d = parseFloat(document.getElementById('apD')?.value);
  const n = parseInt(document.getElementById('apN')?.value, 10);
  if (!isFinite(a) || !isFinite(d) || !isFinite(n) || n < 1) {
    out.innerHTML = '<div class="ml-note" style="color:#dc2626">⚠️ a, d और n (≥1) सही भरें।</div>';
    return;
  }
  const an = a + (n - 1) * d;
  const sn = (n / 2) * (2 * a + (n - 1) * d);
  let list = '';
  for (let i = 0; i < Math.min(n, 8); i++) list += mfmt(a + i * d) + (i < Math.min(n, 8) - 1 ? ', ' : (n > 8 ? ' ...' : ''));
  out.innerHTML = `
    <div class="ml-step">AP: a₁ = ${mfmt(a)}, d = ${mfmt(d)}, n = ${n} → पद: ${mlescape(list)}</div>
    <div class="ml-step">aₙ = a + (n−1)d = ${mfmt(a)} + ${mfmt(n - 1)}×${mfmt(d)}</div>
    <div class="ml-ans">✅ ${n}वाँ पद (aₙ) = ${mfmt(an)}</div>
    <div class="ml-step">Sₙ = n/2 [2a + (n−1)d] = ${n}/2 [${mfmt(2 * a)} + ${mfmt((n - 1) * d)}]</div>
    <div class="ml-ans">✅ ${n} पदों का योग (Sₙ) = ${mfmt(sn)}</div>`;
}

// ---------- coordinate geometry ----------
function runCoord(outId) {
  const out = document.getElementById(outId);
  if (!out) return;
  const x1 = parseFloat(document.getElementById('cX1')?.value);
  const y1 = parseFloat(document.getElementById('cY1')?.value);
  const x2 = parseFloat(document.getElementById('cX2')?.value);
  const y2 = parseFloat(document.getElementById('cY2')?.value);
  if ([x1, y1, x2, y2].some(v => !isFinite(v))) {
    out.innerHTML = '<div class="ml-note" style="color:#dc2626">⚠️ चारों निर्देशांक भरें।</div>';
    return;
  }
  const dis = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const midx = (x1 + x2) / 2, midy = (y1 + y2) / 2;
  let slope = 'अपरिभाषित (ऊर्ध्वाधर)';
  if (Math.abs(x2 - x1) > 1e-12) slope = mfmt((y2 - y1) / (x2 - x1));
  const m1n = document.getElementById('cM1')?.value, m2n = document.getElementById('cM2')?.value;
  let sec = '';
  if (m1n && m2n) {
    const m1 = parseFloat(m1n), m2 = parseFloat(m2n);
    if (isFinite(m1) && isFinite(m2) && m1 + m2 > 0) {
      const sx = (m1 * x2 + m2 * x1) / (m1 + m2);
      const sy = (m1 * y2 + m2 * y1) / (m1 + m2);
      sec = `<div class="ml-ans">✅ ${mfmt(m1)}:${mfmt(m2)} अनुपात में अंत:विभाजन बिंदु = (${mfmt(sx)}, ${mfmt(sy)})</div>`;
    }
  }
  out.innerHTML = `
    <div class="ml-step">बिंदु A (${mfmt(x1)}, ${mfmt(y1)}) और B (${mfmt(x2)}, ${mfmt(y2)})</div>
    <div class="ml-step">दूरी = √[(x₂−x₁)² + (y₂−y₁)²] = √[${mfmt((x2 - x1) ** 2)} + ${mfmt((y2 - y1) ** 2)}]</div>
    <div class="ml-ans">✅ दूरी AB = ${mfmt(dis)}</div>
    <div class="ml-step">मध्य बिंदु = ((x₁+x₂)/2, (y₁+y₂)/2)</div>
    <div class="ml-ans">✅ मध्य बिंदु = (${mfmt(midx)}, ${mfmt(midy)})</div>
    <div class="ml-ans">✅ ढाल (slope) m = ${mlescape(String(slope))}</div>
    ${sec || ''}`;
}

// ---------- page wiring ----------
function runSolve() {
  const eq = document.getElementById('eqInput')?.value;
  if (!eq) return;
  solveEquation('eqOut', eq);
}

const ML_EXAMPLES = [
  { label: 'x² − 5x + 6', v: 'x^2-5x+6' },
  { label: '2x + 3', v: '2x+3' },
  { label: 'x³ − 6x² + 11x − 6', v: 'x^3-6x^2+11x-6' },
  { label: 'sin(x)', v: 'sin(x)' },
  { label: 'x² + x', v: 'x^2+x' }
];

function fillInput(id, v) { document.getElementById(id).value = v; }

const ML_PALETTE = ['#38bdf8', '#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#fb7185'];
function mlColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return ML_PALETTE[h % ML_PALETTE.length];
}

function initMathLab() {
  // Canvas grapher is initialized via glInit() in DOMContentLoaded above

  const ec = document.getElementById('eqExamples');
  if (ec) {
    ec.innerHTML = [
      { label: '5x + 2 = 17', v: '5x+2=17' },
      { label: 'x² − 5x + 6 = 0', v: 'x^2-5x+6=0' },
      { label: '2x² + 3x − 2 = 0', v: '2x^2+3x-2=0' },
      { label: 'x³ − 4x = 0', v: 'x^3-4x=0' }
    ].map(e => `<button class="ml-chip" onclick="document.getElementById('eqInput').value='${e.v}';runSolve()">${e.label}</button>`).join('');
  }
  const dc = document.getElementById('derivExamples');
  if (dc) {
    dc.innerHTML = ['3x^2+2x-5', 'x^3-4x', 'sin(x)', 'x^2+x+1'].map(v =>
      `<button class="ml-chip" onclick="document.getElementById('derivInput').value='${v}';runDerivative()">y = ${v}</button>`).join('');
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initMathLab);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseMath, evalExpr, solveEquation, dydx, drawGraph, polynomialInfo, graphType, glInit, glDraw, glAddExpression, glClearAll, glResetView, glZoom };
}