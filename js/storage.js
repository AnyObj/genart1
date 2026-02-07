/**
 * Storage - Save/load text via LocalStorage + file download
 */

const STORAGE_KEY = 'textart_saved_text';
const AUTOSAVE_KEY = 'textart_autosave';

export function saveToLocal(text) {
    try {
        localStorage.setItem(STORAGE_KEY, text);
        return true;
    } catch {
        return false;
    }
}

export function loadFromLocal() {
    try {
        return localStorage.getItem(STORAGE_KEY) || '';
    } catch {
        return '';
    }
}

export function autosave(text) {
    try {
        localStorage.setItem(AUTOSAVE_KEY, text);
    } catch { /* ignore */ }
}

export function loadAutosave() {
    try {
        return localStorage.getItem(AUTOSAVE_KEY) || '';
    } catch {
        return '';
    }
}

export function downloadAsFile(text, filename = 'textart-text.txt') {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
