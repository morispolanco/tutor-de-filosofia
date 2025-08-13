import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chat } from '@google/genai';
import { Message, Role } from './types';
import { createChatSession } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import LogoIcon from './components/icons/LogoIcon';

const cleanResponse = (text: string) => {
  // Removes markdown code blocks for HTML if they exist
  return text.replace(/^```html\n?/, "").replace(/\n?```$/, "");
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const initializeChat = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      chatRef.current = createChatSession();
      
      // The system instruction prompts Gemini to send the first message.
      // We will use sendMessageStream to get this initial greeting.
      const stream = await chatRef.current.sendMessageStream({ message: "Hola" });
      
      let initialMessageContent = '';
      setMessages([{ role: Role.MODEL, content: '' }]);

      for await (const chunk of stream) {
        initialMessageContent += chunk.text;
        setMessages([{ role: Role.MODEL, content: initialMessageContent }]);
      }
      
      setMessages([{ role: Role.MODEL, content: cleanResponse(initialMessageContent) }]);

    } catch (e) {
        console.error("Initialization failed:", e);
        setError("No se pudo inicializar el chat. Por favor, verifica la configuración de la API Key y refresca la página.");
        setMessages([]); // Clear messages on error
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async (userMessage: string) => {
    if (!chatRef.current || isLoading) return;

    setIsLoading(true);
    setError(null);
    const newMessages: Message[] = [...messages, { role: Role.USER, content: userMessage }];
    setMessages(newMessages);

    // Add a placeholder for the model's response
    setMessages(prev => [...prev, { role: Role.MODEL, content: '' }]);

    try {
      const stream = await chatRef.current.sendMessageStream({ message: userMessage });
      
      let responseText = '';
      for await (const chunk of stream) {
        responseText += chunk.text;
        setMessages(prev => {
          const updatedMessages = [...prev];
          updatedMessages[updatedMessages.length - 1].content = responseText;
          return updatedMessages;
        });
      }

      setMessages(prev => {
          const updatedMessages = [...prev];
          updatedMessages[updatedMessages.length - 1].content = cleanResponse(responseText);
          return updatedMessages;
      });

    } catch (e) {
      console.error("Message sending failed:", e);
      const errorMessage = "Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo.";
      setError(errorMessage);
       setMessages(prev => {
          const updatedMessages = [...prev];
          updatedMessages[updatedMessages.length - 1].content = `<p style="color: red;">${errorMessage}</p>`;
          return updatedMessages;
        });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#FDF6E3] text-gray-800 font-sans">
      <header className="flex items-center justify-center p-4 border-b border-gray-300/50 shadow-sm bg-white/30 backdrop-blur-sm">
        <LogoIcon className="w-8 h-8 mr-3 text-[#07575B]" />
        <h1 className="text-2xl font-bold text-gray-700 tracking-tight" style={{fontFamily: 'Lora, serif'}}>Filósofo AI</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
         {isLoading && messages.length > 0 && messages[messages.length-1].role === Role.USER && (
            <div className="flex items-start gap-3 justify-start">
              <div className="p-4 bg-[#EAE0C7] text-gray-800 rounded-lg rounded-tl-none shadow-sm">
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-0"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-300"></span>
                 </div>
              </div>
            </div>
         )}
        <div ref={messagesEndRef} />
      </main>
      
      {error && !isLoading && (
        <div className="p-4 text-center text-red-600 bg-red-100 border-t border-red-200">
            <p>{error}</p>
        </div>
      )}
      
      <footer className="sticky bottom-0">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </footer>
    </div>
  );
};

export default App;