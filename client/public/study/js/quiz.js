// ============================================================
//  QUIZ ENGINE - JAC Class 10 Study Hub
//  Features: instant feedback, option lock, next button on answer
// ============================================================

let currentQuiz = {
  subject: null,
  subjectName: '',
  color: '#6366f1',
  chapter: 'all',
  mode: 'mcq',
  qty: 20,
  questions: [],
  currentIndex: 0,
  answers: [],
  score: 0,
  finished: false
};

// ---------- Helpers ----------
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getQuizElement(id) {
  return document.getElementById(id);
}

// ---------- Page initialization ----------
function initQuizPage() {
  const s = getURLParam('subject') || null;
  if (s) initQuizForSubject(s);
}

function initQuizForSubject(s) {
  if (!SUBJECTS[s]) { toast('विषय नहीं मिला', 'error'); return; }
  const sub = SUBJECTS[s];
  currentQuiz.subject = s;
  currentQuiz.subjectName = sub.name;
  currentQuiz.color = sub.color;
  currentQuiz.chapter = getURLParam('chapter') || 'all';
  currentQuiz.mode = getURLParam('mode') || 'mcq';

  // Setup screen
  const setup = getQuizElement('quizSetup');
  if (setup) {
    setup.style.display = 'block';
    const subjSel = getQuizElement('quizSubject');
    if (subjSel) { subjSel.value = s; subjSel.onchange = () => { currentQuiz.subject = subjSel.value; updateChapterSel(); }; }
    updateChapterSel();
    const modeSel = getQuizElement('quizModeSel');
    if (modeSel) modeSel.value = currentQuiz.mode;
  }
}

// Rebuild the chapter dropdown for the currently selected subject
function updateChapterSel() {
  const chSel = getQuizElement('quizChapter');
  if (!chSel) return;
  const subj = currentQuiz.subject;
  chSel.innerHTML = '<option value="all">📚 सभी अध्याय (पूरी बुक)</option>'
    + ((QUESTION_DATA[subj] && QUESTION_DATA[subj].chapters) || []).map(c => `<option>${c}</option>`).join('');
  if (currentQuiz.chapter && currentQuiz.chapter !== 'all') chSel.value = currentQuiz.chapter;
}

// ---------- Mode buttons ----------
function selectQuizMode(mode) {
  currentQuiz.mode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector('.mode-btn[data-mode="' + mode + '"]');
  if (btn) btn.classList.add('active');
  const modeSel = getQuizElement('quizModeSel');
  if (modeSel) modeSel.value = mode;
}

// ---------- Start quiz ----------
function startQuiz() {
  const s = currentQuiz.subject;
  if (!s || !QUESTION_DATA[s]) { toast('पहले विषय चुनें', 'error'); return; }

  currentQuiz.chapter = (getQuizElement('quizChapter')?.value) || 'all';
  const modeSel = getQuizElement('quizModeSel');
  if (modeSel) currentQuiz.mode = modeSel.value;
  const qtySel = document.querySelector('.qty-btn.active');
  if (qtySel) currentQuiz.qty = parseInt(qtySel.dataset.n) || 20;

  // Gather questions
  let questions = getQuestions(s, currentQuiz.chapter);
  if (currentQuiz.mode === 'mcq') questions = questions.filter(q => q.type !== 'write');
  if (currentQuiz.mode === 'write') questions = questions.filter(q => q.type === 'write');

  if (questions.length === 0) { toast('इस मोड/अध्याय में प्रश्न उपलब्ध नहीं', 'error'); return; }

  currentQuiz.questions = shuffleArray(questions).slice(0, currentQuiz.qty);
  currentQuiz.currentIndex = 0;
  currentQuiz.score = 0;
  currentQuiz.finished = false;
  currentQuiz.answers = currentQuiz.questions.map(q => ({ q, selected: null, correct: false, skipped: false, userText: '' }));

  // Show quiz card
  getQuizElement('quizSetup').style.display = 'none';
  getQuizElement('quizActive').style.display = 'block';
  getQuizElement('quizResult').style.display = 'none';
  renderQuestion();
}

