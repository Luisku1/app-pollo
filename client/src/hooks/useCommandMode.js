import React, { createContext, useContext, useState, useEffect } from 'react';

// Contexto global para modo comando
export const CommandModeContext = createContext();

export function CommandModeProvider({ children }) {
  const [commandMode, setCommandMode] = useState(false);
  const [showHints, setShowHints] = useState(false);

  // Toggle con Alt: entra y sale del modo al soltar Alt
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Alt') {
        setShowHints(true);
      }
    }
    function handleKeyUp(e) {
      if (e.key === 'Alt') {
        setCommandMode((v) => !v);
        setShowHints(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // API para registrar comandos (futuro)
  const registerCommand = () => { };
  const unregisterCommand = () => { };

  return (
    <CommandModeContext.Provider value={{ commandMode, showHints, registerCommand, unregisterCommand }}>
      {children}
    </CommandModeContext.Provider>
  );
}

export function useCommandMode() {
  return useContext(CommandModeContext);
}
