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

// ===== Language Detection via Trigram Profiles =====
const LANG_PROFILES = {
    en: 'the and ing ion tio ent ati for her ter hat tha ere his res ver all ons ith was rea are not',
    it: 'che ell ato ion one per ent are nte con ata tti ess tta eri anz del non tto gli zione all',
    es: 'que ión los del las ent con ado ción nte ero est por ara mos cia aba ies ado ier tra nes',
    fr: 'les ent des que ion ous ait eur ont pas ais men eme est com par eur sur tion iss dans',
    de: 'ein ich der die und den sch cht ber ung eit ver gen ter hen ach ine ges auf ste lic',
    pt: 'que ção ent ado ment ões est ção nte era mos con ado cia par ade ter com por ais pro',
    ru: 'ого что ать ени ест про ком ать ост ств это как для ных все ние при его мен ной',
    ja: 'のの をの にの はの との たの ての での ます かの がの しの いの もの れの なの',
    zh: '的是 是不 不了 了一 一在 在有 有人 人我 我他 他这 这个 个们 们中 中来 来上',
    ar: 'الع في من على وال ها ان ية ات ين لم بال ما كان ذلك هذا الم قال ذال',
    ko: '이다 하는 에서 으로 것이 하고 에는 하여 되는 한다 있는 지않 는것 부터',
    hi: 'का है में के ने की से को और पर हैं एक यह',
};

// Build trigram sets from profiles
const langTrigrams = {};
for (const [lang, profile] of Object.entries(LANG_PROFILES)) {
    langTrigrams[lang] = new Set(profile.split(' '));
}

const LANG_NAMES = {
    en: 'English', it: 'Italiano', es: 'Español', fr: 'Français',
    de: 'Deutsch', pt: 'Português', ru: 'Русский', ja: '日本語',
    zh: '中文', ar: 'العربية', ko: '한국어', hi: 'हिन्दी',
};

// Speed multiplier per language family
const LANG_SPEED = {
    it: 1.3, es: 1.3, pt: 1.25, fr: 1.15,  // Romance: faster, flowing
    en: 1.0, de: 0.9, nl: 0.9,              // Germanic: moderate
    ja: 0.8, zh: 0.85, ko: 0.8,             // CJK: measured
    ru: 1.1, pl: 1.05,                       // Slavic: dynamic
    ar: 1.1, hi: 1.05,                       // flowing
};

function extractTrigrams(text) {
    const clean = text.toLowerCase().replace(/[0-9\s]+/g, ' ').trim();
    const trigrams = {};
    for (let i = 0; i < clean.length - 2; i++) {
        const tri = clean.substring(i, i + 3);
        trigrams[tri] = (trigrams[tri] || 0) + 1;
    }
    return trigrams;
}

function detectLanguage(text) {
    if (!text || text.trim().length < 10) return { lang: 'en', confidence: 0 };

    const textTrigrams = extractTrigrams(text);
    const textTriSet = new Set(Object.keys(textTrigrams));

    let bestLang = 'en';
    let bestScore = 0;

    for (const [lang, profileSet] of Object.entries(langTrigrams)) {
        let matches = 0;
        for (const tri of textTriSet) {
            if (profileSet.has(tri)) matches++;
        }
        const score = matches / Math.max(profileSet.size, 1);
        if (score > bestScore) {
            bestScore = score;
            bestLang = lang;
        }
    }

    return {
        lang: bestLang,
        confidence: Math.min(bestScore * 5, 1),
        name: LANG_NAMES[bestLang] || bestLang,
        speedMultiplier: LANG_SPEED[bestLang] || 1.0,
    };
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

// ===== ML Model (Transformers.js) =====
let mlClassifier = null;
let modelLoading = false;
let modelReady = false;

async function loadModel(onProgress) {
    if (modelReady || modelLoading) return;
    modelLoading = true;

    try {
        const { pipeline, env } = await import(
            'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2'
        );
        // Use WASM backend, disable local model check
        env.allowLocalModels = false;

        if (onProgress) onProgress({ status: 'loading', message: 'Downloading emotion model...' });

        mlClassifier = await pipeline(
            'text-classification',
            'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
            {
                progress_callback: (data) => {
                    if (onProgress && data.progress !== undefined) {
                        onProgress({
                            status: 'progress',
                            progress: data.progress,
                            message: `Downloading: ${Math.round(data.progress)}%`,
                        });
                    }
                },
            }
        );

        modelReady = true;
        modelLoading = false;
        if (onProgress) onProgress({ status: 'ready', message: 'Model ready' });
    } catch (err) {
        modelLoading = false;
        console.error('Failed to load ML model:', err);
        if (onProgress) onProgress({ status: 'error', message: 'Model failed to load' });
    }
}

async function analyzeML(text) {
    if (!mlClassifier || !modelReady) return null;

    try {
        const result = await mlClassifier(text, { topk: 2 });
        // SST-2 returns POSITIVE/NEGATIVE labels
        const label = result[0].label;
        const score = result[0].score;

        // Map POSITIVE/NEGATIVE to emotions with nuance
        if (label === 'POSITIVE') {
            return score > 0.9
                ? { dominant: 'joy', confidence: score }
                : { dominant: 'calm', confidence: score * 0.8 };
        } else {
            return score > 0.9
                ? { dominant: 'sadness', confidence: score }
                : { dominant: 'anger', confidence: score * 0.7 };
        }
    } catch {
        return null;
    }
}

// ===== Combined Analysis =====
async function analyzeText(text) {
    if (!text || text.trim().length === 0) {
        return {
            emotion: { dominant: 'calm', confidence: 0, scores: {} },
            language: { lang: 'en', confidence: 0, name: 'English', speedMultiplier: 1.0 },
        };
    }

    const language = detectLanguage(text);
    let emotion = analyzeLexicon(text);

    // If ML model is available and lexicon confidence is low, enhance with ML
    if (modelReady && emotion.matchCount < 3) {
        const mlResult = await analyzeML(text);
        if (mlResult && mlResult.confidence > emotion.confidence) {
            emotion = {
                ...emotion,
                dominant: mlResult.dominant,
                confidence: mlResult.confidence,
                mlEnhanced: true,
            };
        }
    }

    return { emotion, language };
}

// ===== Exports =====
export {
    analyzeText,
    analyzeLexicon,
    detectLanguage,
    loadModel,
    splitSentences,
    getLastNSentences,
    modelReady,
};