// ---------- Render one question ----------
function renderQuestion() {
  const q = currentQuiz.questions[currentQuiz.currentIndex];
  const ans = currentQuiz.answers[currentQuiz.currentIndex];
  const isLast = currentQuiz.currentIndex === currentQuiz.questions.length - 1;

  const subjectMeta = SUBJECTS[currentQuiz.subject];

  // Update progress
  const pct = ((currentQuiz.currentIndex + 1) / currentQuiz.questions.length) * 100;
  const bar = getQuizElement('progressBar');
  if (bar) bar.style.width = pct + '%';

  const qNum = getQuizElement('quizQNum');
  if (qNum) qNum.textContent = `प्रश्न ${currentQuiz.currentIndex + 1}/${currentQuiz.questions.length}`;
  const qScore = getQuizElement('quizScore');
  if (qScore) qScore.textContent = '⭐ ' + currentQuiz.score;

  const card = getQuizElement('quizCard');
  if (!card) return;
  card.innerHTML = '';

  const chTag = `<span class="quiz-chapter-tag" style="background:${subjectMeta.color}22;color:${subjectMeta.color}">${q.chapter || ''}</span>`;

  // --- WRITE mode question ---
  if (q.type === 'write' || currentQuiz.mode === 'write') {
    card.innerHTML = `
      ${chTag}
      <div class="question-text">${escapeHtml(q.q)}</div>
      ${explainBlock()}
      <textarea id="writeInput" rows="3" style="width:100%;padding:14px;font-size:17px;border:2px solid var(--border);border-radius:12px;font-family:inherit"
        placeholder="✍️ अपने शब्दों में उत्तर लिखें..."></textarea>
      <div class="quiz-controls mt-20">
        <button class="btn btn-secondary" id="qPrevBtn" onclick="prevQuestion()" ${currentQuiz.currentIndex === 0 ? 'disabled' : ''}>⬅ पिछला</button>
        ${isLast
          ? `<button class="btn btn-success" onclick="checkWriteAnswer()">✅ जांचें और समाप्त</button>`
          : `<button class="btn btn-primary" onclick="checkWriteAnswer()">🔍 जांचें</button>`}
      </div>`;
    return;
  }

  // --- MCQ question ---
  const letters = ['अ', 'ब', 'स', 'द'];
  let optsHtml = '';
  (q.options || []).forEach((opt, i) => {
    const isSelected = ans.selected === i;
    let cls = 'option';
    let feedback = '';
    if (ans.selected !== null) {
      if (i === q.answer) { cls += ' correct'; feedback = '✅'; }
      else if (isSelected && i !== q.answer) { cls += ' wrong'; feedback = '❌'; }
      else { cls += ' locked'; }
      if (isSelected && i === q.answer) cls += ' selected';
    }
    optsHtml += `
      <div class="${cls}" id="opt-${i}" data-opt="${i}" ${ans.selected === null ? 'data-clickable="true"' : ''}>
        <span class="opt-letter">${letters[i] || (i+1)}</span>
        <span class="opt-text">${escapeHtml(opt)}</span>
        <span class="feedback-icon">${feedback}</span>
      </div>`;
  });

  // Answer reveal area (shown after selection)
  let reveal = '';
  if (ans.selected !== null) {
    const isCorrect = ans.selected === q.answer;
    reveal = `
      <div class="mention-tip">${isCorrect ? '🎉 बिल्कुल सही! शाबाश!' : '❌ गलत! सही उत्तर देखिए नीचे —'}</div>
      ${!isCorrect ? `<div class="answer-hint"><b>✅ सही उत्तर:</b> ${escapeHtml(q.options[q.answer])}</div>` : ''}
      ${q.ans && q.ans !== q.options[q.answer] ? `<div class="answer-hint"><b>📝 जानकारी:</b> ${escapeHtml(q.ans)}</div>` : ''}`;
  }

  card.innerHTML = `
    ${chTag}
    <div class="question-text">${escapeHtml(q.q)}</div>
    ${explainBlock()}
    <div class="options">${optsHtml}</div>
    ${reveal}
    <div class="quiz-controls mt-20">
      <button class="btn btn-secondary" id="qPrevBtn" onclick="prevQuestion()" ${currentQuiz.currentIndex === 0 ? 'disabled' : ''}>⬅ पिछला</button>
      ${ans.selected !== null
        ? (isLast
            ? `<button class="btn btn-success" onclick="submitQuiz()">✅ जमा करें</button>`
            : `<button class="btn btn-primary" onclick="nextQuestion()">अगला →</button>`)
        : `<button class="btn btn-secondary" onclick="skipQuestion()">⏭️ छोड़ें</button>`}
    </div>`;
}

