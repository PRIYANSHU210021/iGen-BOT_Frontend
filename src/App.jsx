import { useRef, useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const maxHeight = 160;
      const scrollHeight = textarea.scrollHeight;
      textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [message]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chatHistory, botTyping]);

  const typeText = (text, delay = 20) =>
    new Promise((resolve) => {
      let i = 0;
      let typedText = "";
      const interval = setInterval(() => {
        typedText += text[i];
        i++;
        setChatHistory((prev) => {
          const last = prev.slice(-1)[0];
          return [...prev.slice(0, -1), { ...last, bot: typedText }];
        });
        if (i >= text.length) {
          clearInterval(interval);
          resolve();
        }
      }, delay);
    });

  const sendMessage = async () => {
    if (!message.trim()) return;
    setLoading(true);
    const userMessage = message;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Show user message immediately
    setChatHistory((prev) => [
      ...prev,
      {
        user: userMessage,
        bot: "Typing...",
        time: timestamp,
      }
    ]);
    setMessage(""); // Clear input
    setBotTyping(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      const replyText = data.reply;

      await typeText(replyText); // Typing animation

    } catch (error) {
      setChatHistory((prev) => {
        const last = prev.slice(-1)[0];
        return [...prev.slice(0, -1), { ...last, bot: "Error: Could not fetch reply." }];
      });
    }

    setBotTyping(false);
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat text-white flex flex-col"
      style={{
        backgroundImage:
          "url('https://image.slidesdocs.com/responsive-images/background/website-technology-light-effect-powerpoint-background_1263816249__960_540.jpg')",
      }}
    >
      <div className="backdrop-blur-sm bg-black/80 flex flex-col flex-grow justify-between font-sans p-4">
        <div className="flex items-center justify-center mb-4 space-x-4">
          <img className="h-20 w-14 rounded-4xl" src="/negi.png" alt="Negi Sir" />
          <h1 className="text-2xl font-bold text-gray-400 drop-shadow-lg">
            <span className="text-[#ffffff]">iGEN</span>{' '}
            <span className="text-[#00B894]">Chatbot</span>
          </h1>
        </div>

        {/* Chat Area */}
        <div ref={chatContainerRef} className="flex-grow w-full max-w-3xl mx-auto bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-white/30 overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-transparent">
          <div className="flex flex-col gap-4">
            {chatHistory.length === 0 ? (
              <p className="text-gray-400 text-center">Suru Kare...?</p>
            ) : (
              chatHistory.map((chat, index) => (
                <div key={index} className="flex flex-col gap-2">
                  {/* User Message */}
                  <div className="self-end bg-gray-600/80 px-4 py-2 rounded-lg max-w-xs text-right shadow-md animate-fadeIn">
                    <p className="text-white break-words">{chat.user}</p>
                    <p className="text-[10px] text-gray-300 mt-1">{chat.time}</p>
                  </div>

                  {/* Bot Message */}
                  <div className="self-start bg-white/10 px-4 py-2 rounded-lg max-w-xs text-left shadow-md animate-fadeIn">
                    <p className="text-white whitespace-pre-line break-words">
                      {chat.bot}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">{chat.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Input */}
        <div className="w-full max-w-3xl mx-auto mt-2 flex items-center gap-3">
          <textarea
            ref={textareaRef}
            rows="1"
            className="flex-grow max-h-[160px] overflow-y-auto p-4 text-white rounded-xl resize-none bg-gray-900 placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-transparent"
            placeholder="Ready...."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ overflowY: message.split(" ").length > 30 ? "auto" : "hidden" }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || botTyping}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-tr from-gray-800 to-gray-600 hover:from-gray-700 hover:to-gray-500 text-white shadow-lg shadow-gray-900/50 backdrop-blur-md transition duration-300 ease-in-out disabled:opacity-50"
            title="Send"
          >
            {loading || botTyping ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            ) : (
              <svg className="w-8 h-8 flex ml-2" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-9.193 5.397A1 1 0 014 15.694V8.306a1 1 0 011.56-.826l9.192 5.397z"></path>
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 text-xs text-gray-500 space-x-2">
        <span>Negi Sir Model</span>
        <span>By Priyanshu</span>
        <span>v1.0</span>
      </div>

      {/* Tailwind Animation */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.4s ease-in-out;
          }
        `}
      </style>
    </div>
  );
}

export default App;
