
import React from 'react';

const LogoIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 21h14" />
    <path d="M5 21V8" />
    <path d="M19 21V8" />
    <path d="M5 8h14" />
    <path d="M5 5h14" />
    <path d="M9 21V8" />
    <path d="M15 21V8" />
    <path d="M3 5L12 3L21 5" />
  </svg>
);

export default LogoIcon;