// "समझाइए" Hinglish explainer — one per question, both modes
function explainBlock() {
  return `
    <div class="explain-row">
      <button class="btn btn-info btn-sm" onclick="toggleExplain(this)">🤔 समझाइए (आसान हिंग्लिश)</button>
      <span class="explain-hint">कठिन हिंदी समझ नहीं आ रही? click करो</span>
      <div id="explainPanel" class="explain-panel" style="display:none"></div>
    </div>`;
}

function toggleExplain(btn) {
  const card = getQuizElement('quizCard');
  const panel = card.querySelector('#explainPanel');
  if (!panel) return;
  if (panel.style.display === 'block') { panel.style.display = 'none'; return; }
  const q = currentQuiz.questions[currentQuiz.currentIndex];
  if (!panel.dataset.built) {
    let html = `<h4>🔤 यह प्रश्न आसान हिंग्लिश में</h4>`;
    html += `<p class="hg-question"><b>प्रश्न:</b> ${escapeHtml(q.q)}</p>`;
    html += `<p class="hg-line">${hinglish(q.q)}</p>`;
    if (q.type === 'mcq' && q.options && q.options.length) {
      html += `<div class="hg-options"><b>विकल्पों का अर्थ:</b>`;
      q.options.forEach((o, i) => { html += `<p>${'अबसद'[i] || (i + 1)}) ${escapeHtml(o)} → <span class="hg-line-inline">${hinglish(o)}</span></p>`; });
      html += `</div>`;
    }
    if (q.writeHint) html += `<p class="hg-note">💡 संकेत: ${escapeHtml(q.writeHint)}</p>`;
    html += glossaryHints(q.q + ' ' + (q.options || []).join(' '));
    panel.innerHTML = html;
    // legacy cleanup
    if (panel.dataset) panel.dataset.built = '1';
  }
  panel.style.display = 'block';
  if (btn) btn.classList.add('active');
}

// ---------- MCQ selection: INSTANT feedback + LOCK ----------
function selectOption(i) {
  const idx = currentQuiz.currentIndex;
  const ans = currentQuiz.answers[idx];
  if (ans.selected !== null) return; // already answered / locked

  const q = currentQuiz.questions[idx];
  ans.selected = i;
  ans.correct = (i === q.answer);
  if (ans.correct) currentQuiz.score++;

  renderQuestion(); // re-render with feedback shown + options locked
}

function skipQuestion() {
  const idx = currentQuiz.currentIndex;
  currentQuiz.answers[idx].selected = -1;
  currentQuiz.answers[idx].skipped = true;
  renderQuestion();
}

