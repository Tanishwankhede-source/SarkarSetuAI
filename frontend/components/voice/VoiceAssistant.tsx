"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Volume2, VolumeX, X, MessageCircle } from "lucide-react";
import { triggerVoiceChat } from "@/lib/api";
import { streamAgentEvents } from "@/lib/streaming";
import {
  detectLanguage,
  getSpeechLang,
  getSpeechRecognition,
  getVoicePrompts,
  speakText,
  stopSpeaking,
} from "@/lib/voice";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  lang?: string;
}

export default function VoiceAssistant() {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lang, setLang] = useState("hi");
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const prompts = getVoicePrompts(lang);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const handleResponse = useCallback(async (query: string) => {
    if (!query.trim()) return;
    const detected = detectLanguage(query);
    setLang(detected);
    setMessages((m) => [...m, { role: "user", text: query, lang: detected }]);
    setTextInput("");
    setThinking(true);

    try {
      const res = await triggerVoiceChat(query, detected);
      let answer = "";
      for await (const ev of streamAgentEvents(res)) {
        if (ev.type === "complete" && ev.content) {
          answer = ev.content;
          const respLang = (ev.result as { language?: string })?.language || detected;
          setMessages((m) => [...m, { role: "assistant", text: answer, lang: respLang }]);
          setSpeaking(true);
          speakText(answer, getSpeechLang(respLang), () => setSpeaking(false));
        }
      }
      if (!answer) {
        const fallback = detected === "hi"
          ? "क्षमा करें, उत्तर प्राप्त नहीं हुआ। कृपया पुनः प्रयास करें।"
          : "Sorry, I could not get an answer. Please try again.";
        setMessages((m) => [...m, { role: "assistant", text: fallback, lang: detected }]);
      }
    } catch {
      const err = detected === "hi"
        ? "कनेक्शन समस्या। कृपया बाद में पुनः प्रयास करें।"
        : "Connection issue. Please try again later.";
      setMessages((m) => [...m, { role: "assistant", text: err, lang: detected }]);
    } finally {
      setThinking(false);
    }
  }, []);

  const startListening = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR) {
      setOpen(true);
      return;
    }
    stopSpeaking();
    const recognition = new SR();
    recognition.lang = getSpeechLang(lang);
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      handleResponse(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setOpen(true);
  }, [lang, handleResponse]);

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="voice-fab"
        aria-label="Open voice assistant"
        title="Voice Assistant / आवाज़ सहायक"
      >
        <Mic size={22} />
        <span className="voice-fab-label">आवाज़ सहायक</span>
      </button>

      {/* Panel */}
      {open && (
        <div className="voice-panel">
          <div className="voice-panel-header">
            <div>
              <h3 className="text-sm font-bold text-white">SarkarSetu Voice Assistant</h3>
              <p className="text-xs text-white/80 font-devanagari">आवाज़ सहायक — किसी भी भाषा में पूछें</p>
            </div>
            <button type="button" onClick={() => { setOpen(false); stopSpeaking(); stopListening(); }} className="text-white/80 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="voice-messages">
            {messages.length === 0 && (
              <div className="voice-welcome">
                <MessageCircle size={32} className="mx-auto mb-2 text-gov-saffron" />
                <p className="font-devanagari text-sm font-semibold text-gov-navy">नमस्ते! मैं आपकी सहायता के लिए यहाँ हूँ</p>
                <p className="mt-1 text-xs text-gray-600">Ask about schemes, documents, eligibility, or how to apply — in any language.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["मेरी योजनाएं कौन सी हैं?", "कौन से दस्तावेज़ चाहिए?", "How do I apply?"].map((q) => (
                    <button key={q} type="button" onClick={() => handleResponse(q)} className="voice-quick-btn">{q}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`voice-bubble ${msg.role === "user" ? "voice-bubble-user" : "voice-bubble-assistant"}`}>
                {msg.text}
              </div>
            ))}
            {thinking && (
              <div className="voice-bubble voice-bubble-assistant animate-pulse">{prompts.thinking}</div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="voice-controls">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleResponse(textInput)}
              placeholder={prompts.placeholder}
              className="voice-input"
            />
            <button
              type="button"
              onClick={listening ? stopListening : startListening}
              className={`voice-mic-btn ${listening ? "voice-mic-active" : ""}`}
              title={prompts.tapToSpeak}
            >
              {listening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button
              type="button"
              onClick={() => speaking ? stopSpeaking() : null}
              className="voice-speak-btn"
              title="Stop speaking"
              disabled={!speaking}
            >
              {speaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button type="button" onClick={() => handleResponse(textInput)} className="gov-btn-saffron !py-2 !px-3 text-xs">
              Send
            </button>
          </div>
          {listening && <p className="voice-listening-hint">{prompts.listening}</p>}
        </div>
      )}
    </>
  );
}
