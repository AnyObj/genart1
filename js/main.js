/**
 * Main App Controller
 * Wires together: text editor, analyzer, animation engine, storage.
 * Manages generation modes: on-demand, live, last-3-sentences.
 */

import { analyzeText, getLastNSentences, loadModel, switchModelForLang } from './analyzer.js';
import { AnimationEngine } from './animation.js';
import { saveToLocal, loadAutosave, autosave, downloadAsFile } from './storage.js';

// ===== Mood display labels =====
const MOOD_LABELS = {
    joy: 'Joy',
    sadness: 'Sadness',
    anger: 'Anger',
    fear: 'Fear',
    surprise: 'Surprise',
    love: 'Love',
    calm: 'Calm',
};

const MOOD_ICONS = {
    joy: '\u2600',      // sun
    sadness: '\u2602',  // umbrella
    anger: '\u26A1',    // lightning
    fear: '\u2605',     // dark star
    surprise: '\u2733', // sparkle
    love: '\u2665',     // heart
    calm: '\u2248',     // waves
};

// ===== App State =====
let mode = 'ondemand'; // 'ondemand' | 'live' | 'last3'
let langOverride = null; // null = auto-detect, or a lang code like 'it'
let engine = null;
let debounceTimer = null;
let autosaveTimer = null;
let lastAnalysis = null;

// ===== DOM Elements =====
const canvas = document.getElementById('art-canvas');
const editor = document.getElementById('text-editor');
const moodLabel = document.getElementById('mood-label');
const moodEmoji = document.getElementById('mood-emoji');
const langIndicator = document.getElementById('lang-indicator');
const generateBtn = document.getElementById('generate-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const saveBtn = document.getElementById('save-btn');
const loadModelBtn = document.getElementById('load-model-btn');
const modelStatus = document.getElementById('model-status');
const modelProgress = document.getElementById('model-progress');
const modelStatusText = document.getElementById('model-status-text');
const langSelect = document.getElementById('lang-select');
const modeButtons = document.querySelectorAll('.mode-btn');

// ===== Init =====
function init() {
    engine = new AnimationEngine(canvas);
    engine.start();

    // Load autosaved text
    const saved = loadAutosave();
    if (saved) {
        editor.value = saved;
    }

    // Bind events
    editor.addEventListener('input', onTextInput);
    generateBtn.addEventListener('click', onGenerate);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    saveBtn.addEventListener('click', onSave);
    loadModelBtn.addEventListener('click', onLoadModel);
    langSelect.addEventListener('change', onLangChange);

    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            exitFullscreen();
        }
        // Ctrl+Enter to generate
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            onGenerate();
        }
        // Ctrl+S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            onSave();
        }
    });

    // If there's saved text, do an initial analysis
    if (saved && saved.trim().length > 0) {
        runAnalysis(saved);
    }

    updateModeUI();
}

// ===== Mode Management =====
function setMode(newMode) {
    mode = newMode;
    updateModeUI();

    // If switching to live/last3 with existing text, run analysis
    if ((mode === 'live' || mode === 'last3') && editor.value.trim().length > 0) {
        scheduleAnalysis();
    }
}

function updateModeUI() {
    modeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Show/hide generate button based on mode
    generateBtn.style.display = mode === 'ondemand' ? '' : 'none';
}

// ===== Text Input Handler =====
function onTextInput() {
    // Autosave with debounce
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
        autosave(editor.value);
    }, 1000);

    // Live analysis for live/last3 modes
    if (mode === 'live' || mode === 'last3') {
        scheduleAnalysis();
    }
}

function scheduleAnalysis() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const text = mode === 'last3'
            ? getLastNSentences(editor.value, 3)
            : editor.value;
        runAnalysis(text);
    }, 300);
}

// ===== Language Override =====
async function onLangChange() {
    const val = langSelect.value;
    langOverride = val === 'auto' ? null : val;

    // If a model is already loaded, try switching to the right one for this language
    if (val !== 'auto') {
        await switchModelForLang(val, showModelProgress);
    }

    // Re-analyze with new language if there's text
    if (editor.value.trim().length > 0) {
        const text = mode === 'last3'
            ? getLastNSentences(editor.value, 3)
            : editor.value;
        runAnalysis(text);
    }
}

