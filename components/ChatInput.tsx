import React, { useState, useEffect, useRef } from 'react';
import PaperPlaneIcon from './icons/PaperPlaneIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';
import StopIcon from './icons/StopIcon';

// Define SpeechRecognition types for window object to avoid TypeScript errors.
// These interfaces are based on the Web Speech API specification.
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

declare global {
    interface Window {
      SpeechRecognition: SpeechRecognitionStatic;
      webkitSpeechRecognition: SpeechRecognitionStatic;
    }
}

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isSpeechSupported = !!SpeechRecognitionAPI;

  useEffect(() => {
    if (!isSpeechSupported) {
        console.warn("Speech recognition is not supported by this browser.");
        return;
    }

    const recognition: SpeechRecognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join('');
      setInputValue(transcript);
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop();
    };
  }, [isSpeechSupported]);

  const handleMicClick = () => {
    if (isLoading || !isSpeechSupported) return;

    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setInputValue('');
      recognitionRef.current?.start();
    }
  };


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
        placeholder={isRecording ? "Escuchando..." : "Escribe tu pregunta o reflexión aquí..."}
        className="w-full p-3 bg-[#FDF6E3] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#07575B] focus:outline-none resize-none transition-shadow duration-200"
        rows={1}
        disabled={isLoading}
        style={{ minHeight: '44px', maxHeight: '200px' }}
      />
      {isSpeechSupported && (
        <button
          type="button"
          onClick={handleMicClick}
          disabled={isLoading}
          className={`p-3 h-[44px] w-[44px] rounded-full text-white ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-[#07575B] hover:bg-[#003B46]'} disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0 flex items-center justify-center`}
          aria-label={isRecording ? 'Detener grabación' : 'Iniciar grabación de voz'}
        >
          {isRecording ? <StopIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
        </button>
      )}
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