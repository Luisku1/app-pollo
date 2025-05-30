import { FaRegCopy } from 'react-icons/fa';
import { useState } from 'react';

export default function PhoneLinks({ phoneNumber, name }) {
  const [copied, setCopied] = useState(false);
  if (!phoneNumber) return <span>Sin número de teléfono</span>;

  // Copia el número sin símbolos
  const handleCopy = () => {
    const cleanNumber = ('' + phoneNumber).replace(/\D/g, '');
    navigator.clipboard.writeText(cleanNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="flex flex-col gap-1 mb-2">
      {/* Enlace para llamar */}
      <div className="flex items-center gap-2">
        <a
          href={`tel:${phoneNumber}`}
          className="text-blue-500 underline"
        >
          Llamar: {('' + phoneNumber).replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3')}
        </a>
        <button
          type="button"
          onClick={handleCopy}
          className="text-gray-500 hover:text-black focus:outline-none"
          title="Copiar número sin símbolos"
        >
          <FaRegCopy />
        </button>
        {copied && <span className="text-green-600 text-xs ml-1">¡Copiado!</span>}
      </div>
      {/* Enlace para enviar mensaje por WhatsApp */}
      <a
        href={`https://wa.me/${('' + phoneNumber).replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-green-500 underline"
      >
        Enviar mensaje por WhatsApp
      </a>
    </div>
  );
}
