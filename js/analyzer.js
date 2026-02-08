/**
 * Text Analyzer - Emotion detection + Language identification
 * Uses a built-in lexicon for instant analysis, with optional
 * Transformers.js model for enhanced emotion classification.
 */

// ===== Emotion Lexicons (EN + IT + ES + FR + DE) =====
// Words scored by emotion: joy, sadness, anger, fear, surprise, love, calm
const EMOTION_LEXICON = {
    // English
    'happy': { joy: 3 }, 'happiness': { joy: 3 }, 'joyful': { joy: 3 }, 'cheerful': { joy: 2 },
    'delighted': { joy: 3 }, 'excited': { joy: 2, surprise: 1 }, 'wonderful': { joy: 3 },
    'fantastic': { joy: 3 }, 'amazing': { joy: 2, surprise: 2 }, 'great': { joy: 2 },
    'excellent': { joy: 2 }, 'beautiful': { joy: 2, love: 1 }, 'brilliant': { joy: 2 },
    'awesome': { joy: 2 }, 'fun': { joy: 2 }, 'enjoy': { joy: 2 }, 'glad': { joy: 2 },
    'laugh': { joy: 3 }, 'laughing': { joy: 3 }, 'smile': { joy: 2 }, 'smiling': { joy: 2 },
    'celebrate': { joy: 3 }, 'triumph': { joy: 3 }, 'victory': { joy: 2 },
    'paradise': { joy: 3, calm: 1 }, 'bliss': { joy: 3 }, 'euphoria': { joy: 3 },
    'pleasant': { joy: 1, calm: 1 }, 'good': { joy: 1 }, 'nice': { joy: 1 },
    'thrill': { joy: 2, surprise: 1 }, 'thrilled': { joy: 3 },

    'sad': { sadness: 3 }, 'sadness': { sadness: 3 }, 'unhappy': { sadness: 2 },
    'depressed': { sadness: 3 }, 'depression': { sadness: 3 }, 'miserable': { sadness: 3 },
    'lonely': { sadness: 3 }, 'loneliness': { sadness: 3 }, 'grief': { sadness: 3 },
    'sorrow': { sadness: 3 }, 'crying': { sadness: 3 }, 'cry': { sadness: 2 },
    'tears': { sadness: 2 }, 'heartbreak': { sadness: 3, love: 1 },
    'melancholy': { sadness: 2 }, 'gloomy': { sadness: 2 }, 'despair': { sadness: 3 },
    'hopeless': { sadness: 3 }, 'mourning': { sadness: 3 }, 'loss': { sadness: 2 },
    'painful': { sadness: 2 }, 'suffering': { sadness: 3 }, 'tragic': { sadness: 3 },
    'regret': { sadness: 2 }, 'disappointed': { sadness: 2 }, 'dismay': { sadness: 2 },
    'broken': { sadness: 2 }, 'empty': { sadness: 2 }, 'alone': { sadness: 2 },

    'angry': { anger: 3 }, 'anger': { anger: 3 }, 'furious': { anger: 3 },
    'rage': { anger: 3 }, 'hate': { anger: 3 }, 'hatred': { anger: 3 },
    'frustrated': { anger: 2 }, 'annoyed': { anger: 2 }, 'irritated': { anger: 2 },
    'hostile': { anger: 2 }, 'outraged': { anger: 3 }, 'mad': { anger: 2 },
    'fury': { anger: 3 }, 'violent': { anger: 3 }, 'aggressive': { anger: 2 },
    'destroy': { anger: 2 }, 'fight': { anger: 2 }, 'war': { anger: 2 },
    'disgust': { anger: 2 }, 'resent': { anger: 2 }, 'bitter': { anger: 2, sadness: 1 },
    'enraged': { anger: 3 }, 'livid': { anger: 3 }, 'infuriated': { anger: 3 },

    'afraid': { fear: 3 }, 'scared': { fear: 3 }, 'terrified': { fear: 3 },
    'anxious': { fear: 2 }, 'anxiety': { fear: 2 }, 'worried': { fear: 2 },
    'panic': { fear: 3 }, 'horror': { fear: 3 }, 'dread': { fear: 3 },
    'nervous': { fear: 2 }, 'frightened': { fear: 3 }, 'terror': { fear: 3 },
    'fearful': { fear: 3 }, 'phobia': { fear: 3 }, 'nightmare': { fear: 3 },
    'creepy': { fear: 2 }, 'eerie': { fear: 2 }, 'sinister': { fear: 2 },
    'danger': { fear: 2 }, 'dangerous': { fear: 2 }, 'threat': { fear: 2 },
    'dark': { fear: 1, sadness: 1 }, 'shadow': { fear: 1 },

    'surprised': { surprise: 3 }, 'astonished': { surprise: 3 },
    'shocked': { surprise: 3 }, 'unexpected': { surprise: 2 },
    'startled': { surprise: 2 }, 'wow': { surprise: 2, joy: 1 },
    'incredible': { surprise: 2, joy: 1 }, 'unbelievable': { surprise: 3 },
    'sudden': { surprise: 2 }, 'remarkable': { surprise: 2 },
    'stunning': { surprise: 2, joy: 1 }, 'extraordinary': { surprise: 2, joy: 1 },

    'love': { love: 3 }, 'adore': { love: 3 }, 'cherish': { love: 3 },
    'passion': { love: 3 }, 'passionate': { love: 3 }, 'romantic': { love: 2 },
    'tender': { love: 2, calm: 1 }, 'affection': { love: 2 }, 'devotion': { love: 3 },
    'embrace': { love: 2 }, 'kiss': { love: 2 }, 'darling': { love: 2 },
    'beloved': { love: 3 }, 'sweetheart': { love: 2 }, 'desire': { love: 2 },
    'intimacy': { love: 2 }, 'warmth': { love: 1, calm: 1 }, 'caring': { love: 2 },
    'heart': { love: 2 }, 'soul': { love: 1 }, 'forever': { love: 2 },

    'peaceful': { calm: 3 }, 'serene': { calm: 3 }, 'tranquil': { calm: 3 },
    'relaxed': { calm: 2 }, 'gentle': { calm: 2 }, 'quiet': { calm: 2 },
    'still': { calm: 2 }, 'harmony': { calm: 3 }, 'balanced': { calm: 2 },
    'zen': { calm: 3 }, 'mindful': { calm: 2 }, 'meditate': { calm: 3 },
    'soothing': { calm: 2 }, 'calm': { calm: 3 }, 'rest': { calm: 2 },
    'breath': { calm: 1 }, 'nature': { calm: 2 }, 'silence': { calm: 2 },
    'flow': { calm: 2 }, 'ease': { calm: 2 }, 'soft': { calm: 1 },

    // Italian
    'felice': { joy: 3 }, 'felicità': { joy: 3 }, 'contento': { joy: 2 }, 'contenta': { joy: 2 },
    'allegro': { joy: 2 }, 'allegra': { joy: 2 }, 'gioioso': { joy: 3 }, 'gioiosa': { joy: 3 },
    'meraviglioso': { joy: 3 }, 'meravigliosa': { joy: 3 }, 'fantastico': { joy: 3 },
    'bellissimo': { joy: 2, love: 1 }, 'bellissima': { joy: 2, love: 1 },
    'ridere': { joy: 3 }, 'sorriso': { joy: 2 }, 'sorridere': { joy: 2 },
    'gioia': { joy: 3 }, 'festa': { joy: 2 }, 'festeggiare': { joy: 3 },
    'bello': { joy: 1, love: 1 }, 'bella': { joy: 1, love: 1 },
    'splendido': { joy: 2 }, 'splendida': { joy: 2 }, 'magnifico': { joy: 3 },
    'stupendo': { joy: 3 }, 'stupenda': { joy: 3 }, 'eccezionale': { joy: 2 },
    'divertente': { joy: 2 }, 'divertirsi': { joy: 2 },

    'triste': { sadness: 3 }, 'tristezza': { sadness: 3 }, 'infelice': { sadness: 2 },
    'depresso': { sadness: 3 }, 'depressa': { sadness: 3 }, 'depressione': { sadness: 3 },
    'solo': { sadness: 2 }, 'sola': { sadness: 2 }, 'solitudine': { sadness: 3 },
    'dolore': { sadness: 3 }, 'piangere': { sadness: 3 }, 'lacrime': { sadness: 3 },
    'lutto': { sadness: 3 }, 'perdita': { sadness: 2 }, 'sofferenza': { sadness: 3 },
    'malinconia': { sadness: 2 }, 'disperazione': { sadness: 3 }, 'sconforto': { sadness: 2 },
    'rimpianto': { sadness: 2 }, 'delusione': { sadness: 2 }, 'deluso': { sadness: 2 },
    'vuoto': { sadness: 2 }, 'vuota': { sadness: 2 }, 'cupo': { sadness: 2 },

    'arrabbiato': { anger: 3 }, 'arrabbiata': { anger: 3 }, 'rabbia': { anger: 3 },
    'furioso': { anger: 3 }, 'furiosa': { anger: 3 }, 'furia': { anger: 3 },
    'odio': { anger: 3 }, 'odiare': { anger: 3 }, 'frustrato': { anger: 2 },
    'irritato': { anger: 2 }, 'irritata': { anger: 2 }, 'violento': { anger: 3 },
    'guerra': { anger: 2 }, 'distruggere': { anger: 2 }, 'aggressivo': { anger: 2 },
    'infuriato': { anger: 3 }, 'sdegno': { anger: 2 },

    'paura': { fear: 3 }, 'spaventato': { fear: 3 }, 'spaventata': { fear: 3 },
    'terrore': { fear: 3 }, 'terrificante': { fear: 3 }, 'ansioso': { fear: 2 },
    'ansiosa': { fear: 2 }, 'ansia': { fear: 2 }, 'preoccupato': { fear: 2 },
    'preoccupata': { fear: 2 }, 'incubo': { fear: 3 }, 'orrore': { fear: 3 },
    'pericolo': { fear: 2 }, 'pericoloso': { fear: 2 }, 'minaccia': { fear: 2 },
    'buio': { fear: 1, sadness: 1 }, 'oscuro': { fear: 1 }, 'oscura': { fear: 1 },

    'sorpreso': { surprise: 3 }, 'sorpresa': { surprise: 3 }, 'stupito': { surprise: 3 },
    'stupita': { surprise: 3 }, 'incredibile': { surprise: 2, joy: 1 },
    'inaspettato': { surprise: 2 }, 'inaspettata': { surprise: 2 },
    'straordinario': { surprise: 2, joy: 1 }, 'straordinaria': { surprise: 2, joy: 1 },

    'amore': { love: 3 }, 'amare': { love: 3 }, 'adorare': { love: 3 },
    'passione': { love: 3 }, 'romantico': { love: 2 }, 'romantica': { love: 2 },
    'tenerezza': { love: 2 }, 'affetto': { love: 2 }, 'bacio': { love: 2 },
    'abbraccio': { love: 2 }, 'desiderio': { love: 2 }, 'cuore': { love: 2 },
    'anima': { love: 1 }, 'eterno': { love: 2 }, 'eterna': { love: 2 },
    'innamorato': { love: 3 }, 'innamorata': { love: 3 },

    'pace': { calm: 3 }, 'pacifico': { calm: 3 }, 'sereno': { calm: 3 },
    'serena': { calm: 3 }, 'tranquillo': { calm: 3 }, 'tranquilla': { calm: 3 },
    'rilassato': { calm: 2 }, 'rilassata': { calm: 2 }, 'silenzio': { calm: 2 },
    'armonia': { calm: 3 }, 'equilibrio': { calm: 2 }, 'natura': { calm: 2 },
    'dolce': { calm: 1, love: 1 }, 'gentile': { calm: 2 },

    // Spanish
    'feliz': { joy: 3 }, 'alegre': { joy: 2 }, 'alegría': { joy: 3 },
    'maravilloso': { joy: 3 }, 'maravillosa': { joy: 3 },
    'hermoso': { joy: 2, love: 1 }, 'hermosa': { joy: 2, love: 1 },
    'reír': { joy: 3 }, 'sonreír': { joy: 2 }, 'fiesta': { joy: 2 },
    'triste': { sadness: 3 }, 'tristeza': { sadness: 3 },
    'llorar': { sadness: 3 }, 'lágrimas': { sadness: 3 },
    'enojado': { anger: 3 }, 'enojada': { anger: 3 }, 'rabia': { anger: 3 },
    'miedo': { fear: 3 }, 'asustado': { fear: 3 }, 'terror': { fear: 3 },
    'sorprendido': { surprise: 3 }, 'increíble': { surprise: 2, joy: 1 },
    'amor': { love: 3 }, 'amar': { love: 3 }, 'corazón': { love: 2 },
    'paz': { calm: 3 }, 'tranquilo': { calm: 3 }, 'sereno': { calm: 3 },

    // French
    'heureux': { joy: 3 }, 'heureuse': { joy: 3 }, 'joie': { joy: 3 },
    'magnifique': { joy: 3 }, 'merveilleux': { joy: 3 }, 'merveilleuse': { joy: 3 },
    'rire': { joy: 3 }, 'sourire': { joy: 2 },
    'triste': { sadness: 3 }, 'tristesse': { sadness: 3 },
    'pleurer': { sadness: 3 }, 'larmes': { sadness: 3 },
    'colère': { anger: 3 }, 'furieux': { anger: 3 }, 'furieuse': { anger: 3 },
    'peur': { fear: 3 }, 'effrayé': { fear: 3 }, 'terreur': { fear: 3 },
    'surpris': { surprise: 3 }, 'surprise': { surprise: 3 },
    'amour': { love: 3 }, 'aimer': { love: 3 }, 'coeur': { love: 2 },
    'paix': { calm: 3 }, 'tranquille': { calm: 3 }, 'paisible': { calm: 3 },

    // German
    'glücklich': { joy: 3 }, 'freude': { joy: 3 }, 'fröhlich': { joy: 2 },
    'wunderbar': { joy: 3 }, 'schön': { joy: 2 }, 'lachen': { joy: 3 },
    'traurig': { sadness: 3 }, 'trauer': { sadness: 3 },
    'weinen': { sadness: 3 }, 'tränen': { sadness: 3 },
    'wütend': { anger: 3 }, 'zorn': { anger: 3 }, 'hass': { anger: 3 },
    'angst': { fear: 3 }, 'furcht': { fear: 3 }, 'erschrocken': { fear: 3 },
    'überrascht': { surprise: 3 }, 'erstaunlich': { surprise: 2 },
    'liebe': { love: 3 }, 'lieben': { love: 3 }, 'herz': { love: 2 },
    'frieden': { calm: 3 }, 'ruhig': { calm: 3 }, 'stille': { calm: 2 },
};

