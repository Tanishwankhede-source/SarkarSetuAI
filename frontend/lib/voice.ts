const LANG_MAP: Record<string, string> = {
  hi: "hi-IN",
  en: "en-IN",
  mr: "mr-IN",
  ta: "ta-IN",
  te: "te-IN",
  bn: "bn-IN",
  gu: "gu-IN",
  pa: "pa-IN",
  kn: "kn-IN",
  ml: "ml-IN",
};

export function detectLanguage(text: string): string {
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  if (/[\u0A80-\u0AFF]/.test(text)) return "gu";
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta";
  if (/[\u0C00-\u0C7F]/.test(text)) return "te";
  if (/[\u0980-\u09FF]/.test(text)) return "bn";
  return "en";
}

export function getSpeechLang(lang: string): string {
  return LANG_MAP[lang] || "hi-IN";
}

type SpeechRecognitionCtor = new () => any;

export function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function speakText(text: string, lang = "hi-IN", onEnd?: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.92;
  utterance.pitch = 1;
  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export const VOICE_PROMPTS = {
  hi: {
    listening: "सुन रहा हूं… बोलिए",
    thinking: "आपके प्रश्न का उत्तर तैयार कर रहा हूं…",
    tapToSpeak: "बोलने के लिए माइक दबाएं",
    placeholder: "योजना, दस्तावेज़, या आवेदन के बारे में पूछें…",
  },
  en: {
    listening: "Listening… speak now",
    thinking: "Preparing your answer…",
    tapToSpeak: "Tap mic to speak",
    placeholder: "Ask about schemes, documents, or applications…",
  },
};

export function getVoicePrompts(lang: string) {
  return VOICE_PROMPTS[lang === "en" ? "en" : "hi"];
}