// ---------- Write mode grading ----------
function checkWriteAnswer() {
  const idx = currentQuiz.currentIndex;
  const ans = currentQuiz.answers[idx];
  const input = getQuizElement('writeInput');
  const text = input ? input.value.trim() : '';
  ans.userText = text;

  if (!text) {
    toast('कुछ तो लिखिए 😊', 'info');
    return;
  }

  // Simple keyword matching
  const keywords = extractKeywords(qKey(ans));
  const keywordsStr = (qKey(ans) || '');
  const lower = ans.q.answer ? String(ans.q.answer) : '';
  const matched = keywords.filter(k => text.toLowerCase().includes(k.toLowerCase())).length;
  const threshold = Math.max(1, Math.ceil(keywords.length * 0.5));

  // Keyboard keyword basis on answer text:
  const correctKeywords = extractKeywords(ans.q.ans || ans.q.answer || '');
  const scored = correctKeywords.filter(k => text.toLowerCase().includes(k.toLowerCase())).length;
  const total = Math.max(1, correctKeywords.length);
  const pct = scored / total;

  ans.correct = matched >= threshold || pct >= 0.5;

  // Show result of write answer
  const card = getQuizElement('quizCard');
  const isLast = currentQuiz.currentIndex === currentQuiz.questions.length - 1;
  card.innerHTML = `
    <div class="answer-hint"><b>आपका उत्तर:</b><br>${escapeHtml(text)}</div>
    <div class="mention-tip">${ans.correct ? '🎉 अच्छा उत्तर! शाबाश!' : '📖 सही उत्तर इससे पास है:'}</div>
    ${!ans.correct ? `<div class="answer-hint"><b>✅ सही उत्तर:</b> ${escapeHtml(ans.q.answer || ans.q.ans || '')}</div>` : ''}
    ${ans.q.ans ? `<div class="answer-hint"><b>📝 संपूर्ण उत्तर:</b> ${escapeHtml(ans.q.ans)}</div>` : ''}
    <div class="quiz-controls mt-20">
      <button class="btn btn-secondary" onclick="prevQuestion()">⬅ पिछला</button>
      ${isLast
        ? `<button class="btn btn-success" onclick="submitQuiz()">✅ जमा करें</button>`
        : `<button class="btn btn-primary" onclick="nextQuestion()">अगला →</button>`}
    </div>`;

  if (ans.correct && !ans.graded) {
    currentQuiz.score++;
    ans.graded = true;
    const qScore = getQuizElement('quizScore');
    if (qScore) qScore.textContent = '⭐ ' + currentQuiz.score;
  }

  // Highlight next button
  // (anonymous function used above; re-bind is fine)
}

function qKey(ansObj) {
  return (ansObj && ansObj.q && (ansObj.q.ans || ansObj.q.answer)) || '';
}