// ===== Language Detection via franc-min (82 languages) =====
// Loaded dynamically from CDN as ESM
let francDetect = null;

async function ensureFranc() {
    if (!francDetect) {
        try {
            const mod = await import('https://esm.sh/franc-min@6');
            francDetect = mod.franc;
        } catch (err) {
            console.warn('franc-min failed to load, using fallback detection:', err);
        }
    }
    return francDetect;
}

// franc returns ISO 639-3 codes, we need ISO 639-1
const ISO3_TO_ISO1 = {
    eng: 'en', ita: 'it', spa: 'es', fra: 'fr', deu: 'de', por: 'pt',
    rus: 'ru', jpn: 'ja', cmn: 'zh', arb: 'ar', kor: 'ko', hin: 'hi',
    nld: 'nl', pol: 'pl', tur: 'tr', swe: 'sv', dan: 'da', nor: 'no',
    fin: 'fi', ron: 'ro', hun: 'hu', ces: 'cs', ell: 'el', heb: 'he',
    tha: 'th', vie: 'vi', ind: 'id', ukr: 'uk', cat: 'ca',
};

const LANG_NAMES = {
    en: 'English', it: 'Italiano', es: 'Espanol', fr: 'Francais',
    de: 'Deutsch', pt: 'Portugues', ru: 'Russkiy', ja: 'Nihongo',
    zh: 'Zhongwen', ar: 'Arabiyya', ko: 'Hangugeo', hi: 'Hindi',
    nl: 'Nederlands', pl: 'Polski', tr: 'Turkce', sv: 'Svenska',
    da: 'Dansk', no: 'Norsk', fi: 'Suomi', ro: 'Romana',
    hu: 'Magyar', cs: 'Cestina', el: 'Ellinika', he: 'Ivrit',
    th: 'Thai', vi: 'Tieng Viet', id: 'Bahasa', uk: 'Ukrainska',
    ca: 'Catala',
};

