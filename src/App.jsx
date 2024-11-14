import { useState, useRef, useEffect } from "react";
import "./App.css";
import axios from "axios";
import ReactMarkdown from "react-markdown";

function App() {
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);

  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, generatingAnswer]);

  async function generateAnswer(e) {
    e.preventDefault();
    if (!question.trim()) return;
    
    setGeneratingAnswer(true);
    const currentQuestion = question;
    setQuestion(""); 
    
    setChatHistory(prev => [...prev, { type: 'question', content: currentQuestion }]);
    
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${
          import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT
        }`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: question }] }], 
        },
      });

      const aiResponse = response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setChatHistory(prev => [...prev, { type: 'answer', content: aiResponse }]);
      setAnswer(aiResponse);
    } catch (error) {
      console.log(error);
      setAnswer("Sorry - Something went wrong. Please try again!");
    }
    setGeneratingAnswer(false);
  }

  return (
    <div className="fixed inset-0">
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400 via-pink-300 to-red-300 z-0 animate-gradient"></div>
      {/* Video Background */}
      <video 
        className="absolute inset-0 w-full h-full object-cover" 
        autoPlay 
        loop 
        muted
      >
        <source src="/src/assets/bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="h-full max-w-4xl mx-auto flex flex-col p-3 relative z-10">
        {/* Fixed Header */}
        <header className="text-center py-4">
          <a href="#" 
             target="_blank" 
             rel="noopener noreferrer"
             className="block">
            <h1 className="text-4xl font-bold text-white hover:text-pink-100 transition-colors">
              MoodBot
            </h1>
          </a>
        </header>

        
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto mb-4 p-4 hide-scrollbar glassmorphism slide-in"
        >
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 fade-in">
              <div className="bg rounded-xl p-8 max-w-2xl glassmorphism">
                <h2 className="text-2xl font-bold text-white mb-4">Welcome to MoodBot! </h2>
                <p className="text-gray-600 mb-4">
                Your Personal Companion for Emotional Wellbeing and More. Feeling overwhelmed, excited, or just need someone to talk to? MoodBot is here to support you. Whether you’ve had an amazing day or need a little pick-me-up, MoodBot is designed to listen, interact, and offer guidance whenever you need it.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
                    <span className="text-blue-500">💡</span> Emotionally Aware Conversations
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
                    <span className="text-blue-500">⏰</span> Available Anytime, Anywhere
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
                    <span className="text-blue-500">🔐</span> Safe and Confidential
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
                    <span className="text-blue-500">📖</span> Quick Knowledge
                  </div>
                </div>
                <p className="text-gray-500 mt-6 text-sm">
                  Make me your friend and discuss whatever comes to your mind!
                </p>
              </div>
            </div>
          ) : (
            <>
              {chatHistory.map((chat, index) => (
                <div key={index} className={`mb-4 ${chat.type === 'question' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block max-w-[80%] p-3 rounded-lg overflow-auto hide-scrollbar ${chat.type === 'question' 
                    ? 'bg-gray-500 text-white rounded-br-none glassmorphism' 
                    : 'bg-white text-gray-800 rounded-br-none glassmorphism'}`}>
                    <ReactMarkdown className="overflow-auto hide-scrollbar">{chat.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </>
          )}
          {generatingAnswer && (
            <div className="text-left">
              <div className="inline-block bg-gray-100 p-3 rounded-lg animate-pulse">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Fixed Input Form */}
        <form onSubmit={generateAnswer} className="bg-gray rounded-lg shadow-lg p-4 glassmorphism">
          <div className="flex gap-2">
            <textarea
              required
              className="flex-1 border border-gray-300 rounded p-3 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Let's talk..."
              rows="2"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  generateAnswer(e);
                }
              }}
            ></textarea>
            <button
              type="submit"
              className={`px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors ${generatingAnswer ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={generatingAnswer}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
