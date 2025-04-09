export default function PhoneLinks({ phoneNumber, name }) {
  if (!phoneNumber) return <span>Sin número de teléfono</span>;

  return (
    <div className="flex flex-col gap-1 mb-2">
      {/* Enlace para llamar */}
      <a
        href={`tel:${phoneNumber}`}
        className="text-blue-500 underline"
      >
        Llamar: {phoneNumber.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3')}
      </a>

      {/* Enlace para enviar mensaje por WhatsApp */}
      <a
        href={`https://wa.me/${phoneNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-green-500 underline"
      >
        Enviar mensaje por WhatsApp
      </a>
    </div>
  );
}