// Speed multiplier per language family
const LANG_SPEED = {
    it: 1.3, es: 1.3, pt: 1.25, fr: 1.15, ca: 1.2, ro: 1.2,  // Romance
    en: 1.0, de: 0.9, nl: 0.9, sv: 0.85, da: 0.85, no: 0.85,  // Germanic
    ja: 0.8, zh: 0.85, ko: 0.8,                                  // CJK
    ru: 1.1, pl: 1.05, cs: 1.0, uk: 1.1,                        // Slavic
    ar: 1.1, hi: 1.05, he: 1.0, th: 0.9, vi: 1.0,              // Other
    tr: 1.05, fi: 0.85, hu: 0.95, el: 1.1, id: 1.0,
};

async function detectLanguage(text) {
    if (!text || text.trim().length < 10) {
        return { lang: 'en', confidence: 0, name: 'English', speedMultiplier: 1.0 };
    }

    const detect = await ensureFranc();

    if (detect) {
        const iso3 = detect(text);
        if (iso3 && iso3 !== 'und') {
            const iso1 = ISO3_TO_ISO1[iso3] || iso3.slice(0, 2);
            return {
                lang: iso1,
                confidence: 0.8,
                name: LANG_NAMES[iso1] || iso1,
                speedMultiplier: LANG_SPEED[iso1] || 1.0,
            };
        }
    }

    // Fallback: simple heuristic if franc fails
    return { lang: 'en', confidence: 0.2, name: 'English', speedMultiplier: 1.0 };
}

