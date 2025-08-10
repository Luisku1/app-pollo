// useGlobalCommandMode.js
import { useEffect, useRef } from 'react';

// Estado global simple para commandMode
let commandMode = false;
let listeners = [];

export function isCommandMode() {
  return commandMode;
}

export function useGlobalCommandMode(commands = []) {
  // commands: [{ key: 'Tab', action: () => {}, label: 'Abrir menú' }]
  const commandsRef = useRef(commands);
  commandsRef.current = commands;

  useEffect(() => {
    function handleKeyDown(e) {
      // Ctrl+. solo activa
      if (e.key === '.' && e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
        if (!commandMode) {
          e.preventDefault();
          commandMode = true;
          listeners.forEach(fn => fn(commandMode));
        }
      } else if (commandMode) {
        // Escape desactiva
        if (e.key === 'Escape') {
          commandMode = false;
          listeners.forEach(fn => fn(false));
        } else {
          // Si estamos en modo comando, buscar comando
          const cmd = commandsRef.current.find(cmd => {
            if (typeof cmd.key === 'function') return cmd.key(e);
            return e.key === cmd.key;
          });
          if (cmd) {
            e.preventDefault();
            cmd.action();
            commandMode = false;
            listeners.forEach(fn => fn(false));
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Permite a los componentes saber si está activo
  function subscribe(fn) {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter(l => l !== fn);
    };
  }

  return { isCommandMode, subscribe };
}
