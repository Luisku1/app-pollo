import { useState } from "react";
import { useDateNavigation } from "../hooks/useDateNavigation";
import CreateProviderMovement from "./Providers/CreateProviderMovement";
import CreateProviderPayment from "./Providers/CreateProviderPayment";
import RegisterDateSwitch from "./RegisterDateSwitch";

// Menú para manejar compras a proveedores y pagos, con selección de fecha similar a EntradasYSalidas.
export default function ProviderRegisters() {
  const { dateFromYYYYMMDD, today } = useDateNavigation();
  const [useToday, setUseToday] = useState(false);
  const [activeTab, setActiveTab] = useState('movements');

  // Fecha efectiva
  const fechaRegistro = useToday ? new Date().toISOString() : dateFromYYYYMMDD.toISOString();

  return (
    <div className="p-1 rounded-2xl bg-white shadow-lg max-w-2xl mx-auto animate-fade-in">
      <div className="border bg-white p-4 mt-4 rounded-xl shadow-sm">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 w-full">
          <button
            className={`flex-1 py-2 rounded-lg font-semibold transition text-base border ${activeTab === 'movements' ? 'bg-blue-600 text-white shadow border-blue-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'}`}
            onClick={() => setActiveTab('movements')}
            type="button"
            aria-selected={activeTab === 'movements'}
          >
            Compras
          </button>
          <button
            className={`flex-1 py-2 rounded-lg font-semibold transition text-base border ${activeTab === 'payments' ? 'bg-blue-600 text-white shadow border-blue-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'}`}
            onClick={() => setActiveTab('payments')}
            type="button"
            aria-selected={activeTab === 'payments'}
          >
            Pagos
          </button>
        </div>
        {/* Switch fecha */}
        {!today && (
          <div className="ml-2 mb-4">
            <RegisterDateSwitch multiswitch={true} useToday={useToday} setUseToday={setUseToday} />
          </div>
        )}
        {/* Contenido */}
        {activeTab === 'movements' && (
          <CreateProviderMovement date={fechaRegistro} />
        )}
        {activeTab === 'payments' && (
          <CreateProviderPayment date={fechaRegistro} />
        )}
      </div>
    </div>
  );
}