// ===== Lexicon-based Emotion Analysis =====
function analyzeLexicon(text) {
    const words = text.toLowerCase()
        .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
        .split(/\s+/)
        .filter(w => w.length > 1);

    const scores = { joy: 0, sadness: 0, anger: 0, fear: 0, surprise: 0, love: 0, calm: 0 };
    let matchCount = 0;

    for (const word of words) {
        const entry = EMOTION_LEXICON[word];
        if (entry) {
            matchCount++;
            for (const [emotion, score] of Object.entries(entry)) {
                scores[emotion] += score;
            }
        }
    }

    // Normalize
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    const normalized = {};
    for (const [k, v] of Object.entries(scores)) {
        normalized[k] = total > 0 ? v / total : 1 / 7;
    }

    // Determine dominant emotion
    let dominant = 'calm';
    let maxScore = 0;
    for (const [emotion, score] of Object.entries(normalized)) {
        if (score > maxScore) {
            maxScore = score;
            dominant = emotion;
        }
    }

    // If no emotion words found, default to calm
    if (matchCount === 0) {
        dominant = 'calm';
        maxScore = 0.5;
    }

    return {
        dominant,
        confidence: Math.min(maxScore * (matchCount > 0 ? 1.5 : 0.3), 1),
        scores: normalized,
        matchCount,
        wordCount: words.length,
    };
}

