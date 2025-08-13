
import React from 'react';

const MicrophoneIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2H3v2a8 8 0 007 7.93V22h2v-2.07A8 8 0 0021 12v-2h-2z" />
  </svg>
);

export default MicrophoneIcon;
