import { create } from 'zustand';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash-lite';
const API_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${apiKey}`;

const SYSTEM_PROMPT = `You are Vassu, a highly advanced industrial welding assistant for the Smart Weld application. 
You provide concise, professional, and highly accurate engineering advice related to welding, metallurgy, material science, and safety standards (ISO, AWS, ASME).
Keep your answers helpful and to-the-point.`;

const useAiStore = create((set, get) => ({
  messages: [
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! I am Vassu, your Smart Weld AI assistant. I can help you with welding specs, material selection, safety protocols, and repair estimates. How can I assist you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ],
  isTyping: false,
  chatHistory: [],

  addMessage: (text, sender = 'user') => set((state) => ({
    messages: [
      ...state.messages,
      {
        id: Date.now(),
        sender,
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]
  })),

  sendMessageToAi: async (text) => {
    get().addMessage(text, 'user');

    if (!apiKey) {
      set({ isTyping: true });
      setTimeout(() => {
        get().addMessage("I am currently in offline mode. Please add your Gemini API key to the .env.local file to activate my neural net!", 'ai');
        set({ isTyping: false });
      }, 800);
      return;
    }

    const updatedHistory = [
      ...get().chatHistory,
      { role: 'user', parts: [{ text }] }
    ];

    // Prepend system context as first message if this is the start of the conversation
    const historyWithContext = get().chatHistory.length === 0
      ? [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
          { role: 'model', parts: [{ text: 'Understood. I am Vassu, your Smart Weld industrial AI assistant. I am ready to help with welding, metallurgy, materials, and safety standards.' }] },
          { role: 'user', parts: [{ text }] }
        ]
      : updatedHistory;

    try {
      set({ isTyping: true });

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: historyWithContext,
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7,
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || `HTTP ${response.status}`);
      }

      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'I could not generate a response. Please try again.';

      set((state) => ({
        chatHistory: [
          ...historyWithContext,
          { role: 'model', parts: [{ text: aiText }] }
        ]
      }));

      get().addMessage(aiText, 'ai');

    } catch (error) {
      console.error("Gemini API Error:", error);
      get().addMessage(`Error: ${error.message}. Please check your API key and internet connection.`, 'ai');
    } finally {
      set({ isTyping: false });
    }
  }
}));

export default useAiStore;