// ===== Sentence splitter =====
function splitSentences(text) {
    return text
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
}

function getLastNSentences(text, n = 3) {
    const sentences = splitSentences(text);
    return sentences.slice(-n).join(' ');
}

// ===== ML Models (Transformers.js) =====
// All model IDs verified to exist on HuggingFace with ONNX weights.
//
// English: Xenova/distilbert-base-uncased-finetuned-sst-2-english
//   Labels: POSITIVE, NEGATIVE (binary sentiment)
//
// Multilingual: Xenova/bert-base-multilingual-uncased-sentiment
//   Labels: 1 star, 2 stars, 3 stars, 4 stars, 5 stars
//   Trained on 72k Italian, 30k English, 30k German, 24k French, 20k Spanish, 12k Dutch reviews
//
// Both use lexicon hints to map sentiment → specific emotion.
const ML_MODELS = {
    english: {
        id: 'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
        type: 'binary',
        langs: ['en'],
        labels: ['POSITIVE', 'NEGATIVE'],
    },
    multilingual: {
        id: 'Xenova/bert-base-multilingual-uncased-sentiment',
        type: 'stars',
        langs: ['it', 'es', 'fr', 'de', 'pt', 'nl', 'en'],
        labels: ['1 star', '2 stars', '3 stars', '4 stars', '5 stars'],
    },
};

