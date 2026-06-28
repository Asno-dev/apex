// Export native DOMException if available, otherwise write a simple fallback class
const NativeDOMException = typeof globalThis !== 'undefined' && globalThis.DOMException 
  ? globalThis.DOMException 
  : typeof window !== 'undefined' && window.DOMException 
    ? window.DOMException 
    : class DOMException extends Error {
        constructor(message, name) {
          super(message);
          this.name = name || 'Error';
        }
      };

module.exports = NativeDOMException;
