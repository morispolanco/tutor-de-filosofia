
import React, { useState } from 'react';
import PaperPlaneIcon from './icons/PaperPlaneIcon';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-t-xl border-t border-gray-200">
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
            }
        }}
        placeholder="Escribe tu pregunta o reflexión aquí..."
        className="w-full p-3 bg-[#FDF6E3] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#07575B] focus:outline-none resize-none transition-shadow duration-200"
        rows={1}
        disabled={isLoading}
        style={{ minHeight: '44px', maxHeight: '200px' }}
      />
      <button
        type="submit"
        disabled={isLoading || !inputValue.trim()}
        className="p-3 h-[44px] w-[44px] rounded-full text-white bg-[#07575B] hover:bg-[#003B46] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0 flex items-center justify-center"
        aria-label="Enviar mensaje"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <PaperPlaneIcon className="w-5 h-5" />
        )}
      </button>
    </form>
  );
};

export default ChatInput;