let pipelineFactory = null; // cached import
let loadedModels = {};      // { modelKey: classifier }
let activeModelKey = null;
let modelLoading = false;
let modelReady = false;

function pickModelKey(langCode) {
    // Use multilingual for any language it supports (incl. English, since it handles stars)
    if (langCode && ML_MODELS.multilingual.langs.includes(langCode)) return 'multilingual';
    // For English or unknown, use the English binary model
    if (!langCode || langCode === 'en') return 'english';
    // For languages not covered by multilingual, try it anyway (it's BERT multilingual)
    return 'multilingual';
}

async function ensurePipeline() {
    if (!pipelineFactory) {
        const mod = await import(
            'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2'
        );
        pipelineFactory = mod.pipeline;
        mod.env.allowLocalModels = false;
    }
    return pipelineFactory;
}

// Load model for the given language. Can load multiple models and cache them.
async function loadModel(onProgress, langCode = null) {
    const key = pickModelKey(langCode);
    const config = ML_MODELS[key];

    // Already loaded this model
    if (loadedModels[key]) {
        activeModelKey = key;
        modelReady = true;
        const shortName = config.id.split('/')[1];
        if (onProgress) onProgress({ status: 'ready', message: `${shortName} ready` });
        return;
    }

    if (modelLoading) return;
    modelLoading = true;

    try {
        const pipe = await ensurePipeline();
        const label = key === 'english' ? 'English sentiment' : 'multilingual sentiment';

        if (onProgress) onProgress({
            status: 'loading',
            message: `Downloading ${label} model...`,
        });

        loadedModels[key] = await pipe('text-classification', config.id, {
            progress_callback: (data) => {
                if (onProgress && data.progress !== undefined) {
                    onProgress({
                        status: 'progress',
                        progress: data.progress,
                        message: `Downloading: ${Math.round(data.progress)}%`,
                    });
                }
            },
        });

        activeModelKey = key;
        modelReady = true;
        modelLoading = false;
        if (onProgress) onProgress({ status: 'ready', message: 'Model ready' });
    } catch (err) {
        modelLoading = false;
        console.error('Failed to load ML model:', err);
        if (onProgress) onProgress({ status: 'error', message: 'Model failed to load' });
    }
}

// Switch active model based on language (loads if needed)
async function switchModelForLang(langCode, onProgress) {
    const key = pickModelKey(langCode);
    if (loadedModels[key]) {
        activeModelKey = key;
        modelReady = true;
        return;
    }
    // Need to download
    await loadModel(onProgress, langCode);
}

// Map ML sentiment output → specific emotion, using lexicon scores as hints
function pickPositiveEmotion(lexiconScores) {
    const candidates = ['joy', 'love', 'surprise', 'calm'];
    let best = 'joy', bestScore = 0;
    for (const c of candidates) {
        if ((lexiconScores[c] || 0) > bestScore) {
            bestScore = lexiconScores[c];
            best = c;
        }
    }
    return best;
}

function pickNegativeEmotion(lexiconScores) {
    const candidates = ['sadness', 'anger', 'fear'];
    let best = 'sadness', bestScore = 0;
    for (const c of candidates) {
        if ((lexiconScores[c] || 0) > bestScore) {
            bestScore = lexiconScores[c];
            best = c;
        }
    }
    return best;
}

