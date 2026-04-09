import { EditorView, keymap, drawSelection, highlightActiveLine } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { defaultKeymap, historyKeymap, history, indentWithTab } from '@codemirror/commands';

// ===== カスタムハイライト (Dracula風) =====
const myHighlight = HighlightStyle.define([
  { tag: tags.keyword,                     color: '#ff79c6', fontWeight: 'bold' },
  { tag: tags.definitionKeyword,           color: '#ff79c6', fontWeight: 'bold' },
  { tag: tags.operatorKeyword,             color: '#ff79c6' },
  { tag: tags.controlKeyword,              color: '#ff79c6' },
  { tag: tags.function(tags.variableName), color: '#8be9fd' },
  { tag: tags.function(tags.propertyName), color: '#8be9fd' },
  { tag: tags.variableName,                color: '#f8f8f2' },
  { tag: tags.propertyName,                color: '#f8f8f2' },
  { tag: tags.number,                      color: '#bd93f9' },
  { tag: tags.string,                      color: '#f1fa8c' },
  { tag: tags.comment,                     color: '#6272a4', fontStyle: 'italic' },
  { tag: tags.operator,                    color: '#ff79c6' },
  { tag: tags.punctuation,                 color: '#f8f8f2' },
  { tag: tags.bracket,                     color: '#f8f8f2' },
  { tag: tags.name,                        color: '#f8f8f2' },
  { tag: tags.bool,                        color: '#bd93f9' },
  { tag: tags.null,                        color: '#bd93f9' },
]);

// ===== sketch.js を fetch して初期コードとして読み込む =====
const DEFAULT_CODE = await fetch('sketch.js').then(r => r.text());

// ===== CodeMirror 6 セットアップ =====
const view = new EditorView({
  state: EditorState.create({
    doc: DEFAULT_CODE,
    extensions: [
      history(),
      drawSelection(),
      highlightActiveLine(),
      syntaxHighlighting(myHighlight, { fallback: true }),
      javascript(),
      keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
      EditorView.theme({
        '&': {
          fontSize: '40px',
          fontFamily: "'Courier New', Courier, monospace",
          background: 'transparent',
          height: '100%',
        },
        '.cm-scroller': {
          fontFamily: "'Courier New', Courier, monospace",
          lineHeight: '1.7',
          overflow: 'auto',
          background: 'transparent',
        },
        '.cm-content':   { background: 'transparent', caretColor: '#fff' },
        '.cm-gutters':   { background: 'transparent', border: 'none' },
        '.cm-activeLine': { background: 'transparent' },
        '.cm-selectionBackground': { background: 'rgba(150,150,255,0.28) !important' },
        '&.cm-focused .cm-selectionBackground': { background: 'rgba(150,150,255,0.28) !important' },
        '.cm-cursor': { borderLeftColor: '#fff' },
      }),
    ],
  }),
  parent: document.getElementById('editor-wrap'),
});

// ===== p5.js スケッチ実行 =====
let currentSketch = null;

function runSketch(userCode) {
  hideError();
  if (currentSketch) { currentSketch.remove(); currentSketch = null; }
  try {
    const sketchFn = buildSketchFn(userCode);
    currentSketch = new p5(sketchFn, document.getElementById('p5-canvas-container'));
  } catch (e) {
    showError(e.message);
  }
}

function buildSketchFn(code) {
  return function(p) {
    const fn = new Function('p', `with(p) {
      ${code}
      if (typeof setup         === 'function') p.setup         = setup;
      if (typeof draw          === 'function') p.draw          = draw;
      if (typeof preload       === 'function') p.preload       = preload;
      if (typeof mousePressed  === 'function') p.mousePressed  = mousePressed;
      if (typeof mouseMoved    === 'function') p.mouseMoved    = mouseMoved;
      if (typeof mouseDragged  === 'function') p.mouseDragged  = mouseDragged;
      if (typeof keyPressed    === 'function') p.keyPressed    = keyPressed;
      if (typeof keyReleased   === 'function') p.keyReleased   = keyReleased;
      if (typeof touchStarted  === 'function') p.touchStarted  = touchStarted;
      if (typeof touchMoved    === 'function') p.touchMoved    = touchMoved;
      if (typeof touchEnded    === 'function') p.touchEnded    = touchEnded;
      if (typeof windowResized === 'function') p.windowResized = windowResized;
    }`);
    fn(p);
  };
}

// ===== エラートースト =====
function showError(msg) {
  const t = document.getElementById('error-toast');
  t.textContent = '⚠ ' + msg;
  t.classList.add('visible');
  setTimeout(() => t.classList.remove('visible'), 5000);
}
function hideError() {
  document.getElementById('error-toast').classList.remove('visible');
}

// ===== QRコード =====
new QRCode(document.getElementById('qr-box'), {
  text: 'https://x.com/reona396',
  width: 220, height: 220,
  colorDark: '#000', colorLight: '#fff',
  correctLevel: QRCode.CorrectLevel.H,
});

let qrVisible = false;
document.getElementById('qr-btn').addEventListener('click', () => {
  qrVisible = !qrVisible;
  document.getElementById('qr-panel').classList.toggle('visible', qrVisible);
  document.getElementById('qr-btn').classList.toggle('active', qrVisible);
});

// ===== Runボタン =====
document.getElementById('run-btn').addEventListener('click', () => {
  runSketch(view.state.doc.toString());
});

// ===== 全画面 =====
const fsBtn = document.getElementById('fs-btn');
fsBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
});
document.addEventListener('fullscreenchange', () => {
  const full = !!document.fullscreenElement;
  fsBtn.classList.toggle('active', full);
  fsBtn.textContent = full ? '✕' : '⛶';
  setTimeout(() => runSketch(view.state.doc.toString()), 100);
});

// ===== 初回実行 =====
runSketch(DEFAULT_CODE);
