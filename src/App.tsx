import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ApiResponse {
  output: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId] = useState(() => Math.random().toString(36).substring(2) + Date.now().toString(36));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Auto-focus input field on page load
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmedMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://submit.tahyamisrsu.com/webhook/Ai-TahyaMisr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmedMessage,
          userId: userId,
          source: 'ai-tahyamusr',
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: ApiResponse[] = await response.json();
      const aiResponse = data[0]?.output || 'لم أتمكن من الحصول على رد مناسب.';

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'حدث خطأ أثناء الاتصال بالخادم. حاول مرة أخرى.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-arabic" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-maroon">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center space-x-4 space-x-reverse">
            <div className="flex-shrink-0">
              <img
                src="https://www.dropbox.com/scl/fi/fnot6lk4eky6a51iygybg/.png?rlkey=la54x8gme7xmk8zwo4vvfqrjw&raw=1"
                alt="شعار اتحاد طلاب تحيا مصر"
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-maroon mb-2">
                اتحاد طلاب تحيا مصر
              </h1>
              <p className="text-gray-600 text-lg">
                مساعد ذكي للإجابة عن استفسارات الأعضاء
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="max-w-4xl mx-auto px-4 py-6 h-[calc(100vh-180px)] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 bg-white rounded-lg shadow-lg mb-4 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  أهلاً بك! اكتب رسالتك وسأساعدك بأفضل ما أستطيع
                </p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div className={`flex items-start max-w-[80%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!message.isUser && (
                    <div className="flex-shrink-0 ml-3">
                      <div className="w-10 h-10 bg-maroon rounded-full flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                  
                  <div className={`rounded-lg px-4 py-3 ${
                    message.isUser 
                      ? 'bg-maroon text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.text}
                    </p>
                    <p className={`text-xs mt-2 ${
                      message.isUser ? 'text-red-200' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="flex items-start max-w-[80%]">
                  <div className="flex-shrink-0 ml-3">
                    <div className="w-10 h-10 bg-maroon rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-lg rounded-bl-none px-4 py-3">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Loader2 className="w-4 h-4 animate-spin text-maroon" />
                      <span className="text-sm text-gray-600">جاري الكتابة...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-end space-x-3 space-x-reverse">
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="flex-shrink-0 bg-maroon text-white p-3 rounded-full hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
            
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اكتب رسالتك هنا... (Shift + Enter للسطر الجديد)"
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-maroon focus:border-transparent outline-none transition-all"
                rows={1}
                style={{
                  minHeight: '44px',
                  maxHeight: '120px',
                  height: 'auto',
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            تم تصميمه من قبل لجنة التنظيم المركزية باتحاد طلاب تحيا مصر
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;