// Map star ratings (1-5) to emotion
function starsToEmotion(starLabel, score, lexiconScores) {
    const stars = parseInt(starLabel);
    if (stars >= 5) return { dominant: pickPositiveEmotion(lexiconScores), confidence: score };
    if (stars === 4) return { dominant: pickPositiveEmotion(lexiconScores), confidence: score * 0.8 };
    if (stars === 3) return { dominant: 'calm', confidence: score * 0.6 };
    if (stars === 2) return { dominant: pickNegativeEmotion(lexiconScores), confidence: score * 0.8 };
    return { dominant: pickNegativeEmotion(lexiconScores), confidence: score };
}

// Map binary POSITIVE/NEGATIVE to emotion
function binaryToEmotion(label, score, lexiconScores) {
    if (label === 'POSITIVE') {
        return { dominant: pickPositiveEmotion(lexiconScores), confidence: score };
    }
    return { dominant: pickNegativeEmotion(lexiconScores), confidence: score };
}

async function analyzeML(text, lexiconScores) {
    if (!modelReady || !activeModelKey || !loadedModels[activeModelKey]) return null;

    try {
        const classifier = loadedModels[activeModelKey];
        const config = ML_MODELS[activeModelKey];
        const result = await classifier(text, { topk: config.labels.length });
        const top = result[0];

        let mapped;
        if (config.type === 'stars') {
            mapped = starsToEmotion(top.label, top.score, lexiconScores || {});
        } else {
            mapped = binaryToEmotion(top.label, top.score, lexiconScores || {});
        }

        return {
            dominant: mapped.dominant,
            confidence: mapped.confidence,
            rawLabel: top.label,
            rawScore: top.score,
            allScores: Object.fromEntries(result.map(r => [r.label, r.score])),
            modelType: config.type,
        };
    } catch {
        return null;
    }
}

// ===== Get language info by code (for manual override) =====
function getLanguageInfo(langCode) {
    return {
        lang: langCode,
        confidence: 1,
        name: LANG_NAMES[langCode] || langCode,
        speedMultiplier: LANG_SPEED[langCode] || 1.0,
    };
}

// ===== VAD (Valence-Arousal-Dominance) Analysis =====
let vadLexicon = null;
let vadLoading = false;

async function ensureVAD() {
    if (vadLexicon) return vadLexicon;
    if (vadLoading) return null;
    vadLoading = true;
    try {
        const resp = await fetch(new URL('./vad-lexicon.json', import.meta.url));
        vadLexicon = await resp.json();
        vadLoading = false;
        return vadLexicon;
    } catch (err) {
        console.warn('VAD lexicon failed to load:', err);
        vadLoading = false;
        return null;
    }
}

// Compute average VAD from text words
function computeVAD(text, langCode) {
    if (!vadLexicon) return null;

    const words = text.toLowerCase()
        .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
        .split(/\s+/)
        .filter(w => w.length > 1);

    // Try both the specific language and English as fallback
    const langDict = vadLexicon[langCode] || {};
    const enDict = vadLexicon.en || {};

    let sumV = 0, sumA = 0, sumD = 0, count = 0;

    for (const word of words) {
        const entry = langDict[word] || enDict[word];
        if (entry) {
            sumV += entry[0];
            sumA += entry[1];
            sumD += entry[2];
            count++;
        }
    }

    if (count === 0) return { valence: 0.5, arousal: 0.3, dominance: 0.5, matchCount: 0 };

    return {
        valence: sumV / count,
        arousal: sumA / count,
        dominance: sumD / count,
        matchCount: count,
    };
}