function showModelProgress(update) {
    switch (update.status) {
        case 'loading':
            modelStatus.classList.remove('hidden');
            modelStatusText.classList.add('loading');
            modelStatusText.textContent = update.message;
            modelProgress.style.width = '0%';
            break;
        case 'progress':
            modelStatus.classList.remove('hidden');
            modelProgress.style.width = `${update.progress}%`;
            modelStatusText.textContent = update.message;
            break;
        case 'ready':
            modelStatusText.textContent = update.message;
            modelStatusText.classList.remove('loading');
            modelProgress.style.width = '100%';
            loadModelBtn.classList.remove('loading');
            loadModelBtn.classList.add('success');
            setTimeout(() => modelStatus.classList.add('hidden'), 2000);
            break;
        case 'error':
            modelStatusText.textContent = update.message;
            modelStatusText.classList.remove('loading');
            loadModelBtn.classList.remove('loading');
            setTimeout(() => modelStatus.classList.add('hidden'), 3000);
            break;
    }
}

// ===== Generate (on-demand) =====
function onGenerate() {
    const text = editor.value.trim();
    if (!text) return;

    // Flash button
    generateBtn.classList.add('loading');
    setTimeout(() => generateBtn.classList.remove('loading'), 500);

    // Clear canvas for fresh generation
    engine.clear();

    runAnalysis(text);
}

// ===== Analysis + Animation Update =====
async function runAnalysis(text) {
    if (!text || text.trim().length === 0) {
        updateMoodDisplay('calm', null, null);
        engine.setMood('calm', 1.0);
        return;
    }

    const result = await analyzeText(text, langOverride);
    lastAnalysis = result;

    const { emotion, language } = result;
    updateMoodDisplay(emotion.dominant, language, emotion);
    engine.setMood(emotion.dominant, language.speedMultiplier);
}

// ===== UI Updates =====
function updateMoodDisplay(mood, language, emotion) {
    const label = MOOD_LABELS[mood] || 'Calm';
    const icon = MOOD_ICONS[mood] || '';

    moodEmoji.textContent = icon;
    let suffix = '';
    if (emotion && emotion.mlEnhanced) {
        suffix = emotion.modelType === 'sentiment' ? ' (AI multi)' : ' (AI)';
    }
    moodLabel.textContent = label + suffix;

    if (language && language.confidence > 0.1) {
        langIndicator.textContent = language.name;
    } else {
        langIndicator.textContent = '';
    }
}

// ===== Fullscreen =====
function toggleFullscreen() {
    const container = document.getElementById('canvas-container');
    if (container.classList.contains('fullscreen')) {
        exitFullscreen();
    } else {
        container.classList.add('fullscreen');
        engine.resize();
        // Try native fullscreen API
        if (container.requestFullscreen) {
            container.requestFullscreen().catch(() => {});
        }
    }
}

function exitFullscreen() {
    const container = document.getElementById('canvas-container');
    container.classList.remove('fullscreen');
    engine.resize();
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }
}

// Handle native fullscreen exit (Escape)
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        document.getElementById('canvas-container').classList.remove('fullscreen');
        engine.resize();
    }
});

// ===== Save =====
function onSave() {
    const text = editor.value;
    saveToLocal(text);
    downloadAsFile(text);

    // Visual feedback
    saveBtn.classList.add('success');
    setTimeout(() => saveBtn.classList.remove('success'), 1500);
}

// ===== Load AI Model =====
async function onLoadModel() {
    loadModelBtn.classList.add('loading');
    modelStatus.classList.remove('hidden');
    modelStatusText.classList.add('loading');

    // Load model based on currently selected language
    await loadModel(showModelProgress, langOverride);

    // Re-analyze current text with the model
    if (editor.value.trim()) {
        const text = mode === 'last3'
            ? getLastNSentences(editor.value, 3)
            : editor.value;
        runAnalysis(text);
    }
}

// ===== Start =====
document.addEventListener('DOMContentLoaded', init);