// ---------- Navigation ----------
function nextQuestion() {
  if (currentQuiz.currentIndex < currentQuiz.questions.length - 1) {
    currentQuiz.currentIndex++;
    renderQuestion();
    const quizActive = getQuizElement('quizActive');
    if (quizActive) quizActive.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function prevQuestion() {
  if (currentQuiz.currentIndex > 0) {
    currentQuiz.currentIndex--;
    renderQuestion();
    const quizActive = getQuizElement('quizActive');
    if (quizActive) quizActive.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ---------- Submit ----------
function submitQuiz() {
  if (currentQuiz.finished) return;
  currentQuiz.finished = true;

  // Final recompute
  const total = currentQuiz.questions.length;
  let correct = 0, wrong = 0, skipped = 0;
  const chapStats = {};

  currentQuiz.answers.forEach(a => {
    const ch = a.q.chapter || 'सामान्य';
    if (!chapStats[ch]) chapStats[ch] = { total: 0, correct: 0 };
    chapStats[ch].total++;
    if (a.skipped || a.selected === -1 || a.selected === null) {
      skipped++;
    } else if (a.correct) {
      correct++;
      chapStats[ch].correct++;
    } else {
      wrong++;
    }
  });

  const pct = total ? Math.round((correct / total) * 100) : 0;
  currentQuiz.score = correct;

  // Save result
  saveResult({
    subject: currentQuiz.subject,
    subjectName: currentQuiz.subjectName,
    total, correct, wrong, skipped, pct,
    chapStats,
    timestamp: Date.now()
  });

  showResult(correct, wrong, skipped, total, pct);
}

// ---------- Result screen ----------
function showResult(correct, wrong, skipped, total, pct) {
  getQuizElement('quizActive').style.display = 'none';
  getQuizElement('quizResult').style.display = 'block';

  const circle = getQuizElement('resultCircle');
  if (circle) {
    const deg = Math.round((pct / 100) * 360);
    circle.style.background = `conic-gradient(${currentQuiz.color} ${deg}deg, var(--border) ${deg}deg)`;
  }
  const rs = getQuizElement('resultScore');
  if (rs) rs.textContent = pct + '%';

  const headline = getQuizElement('resultHeadline');
  if (headline) {
    if (pct >= 80) headline.textContent = '🏆 शानदार! आप टॉपर हैं!';
    else if (pct >= 60) headline.textContent = '🎉 शाबाश! अच्छी तैयारी!';
    else if (pct >= 40) headline.textContent = '💪 अच्छा है, बस थोड़ी मेहनत और!';
    else headline.textContent = '🌟 प्रयास करते रहें — अगली बार ज़रूर सुधार होगा!';
  }

  getQuizElement('rCorrect').textContent = correct;
  getQuizElement('rWrong').textContent = wrong;
  getQuizElement('rSkipped').textContent = skipped;
  getQuizElement('rTotal').textContent = pct + '%';

  // Feedback + weak chapter analysis
  const feedback = getQuizElement('resultFeedback');
  if (feedback) {
    const weakChaps = chapterWeak(currentQuiz);
    feedback.innerHTML = `<div class="callout callout-info">${currentQuiz.subjectName} में आपका स्कोर <b>${pct}%</b>। ${weakChaps.length ? 'कमज़ोर अध्याय: ' + weakChaps.join(', ') : 'सभी अध्याय मज़बूत लग रहे हैं! 🎉'}</div>`;
  }

  const chAnalysis = getQuizElement('chapterAnalysis');
  if (chAnalysis) {
    const stats = getResults();
    const last = stats[stats.length - 1];
    let html = '<h3>📊 अध्यायवार प्रदर्शन</h3>';
    if (last && last.chapStats) {
      for (const ch in last.chapStats) {
        const st = last.chapStats[ch];
        const p = st.total ? Math.round((st.correct / st.total) * 100) : 0;
        html += `<div class="subject-bar-row"><b style="font-size:13px">${ch}</b>
          <div class="bar-track"><div class="bar-fill" style="width:${p}%;background:${p>=60?'#22c55e':p>=40?'#f59e0b':'#ef4444'}"></div></div>
          <span style="font-size:13px">${st.correct}/${st.total}</span></div>`;
      }
    } else html += '<p class="muted">पर्याप्त आँकड़े नहीं।</p>';
    chAnalysis.innerHTML = html;
  }

  // Buttons
  getQuizElement('quizResult').querySelectorAll('.result-buttons').forEach(()=>{});

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function chapterWeak(qz) {
  const chStats = {};
  qz.answers.forEach(a => {
    const ch = a.q.chapter || 'सामान्य';
    if (!chStats[ch]) chStats[ch] = { total: 0, correct: 0 };
    chStats[ch].total++;
    if (a.correct) chStats[ch].correct++;
  });
  const weak = [];
  for (const ch in chStats) {
    const p = chStats[ch].total ? (chStats[ch].correct / chStats[ch].total) : 1;
    if (p < 0.5) weak.push(ch);
  }
  return weak;
}

function retryQuiz() {
  getQuizElement('quizResult').style.display = 'none';
  getQuizElement('quizSetup').style.display = 'block';
  getQuizElement('quizActive').style.display = 'none';
  currentQuiz.finished = false;
}

// ---------- Result storage (localStorage) ----------
function saveResult(r) {
  const list = getResults();
  list.push(r);
  localStorage.setItem('jac_results', JSON.stringify(list));
}

function getResults() {
  try {
    return JSON.parse(localStorage.getItem('jac_results') || '[]');
  } catch (e) { return []; }
}

function clearAllResults() {
  if (confirm('सभी रिज़ल्ट delete करें?')) {
    localStorage.removeItem('jac_results');
    toast('रिज़ल्ट हटाए गए', 'success');
    location.reload();
  }
}

// ---------- Analysis rendering ----------
function renderAnalysis() {
  const results = getResults();
  const wrap = getQuizElement('analysisWrap');
  if (!wrap) return;

  if (!results.length) {
    wrap.innerHTML = `<div class="callout callout-warn">अब तक कोई क्विज़ नहीं दी। <b>क्विज़ दें</b> — फिर यहाँ पूरा विश्लेषण दिखेगा।</div>
    <button class="btn btn-primary mt-20" onclick="location.href='quiz.html'">📝 क्विज़ दें</button>`;
    return;
  }

  if (typeof window.barFillInit === 'undefined') window.barFillInit = true;

  // Subject-wise aggregated
  const agg = {};
  results.forEach(r => {
    if (!agg[r.subject]) agg[r.subject] = { name: r.subjectName, total: 0, correct: 0, count: 0 };
    agg[r.subject].total += r.total;
    agg[r.subject].correct += r.correct;
    agg[r.subject].count++;
  });

  let subjectHtml = '';
  const sorted = Object.values(agg).sort((a,b) => (b.correct/b.total) - (a.correct/a.total));
  sorted.forEach(s => {
    const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
    subjectHtml += `<div class="subject-bar-row">
      <b>${s.name}</b>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
      <span>${pct}%</span></div>`;
  });
  getQuizElement('subjectBars').innerHTML = subjectHtml;

  // Weak chapters across all results
  const weakCh = {};
  results.forEach(r => {
    if (r.chapStats) {
      for (const ch in r.chapStats) {
        const st = r.chapStats[ch];
        const k = r.subjectName + ' — ' + ch;
        if (!weakCh[k]) { weakCh[k] = { total: 0, correct: 0 }; }
        weakCh[k].total += st.total;
        weakCh[k].correct += st.correct;
      }
    }
  });
  let weakHtml = '';
  const weakList = [];
  for (const k in weakCh) {
    const p = weakCh[k].total ? weakCh[k].correct / weakCh[k].total : 1;
    if (p < 0.6) weakList.push({ k, p, st: weakCh[k] });
  }
  weakList.sort((a,b) => a.p - b.p).slice(0, 8).forEach(w => {
    weakHtml += `<div class="weak-chapter"><b>${w.k}</b> — सही ${w.st.correct}/${w.st.total} (${Math.round(w.p*100)}%)</div>`;
  });
  getQuizElement('weakChapters').innerHTML = weakHtml || '<p class="muted">कोई weak अध्याय नहीं — सब कुछ मज़बूत! 🎉</p>';

  // Suggestions
  const tips = [];
  const totalPct = results.reduce((a, r) => a + r.pct, 0) / results.length;
  if (totalPct < 50) tips.push('अभी रटने से ज्यादा समझने पर ध्यान दें — नोट्स पढ़ें, फिर क्विज़ दें।');
  if (totalPct < 70) tips.push('हर अध्याय के बाद 10 प्रश्नों की छोटी क्विज़ दिन में 2 बार लें।');
  tips.push('📖 कमज़ोर अध्याय के नोट्स खोलकर पढ़ें, फिर केवल उसी अध्याय का क्विज़ दें।');
  tips.push('🧮 गणित/विज्ञान में फॉर्मूले व प्रयोग पेज से revision करें।');
  tips.push('🧠 5 साल के प्रश्न (PDF पेज) ज़रूर हल करें — बोर्ड पैटर्न समझ आएगा।');
  getQuizElement('suggestions').innerHTML = tips.map(t => `<div class="suggestion">💡 ${t}</div>`).join('');
}

// ---------- Keyword extraction for grading ----------
function extractKeywords(text) {
  if (!text) return [];
  return String(text)
    .toLowerCase()
    .replace(/[.,;:!?()\[\]{}"']/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2)
    .filter(w => !['किसे','कौन','क्या','और','का','के','की','से','को','में','ने','पर','करने','लिए','जानिए','जाइए','आदि'].includes(w));
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('quizSetup')) {
    initQuizPage();
    if (typeof setupNav === 'function') setupNav();
  } else if (typeof setupNav === 'function') {
    setupNav();
  }

  if (document.getElementById('analysisWrap')) {
    renderAnalysis();
  }

  // Event delegation for quiz option clicks (works on mobile too)
  document.addEventListener('click', (e) => {
    const opt = e.target.closest('.option[data-clickable]');
    if (opt) {
      const idx = parseInt(opt.dataset.opt);
      if (!isNaN(idx)) selectOption(idx);
    }
  });
});

// export for tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { currentQuiz, initQuizPage, initQuizForSubject, selectQuizMode, startQuiz, renderQuestion, selectOption, skipQuestion, checkWriteAnswer, nextQuestion, prevQuestion, submitQuiz, showResult, retryQuiz, saveResult, getResults, clearAllResults, renderAnalysis, extractKeywords, shuffleArray, explainBlock, toggleExplain, updateChapterSel };
}