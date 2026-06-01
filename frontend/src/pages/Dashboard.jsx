import { motion, AnimatePresence } from 'framer-motion';
import { 
  Maximize, 
  Minimize,
  Settings2, 
  Plus, 
  Mic,
  MicOff,
  ArrowRight,
  User,
  Bot,
  X,
  AlertCircle,
  RefreshCw,
  Camera,
  ImagePlus
} from 'lucide-react';
import { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

// Simple inline markdown renderer
const RenderMessage = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-1 leading-relaxed text-[14px]">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-2" />;

        // Heading: # or ##
        if (line.startsWith('# ')) {
          return <p key={i} className="text-base font-bold mt-2 mb-1">{line.slice(2)}</p>;
        }
        if (line.startsWith('## ')) {
          return <p key={i} className="font-bold text-brand-500 mt-2">{line.slice(3)}</p>;
        }
        if (line.startsWith('### ')) {
          return <p key={i} className="font-semibold mt-1">{line.slice(4)}</p>;
        }

        // Horizontal rule
        if (line.trim() === '---') {
          return <hr key={i} className="border-gray-200 dark:border-gray-700 my-2" />;
        }

        // Render inline bold (**text**) within any line
        const renderInline = (str) => {
          const parts = str.split(/(\*\*[^*]+\*\*)/g);
          return parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
            }
            return part;
          });
        };

        // Bullet point
        if (line.startsWith('• ') || line.startsWith('- ') || line.match(/^\d️⃣/)) {
          return (
            <div key={i} className="flex gap-2 items-start">
              <span className="mt-0.5 shrink-0 text-brand-500">›</span>
              <p>{renderInline(line.replace(/^[•\-]\s/, ''))}</p>
            </div>
          );
        }

        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [messages, setMessages] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState('Forge Ultra');
  const [autoSave, setAutoSave] = useState(true);
  const [attachedImage, setAttachedImage] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Fullscreen error:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // ── Mic / Speech-to-text ─────────────────────────────────────────
  const finalTranscriptRef = useRef('');
  const isListeningRef = useRef(false);
  const initialQueryRef = useRef('');

  const stopListening = () => {
    isListeningRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch(e) {}
      recognitionRef.current = null;
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    finalTranscriptRef.current = '';
    
    // Capture whatever text is already in the input so we append to it
    // Use a function callback in setQuery to guarantee we get the latest state
    // But since startListening is recreated or might have stale state, 
    // it's safest to just capture the current query via a ref if we can,
    // or just rely on the closure if startListening is fresh.
    initialQueryRef.current = query.trim();

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    isListeningRef.current = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }
      finalTranscriptRef.current = finalText;
      
      const prefix = initialQueryRef.current ? initialQueryRef.current + ' ' : '';
      setQuery(prefix + finalText + interimText);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      // Don't stop on no-speech or network errors — just let it retry
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        alert('Microphone access denied. Please allow microphone permissions in your browser.');
        stopListening();
      }
    };

    recognition.onend = () => {
      // Auto-restart if we're still supposed to be listening
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch(e) {
          stopListening();
        }
      } else {
        setIsListening(false);
      }
    };

    try {
      recognition.start();
    } catch(e) {
      console.error('Failed to start recognition:', e);
      stopListening();
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // ── Camera (getUserMedia) ───────────────────────────────────────
  const openCamera = async () => {
    setShowAttachMenu(false);
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      // Wait for the video element to mount
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error('Camera error:', err);
      alert('Could not access camera. Please allow camera permissions.');
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    setAttachedImage(dataUrl);
    closeCamera();
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  // ── Photo from gallery ──────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAttachedImage(ev.target.result);
    reader.readAsDataURL(file);
    setShowAttachMenu(false);
  };

  const removeAttachedImage = () => {
    setAttachedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e, overrideQuery) => {
    if (e) e.preventDefault();
    const text = (overrideQuery || query).trim();
    if (!text || isProcessing) return;

    setHasSubmitted(true);
    setIsProcessing(true);
    setError(null);

    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setQuery('');

    try {
      const token = user?.token;
      const headers = token && !token.startsWith('guest')
        ? { Authorization: `Bearer ${token}` }
        : {};

      const { data } = await axios.post(
        'http://localhost:5000/api/ai/chat',
        { message: text, history: messages.slice(-6) },
        { headers }
      );

      const aiMsg = { role: 'ai', content: data.content, imageUrl: data.imageUrl || null };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('API error:', err);
      setError('Could not reach the server. Make sure the backend is running on port 5000.');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    handleSubmit(null, suggestion);
  };

  const suggestions = [
    "Write a catchy Instagram caption for a sunflower photo",
    "Generate a Facebook Ad for a summer sale",
    "Draft a welcome email for new subscribers",
    "Create a blog post outline about AI marketing",
  ];

  return (
    <div className="h-full flex flex-col relative text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 relative z-10 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heading mb-1">
            AI Marketing Assistant
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Ask anything — captions, ads, emails, SEO, strategies
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-[#151b2b] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm shadow-sm"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
          <button
            onClick={() => setShowOptions(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-[#151b2b] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm shadow-sm"
          >
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">Options</span>
          </button>
          {messages.length > 0 && (
            <button
              onClick={() => { setMessages([]); setHasSubmitted(false); setError(null); }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-[#151b2b] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm shrink-0"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto mb-4 relative">
        {!hasSubmitted ? (
          // Welcome / Orb State
          <div className="h-full flex flex-col items-center justify-center relative">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/5 dark:bg-brand-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-400/5 dark:bg-brand-400/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
              className="relative w-48 h-48 flex items-center justify-center mb-6"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.div
                className="absolute inset-0 rounded-full border border-brand-500/20 dark:border-brand-500/30 blur-[2px]"
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute inset-6 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 opacity-40 dark:opacity-60 blur-2xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="absolute inset-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 shadow-[0_0_40px_rgba(167,139,250,0.4)] dark:shadow-[0_0_60px_rgba(167,139,250,0.6)]" />
              <div className="absolute inset-14 rounded-full bg-white opacity-40 dark:opacity-30 blur-sm" />
              <Bot className="relative z-10 w-8 h-8 text-white drop-shadow-lg" />
            </motion.div>

            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 font-heading">
              What can I create for you?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 text-center max-w-md">
              I can write Instagram captions, Facebook ads, emails, blog posts, SEO content, and full marketing strategies.
            </p>
          </div>
        ) : (
          // Chat History State
          <div className="max-w-4xl mx-auto space-y-5 pb-4 px-1">
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-brand-400 flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-brand-500/20">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                    msg.role === 'user'
                      ? 'bg-brand-500 text-white rounded-tr-sm shadow-md shadow-brand-500/10 text-sm'
                      : 'bg-white dark:bg-[#151b2b] text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800/50 rounded-tl-sm shadow-sm'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    ) : (
                      <div className="space-y-4">
                        {msg.imageUrl && (
                          <div className="relative group rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700/50">
                            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse -z-10" />
                            <img 
                              src={msg.imageUrl} 
                              alt="AI Generated" 
                              className="w-full h-auto max-w-sm rounded-xl object-cover transition-transform duration-500 group-hover:scale-105"
                              onLoad={(e) => {
                                if (e.target.previousSibling) {
                                  e.target.previousSibling.style.display = 'none';
                                }
                              }}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                              <a 
                                href={msg.imageUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-md transition-colors shadow-lg border border-white/20 font-medium text-sm"
                              >
                                <span>View Full Size</span>
                              </a>
                            </div>
                          </div>
                        )}
                        <RenderMessage text={msg.content} />
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Processing indicator */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 justify-start"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-brand-400 flex items-center justify-center shrink-0 mt-1 animate-pulse">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-white dark:bg-[#151b2b] border border-gray-100 dark:border-gray-800/50 rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                  <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="w-full max-w-4xl mx-auto shrink-0 relative z-10">
        <form onSubmit={handleSubmit} className="relative bg-white dark:bg-[#151b2b] border border-gray-200 dark:border-gray-700/50 rounded-2xl p-2 shadow-xl dark:shadow-2xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isProcessing}
            placeholder={isProcessing ? 'Forge AI is thinking...' : 'Ask anything — captions, ads, emails, strategies...'}
            className="w-full bg-transparent text-gray-900 dark:text-white px-4 py-3 pb-12 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500 text-base disabled:opacity-50"
          />

          {/* Hidden file input for gallery */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Attached image preview */}
          {attachedImage && (
            <div className="absolute left-4 bottom-14 flex items-center gap-2 bg-white dark:bg-[#1e2537] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 shadow-md">
              <img src={attachedImage} alt="attachment" className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Image attached</span>
              <button
                type="button"
                onClick={removeAttachedImage}
                className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Attach menu popup */}
          <AnimatePresence>
            {showAttachMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute left-4 bottom-14 bg-white dark:bg-[#1e2537] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-2 flex flex-col gap-1 z-20 min-w-[180px]"
              >
                <button
                  type="button"
                  onClick={openCamera}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-500/10 text-gray-700 dark:text-gray-200 transition-colors text-sm font-medium"
                >
                  <Camera className="w-4 h-4 text-brand-500" />
                  Take Photo
                </button>
                <button
                  type="button"
                  onClick={() => { fileInputRef.current?.click(); setShowAttachMenu(false); }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-500/10 text-gray-700 dark:text-gray-200 transition-colors text-sm font-medium"
                >
                  <ImagePlus className="w-4 h-4 text-brand-500" />
                  Choose Photo
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom toolbar — only Plus button */}
          <div className="absolute bottom-3 left-4 flex items-center gap-3 text-gray-400 dark:text-gray-500">
            <button
              type="button"
              onClick={() => setShowAttachMenu(prev => !prev)}
              className={`p-1 transition-colors rounded ${
                showAttachMenu || attachedImage ? 'text-brand-500' : 'hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              title="Attach photo"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <motion.button
              type="button"
              onClick={handleMicClick}
              whileTap={{ scale: 0.9 }}
              animate={isListening ? { boxShadow: ['0 0 0 0 rgba(167,139,250,0.5)', '0 0 0 10px rgba(167,139,250,0)', '0 0 0 0 rgba(167,139,250,0)'] } : {}}
              transition={isListening ? { duration: 1.2, repeat: Infinity } : {}}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                isListening
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/40'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
              title={isListening ? 'Stop listening' : 'Voice input'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </motion.button>
            <AnimatePresence>
              {(query.trim() || isProcessing) && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  type="submit"
                  disabled={isProcessing || !query.trim()}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all ${
                    isProcessing || !query.trim()
                      ? 'bg-brand-300 dark:bg-brand-700 cursor-not-allowed'
                      : 'bg-brand-500 hover:bg-brand-600 hover:scale-105 shadow-md shadow-brand-500/30'
                  }`}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </form>

        {/* Suggestions — only before first submit */}
        {!hasSubmitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4"
          >
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(s)}
                  className="px-4 py-2 rounded-full bg-white dark:bg-[#151b2b] border border-gray-200 dark:border-gray-800/80 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-brand-500/50 dark:hover:border-brand-500/50 transition-all text-sm shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Options Modal */}
      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowOptions(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-[#151b2b] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold font-heading">Dashboard Options</h2>
                <button
                  onClick={() => setShowOptions(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Model Selection */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div>
                    <p className="font-medium text-sm">AI Model</p>
                    <p className="text-xs text-gray-500 mt-0.5">Select the language model</p>
                  </div>
                  <select
                    value={selectedModel}
                    onChange={e => setSelectedModel(e.target.value)}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/30 cursor-pointer"
                  >
                    <option>Forge Ultra</option>
                    <option>Forge Fast</option>
                    <option>Forge Creative</option>
                  </select>
                </div>

                {/* Auto-Save Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div>
                    <p className="font-medium text-sm">Auto-Save History</p>
                    <p className="text-xs text-gray-500 mt-0.5">Save conversations automatically</p>
                  </div>
                  <button
                    onClick={() => setAutoSave(!autoSave)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${autoSave ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${autoSave ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Response Language */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div>
                    <p className="font-medium text-sm">Response Language</p>
                    <p className="text-xs text-gray-500 mt-0.5">Language for AI responses</p>
                  </div>
                  <select className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-500/30 cursor-pointer">
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => setShowOptions(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm transition-colors"
              >
                Save & Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={closeCamera}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative bg-black rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full mx-4"
            >
              {/* Close button */}
              <button
                onClick={closeCamera}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Video feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full aspect-[4/3] object-cover bg-gray-900"
              />

              {/* Capture controls */}
              <div className="flex items-center justify-center gap-4 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <button
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg"
                >
                  <div className="w-12 h-12 rounded-full bg-white" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