// Nuance labels: 2x2 grid (arousal x dominance) for each base emotion
const NUANCE_LABELS = {
    joy: {
        hA_hD: { en: 'Triumphant', it: 'Trionfante' },
        hA_lD: { en: 'Euphoric', it: 'Euforica' },
        lA_hD: { en: 'Content', it: 'Appagata' },
        lA_lD: { en: 'Serene', it: 'Serena' },
    },
    sadness: {
        hA_hD: { en: 'Bitter', it: 'Amara' },
        hA_lD: { en: 'Anguished', it: 'Angosciata' },
        lA_hD: { en: 'Melancholic', it: 'Malinconica' },
        lA_lD: { en: 'Resigned', it: 'Rassegnata' },
    },
    anger: {
        hA_hD: { en: 'Wrathful', it: 'Furibonda' },
        hA_lD: { en: 'Explosive', it: 'Esplosiva' },
        lA_hD: { en: 'Resentful', it: 'Rancorosa' },
        lA_lD: { en: 'Frustrated', it: 'Frustrata' },
    },
    fear: {
        hA_hD: { en: 'Alarmed', it: 'Allarmata' },
        hA_lD: { en: 'Panicked', it: 'In panico' },
        lA_hD: { en: 'Wary', it: 'Guardinga' },
        lA_lD: { en: 'Anxious', it: 'Ansiosa' },
    },
    surprise: {
        hA_hD: { en: 'Astonished', it: 'Sbalordita' },
        hA_lD: { en: 'Shocked', it: 'Scioccata' },
        lA_hD: { en: 'Impressed', it: 'Colpita' },
        lA_lD: { en: 'Intrigued', it: 'Incuriosita' },
    },
    love: {
        hA_hD: { en: 'Passionate', it: 'Appassionata' },
        hA_lD: { en: 'Infatuated', it: 'Infatuata' },
        lA_hD: { en: 'Devoted', it: 'Devota' },
        lA_lD: { en: 'Tender', it: 'Tenera' },
    },
    calm: {
        hA_hD: { en: 'Composed', it: 'Composta' },
        hA_lD: { en: 'Relaxed', it: 'Rilassata' },
        lA_hD: { en: 'Poised', it: 'Equilibrata' },
        lA_lD: { en: 'Peaceful', it: 'Pacifica' },
    },
};

function getNuanceLabel(emotion, vad, langCode) {
    if (!vad || vad.matchCount === 0) return null;

    const labels = NUANCE_LABELS[emotion];
    if (!labels) return null;

    const aKey = vad.arousal >= 0.5 ? 'hA' : 'lA';
    const dKey = vad.dominance >= 0.5 ? 'hD' : 'lD';
    const key = `${aKey}_${dKey}`;

    const entry = labels[key];
    if (!entry) return null;

    // Use Italian label if language is Italian, otherwise English
    return entry[langCode] || entry.it || entry.en;
}

// ===== Combined Analysis =====
// langOverride: null for auto-detect, or a language code (e.g. 'it', 'en')
async function analyzeText(text, langOverride = null) {
    if (!text || text.trim().length === 0) {
        return {
            emotion: { dominant: 'calm', confidence: 0, scores: {} },
            language: langOverride
                ? getLanguageInfo(langOverride)
                : { lang: 'en', confidence: 0, name: 'English', speedMultiplier: 1.0 },
            vad: null,
            nuance: null,
        };
    }

    // Load VAD lexicon in background (non-blocking on first call)
    ensureVAD();

    const language = langOverride ? getLanguageInfo(langOverride) : await detectLanguage(text);
    let emotion = analyzeLexicon(text);

    // If ML model is available, use it (much better than lexicon)
    if (modelReady && activeModelKey) {
        // Auto-switch model if language doesn't match
        const neededKey = pickModelKey(language.lang);
        if (neededKey !== activeModelKey && loadedModels[neededKey]) {
            activeModelKey = neededKey;
        }

        const mlResult = await analyzeML(text, emotion.scores);
        if (mlResult) {
            emotion = {
                ...emotion,
                dominant: mlResult.dominant,
                confidence: mlResult.confidence,
                allScores: mlResult.allScores,
                mlEnhanced: true,
                modelType: mlResult.modelType,
                rawLabel: mlResult.rawLabel,
            };
        }
    }

    // VAD nuance analysis
    const vad = computeVAD(text, language.lang);
    const nuance = getNuanceLabel(emotion.dominant, vad, language.lang);

    return { emotion, language, vad, nuance };
}

// ===== Exports =====
export {
    analyzeText,
    analyzeLexicon,
    detectLanguage,
    getLanguageInfo,
    loadModel,
    switchModelForLang,
    splitSentences,
    getLastNSentences,
    LANG_NAMES,
    LANG_SPEED,
    ML_MODELS,
};
