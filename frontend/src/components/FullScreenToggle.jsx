import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

/**
 * FullScreenToggle – shows a maximize/minimize icon to enter/exit fullscreen.
 * The button is hidden on mobile (max-width: 599px) via the `.fullscreen-icon`
 * class defined in `responsive.css`.
 */
const FullScreenToggle = () => {
  const [isFull, setIsFull] = useState(false);

  // Sync state when user exits fullscreen via Esc or browser UI
  useEffect(() => {
    const handler = () => setIsFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggle = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
    setIsFull(!!document.fullscreenElement);
  };

  return (
    <button
      className="fullscreen-icon p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      onClick={toggle}
      aria-label={isFull ? 'Exit fullscreen' : 'Enter fullscreen'}
    >
      {isFull ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
    </button>
  );
};

export default FullScreenToggle;
