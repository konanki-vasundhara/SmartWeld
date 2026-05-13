import React, { useState, useRef, useEffect, useCallback } from 'react';
import TopAppBar from '../components/TopAppBar';
import useAiStore from '../store/useAiStore';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Language config: display name -> { speechCode, aiLang, responsiveVoiceName }
const LANGUAGES = {
  English: { speechCode: 'en-US', aiLang: 'English', rvVoice: 'UK English Female' },
  Telugu:  { speechCode: 'te-IN', aiLang: 'Telugu',  rvVoice: 'Telugu Female' },
  Hindi:   { speechCode: 'hi-IN', aiLang: 'Hindi',   rvVoice: 'Hindi Female' },
  Marathi: { speechCode: 'mr-IN', aiLang: 'Marathi', rvVoice: 'Marathi Female' },
};

export default function VassuAi() {
  const { messages, isTyping, sendMessageToAi } = useAiStore();
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');
  const [noVoiceWarning, setNoVoiceWarning] = useState(false);
  const endOfMessagesRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null); // For Google TTS audio fallback

  const langConfig = LANGUAGES[selectedLang];
  const langConfigRef = useRef(langConfig);
  const voicesRef = useRef([]);

  // Keep langConfigRef current and check voice availability whenever language changes
  useEffect(() => {
    langConfigRef.current = LANGUAGES[selectedLang];
    // Check if a voice for the selected language exists
    const voices = voicesRef.current.length > 0
      ? voicesRef.current
      : window.speechSynthesis?.getVoices() || [];
    const code = LANGUAGES[selectedLang].speechCode;
    const hasVoice = voices.some(v => v.lang === code || v.lang.startsWith(code.split('-')[0]));
    setNoVoiceWarning(!hasVoice && selectedLang !== 'English');
  }, [selectedLang]);

  // Load voices - they load asynchronously in most browsers
  useEffect(() => {
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis?.getVoices() || [];
    };
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // speakText: uses ResponsiveVoice for Telugu/Hindi/Marathi, Web Speech API for English
  const speakText = useCallback((text) => {
    const cleanText = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#/g, '').trim();
    if (!cleanText) return;

    const config = langConfigRef.current;

    // Use ResponsiveVoice if available (supports Telugu natively)
    if (window.responsiveVoice) {
      window.responsiveVoice.cancel();
      setIsSpeaking(true);
      window.responsiveVoice.speak(cleanText, config.rvVoice, {
        onstart: () => setIsSpeaking(true),
        onend: () => setIsSpeaking(false),
        onerror: () => setIsSpeaking(false),
        rate: 0.9,
        pitch: 1,
        volume: 1,
      });
      return;
    }

    // Fallback to Web Speech API
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const doSpeak = () => {
      const voices = voicesRef.current.length > 0
        ? voicesRef.current
        : window.speechSynthesis.getVoices();
      const code = config.speechCode;
      const preferred = voices.find(v => v.lang === code) ||
                        voices.find(v => v.lang.startsWith(code.split('-')[0])) ||
                        voices[0];
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 0.9;
      utterance.volume = 1;
      utterance.lang = code;
      if (preferred) utterance.voice = preferred;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    };
    if (voicesRef.current.length === 0) setTimeout(doSpeak, 200);
    else doSpeak();
  }, []);

  // Auto-speak when a new AI message arrives
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.sender === 'ai' && messages.length > 1) {
      setTimeout(() => speakText(lastMsg.text), 300);
    }
  }, [messages, speakText]);

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    window.responsiveVoice?.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  };

  const handleMicClick = () => {
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = langConfig.speechCode;  // Use selected language
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setInputValue(transcript);

      // If final result, auto-send with language context
      if (event.results[event.results.length - 1].isFinal) {
        setIsListening(false);
        const query = selectedLang !== 'English'
          ? `Please reply in ${langConfig.aiLang}. Question: ${transcript}`
          : transcript;
        sendMessageToAi(query);
        setInputValue('');
      }
    };

    recognition.onerror = (e) => {
      console.error('Speech recognition error:', e.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const text = inputValue;
    setInputValue('');
    // Prepend language instruction if non-English
    const query = selectedLang !== 'English'
      ? `Please reply in ${langConfig.aiLang}. Question: ${text}`
      : text;
    sendMessageToAi(query);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      <TopAppBar 
        title="Smart Weld"
        rightElement={
          <>
            <div className="hidden md:flex gap-4">
              <button className="text-on-surface-variant font-label-bold text-label-bold px-3 py-2 rounded-lg hover:bg-surface-container-high transition-colors">HISTORY</button>
              <button className="text-on-surface-variant font-label-bold text-label-bold px-3 py-2 rounded-lg hover:bg-surface-container-high transition-colors">GUIDES</button>
            </div>
            {/* Stop Speaking Button */}
            {isSpeaking && (
              <button onClick={stopSpeaking} className="bg-error/10 text-error p-2 rounded-full border border-error/30 hover:bg-error/20 transition-all animate-pulse" title="Stop speaking">
                <span className="material-symbols-outlined text-[20px]" data-icon="volume_off">volume_off</span>
              </button>
            )}
            <button className="bg-surface-container-high p-2 rounded-full hover:bg-outline-variant transition-all">
              <span className="material-symbols-outlined text-on-surface" data-icon="notifications">notifications</span>
            </button>
          </>
        }
      />
<main className="pt-20 pb-24 px-margin-mobile md:px-margin-desktop max-w-5xl mx-auto flex flex-col h-screen">
<div className="flex-1 flex flex-col bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
<div className="p-4 border-b border-outline-variant bg-surface flex items-center justify-between">
<div className="flex items-center gap-4">
<div className="relative">
<div className="w-12 h-12 rounded-full overflow-hidden border-2 border-electric-blue">
<img className="w-full h-full object-cover" data-alt="A highly detailed 3D render of a futuristic robot head with glowing blue optic sensors and a sleek metallic chassis. The robot is set against a clean industrial background with soft diffused lighting that emphasizes its high-tech construction. The visual style is premium tech with a focus on precision and digital intelligence." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCysAXpmLM0_Q2bhoFHRxjAo6WEsjISqtGYoSm4pLsOXkX7EqdD83PpsfeBlNCzDwb-C8aa6moI7fK4rckX7HEDYyLRBGyj47myn065TRRQpEtF-aKyIlyX5BwpyKzriiJDuoPbG7ir2HK4jbcGp3nd5folqChBJ9-8PuZ9NJMG7qSBFbIwvduk9O6Z50m3pgDyXBN6ltC80hn_I2chU-6auotvPMBdJz4zC5ewQgZb-th-Hh_5CfSA4dXiSe3qGhetGgqKA8jgpoNh"/>
</div>
<div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
</div>
<div>
<h2 className="font-headline-lg text-lg font-bold">Vassu AI</h2>
<p className="text-body-sm text-outline font-label-bold">
  {isSpeaking ? '🔊 SPEAKING...' : isListening ? '🎙️ LISTENING...' : 'PREMIUM INDUSTRIAL ASSISTANT'}
</p>
</div>
</div>
<div className="flex items-center gap-2">
<select 
  value={selectedLang}
  onChange={(e) => setSelectedLang(e.target.value)}
  className="bg-surface-container-high border-none rounded-lg text-label-bold font-label-bold px-3 py-1 text-on-surface focus:ring-2 focus:ring-primary"
>
<option>English</option>
<option>Telugu</option>
<option>Hindi</option>
<option>Marathi</option>
</select>
</div>
</div>
<div className="flex-1 overflow-y-auto p-4 space-y-6">
{/* Voice not available warning */}
{noVoiceWarning && (
  <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 flex items-start gap-3">
    <span className="material-symbols-outlined text-amber-500 text-[20px] mt-0.5" data-icon="info">info</span>
    <div>
      <p className="text-sm font-bold text-amber-800">{selectedLang} voice not installed on this device</p>
      <p className="text-xs text-amber-700 mt-0.5">Using Google TTS as fallback. For best quality: <strong>Windows Settings → Time &amp; Language → Speech → Add voices → Search "{selectedLang}"</strong></p>
    </div>
    <button onClick={() => setNoVoiceWarning(false)} className="ml-auto text-amber-500 hover:text-amber-700">
      <span className="material-symbols-outlined text-[18px]">close</span>
    </button>
  </div>
)}
<div className="flex flex-col items-center justify-center py-10 opacity-60">
<span className="material-symbols-outlined text-6xl text-primary-fixed-dim mb-4" data-icon="smart_toy">smart_toy</span>
<p className="text-center font-headline-lg text-lg">How can I help your operations today?</p>
</div>
{messages.map((msg) => (
  msg.sender === 'ai' ? (
    <div key={msg.id} className="flex justify-start max-w-[85%]">
      <div className="bg-surface-container-high text-on-surface p-4 rounded-tr-xl rounded-bl-xl rounded-br-xl border border-outline-variant">
        <p className="text-body-md whitespace-pre-wrap">{msg.text}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] font-label-bold opacity-50">{msg.time}</span>
          <button 
            onClick={() => speakText(msg.text)}
            className="text-outline hover:text-primary transition-colors ml-3"
            title="Read aloud"
          >
            <span className="material-symbols-outlined text-[16px]" data-icon="volume_up">volume_up</span>
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div key={msg.id} className="flex justify-end max-w-[85%] ml-auto">
      <div className="bg-primary text-on-primary p-4 rounded-tl-xl rounded-bl-xl rounded-br-xl">
        <p className="text-body-md whitespace-pre-wrap">{msg.text}</p>
        <span className="text-[10px] font-label-bold opacity-70 mt-2 block text-right">{msg.time}</span>
      </div>
    </div>
  )
))}
{isTyping && (
  <div className="flex justify-start max-w-[85%]">
    <div className="bg-surface-container-high text-on-surface p-4 rounded-tr-xl rounded-bl-xl rounded-br-xl border border-outline-variant flex items-center gap-2">
      <div className="w-2 h-2 bg-electric-blue rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-electric-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-2 h-2 bg-electric-blue rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
    </div>
  </div>
)}
<div ref={endOfMessagesRef} />
</div>
<div className="p-4 bg-surface-container border-t border-outline-variant">
<div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
<button onClick={() => setInputValue("How to fix a pipe leak?")} className="whitespace-nowrap bg-white border border-outline-variant px-4 py-2 rounded-full text-sm font-label-bold text-on-surface-variant hover:border-primary hover:text-primary transition-all">How to fix a pipe leak?</button>
<button onClick={() => setInputValue("Estimate tractor repair")} className="whitespace-nowrap bg-white border border-outline-variant px-4 py-2 rounded-full text-sm font-label-bold text-on-surface-variant hover:border-primary hover:text-primary transition-all">Estimate tractor repair</button>
<button onClick={() => setInputValue("Nearby welders")} className="whitespace-nowrap bg-white border border-outline-variant px-4 py-2 rounded-full text-sm font-label-bold text-on-surface-variant hover:border-primary hover:text-primary transition-all">Nearby welders</button>
<button onClick={() => setInputValue("Inventory check")} className="whitespace-nowrap bg-white border border-outline-variant px-4 py-2 rounded-full text-sm font-label-bold text-on-surface-variant hover:border-primary hover:text-primary transition-all">Inventory check</button>
</div>
<div className="flex items-center gap-3">
<div className="relative flex-1">
<input 
  className={`w-full bg-white border-2 rounded-xl px-4 py-3 text-body-md focus:ring-0 transition-all ${isListening ? 'border-safety-orange animate-pulse' : 'border-outline-variant focus:border-primary'}`}
  placeholder={isListening ? "🎙️ Listening... speak now" : "Ask Vassu about technical specs..."} 
  type="text"
  value={inputValue}
  onChange={(e) => setInputValue(e.target.value)}
  onKeyPress={handleKeyPress}
/>
<div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
<button className="text-outline hover:text-primary transition-colors">
<span className="material-symbols-outlined" data-icon="attachment">attachment</span>
</button>
<button className="text-outline hover:text-primary transition-colors">
<span className="material-symbols-outlined" data-icon="image">image</span>
</button>
</div>
</div>
{/* Mic Button - activates voice input */}
<button 
  onClick={handleMicClick}
  className={`p-3 rounded-xl flex items-center justify-center transition-all ${
    isListening 
      ? 'bg-error text-white scale-110 animate-pulse shadow-lg' 
      : 'bg-safety-orange text-white hover:scale-95 active:scale-90'
  }`}
  title={isListening ? 'Stop listening' : 'Speak to Vassu'}
>
<span className="material-symbols-outlined" data-icon={isListening ? 'mic_off' : 'mic'}>
  {isListening ? 'mic_off' : 'mic'}
</span>
</button>
<button onClick={handleSend} className="bg-primary text-white p-3 rounded-xl flex items-center justify-center hover:scale-95 transition-transform active:scale-90">
<span className="material-symbols-outlined" data-icon="send">send</span>
</button>
</div>
</div>
</div>
</main>
    </>
  );
}
