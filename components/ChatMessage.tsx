
import React from 'react';
import { Message, Role } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUserModel = message.role === Role.MODEL;

  const wrapperClasses = isUserModel 
    ? "flex items-start gap-3 justify-start"
    : "flex items-start gap-3 justify-end";
    
  const bubbleClasses = isUserModel
    ? "bg-[#EAE0C7] text-gray-800 rounded-lg rounded-tl-none"
    : "bg-[#003B46] text-white rounded-lg rounded-br-none";

  const contentClasses = "prose prose-sm md:prose-base max-w-none text-left";

  const renderContent = () => {
    if (isUserModel) {
        // The AI's response is expected to be HTML
        return <div className={contentClasses} dangerouslySetInnerHTML={{ __html: message.content }} />;
    }
    // User's message is plain text
    return <p className="whitespace-pre-wrap">{message.content}</p>;
  };
  
  return (
    <div className={wrapperClasses}>
      <div className={`p-4 shadow-sm ${bubbleClasses}`}>
        {renderContent()}
      </div>
    </div>
  );
};

export default ChatMessage;
