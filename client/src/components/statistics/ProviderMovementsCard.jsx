import { useState, useMemo } from 'react';
import Modal from '../Modals/Modal';
import PieChart from '../Charts/PieChart';
import { currency } from '../../helpers/Functions';

export default function ProviderMovementsCard({ purchasesArray = [], returnsArray = [] }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  // Agrupa compras y devoluciones por proveedor y producto
  const providerData = useMemo(() => {
    const map = {};
    purchasesArray.forEach(p => {
      const provider = p.provider?.name || 'Sin proveedor';
      const product = p.product?.name || 'Sin producto';
      if (!map[provider]) map[provider] = { purchases: {}, returns: {} };
      if (!map[provider].purchases[product]) map[provider].purchases[product] = 0;
      map[provider].purchases[product] += p.amount || 0;
    });
    returnsArray.forEach(r => {
      const provider = r.provider?.name || 'Sin proveedor';
      const product = r.product?.name || 'Sin producto';
      if (!map[provider]) map[provider] = { purchases: {}, returns: {} };
      if (!map[provider].returns[product]) map[provider].returns[product] = 0;
      map[provider].returns[product] += r.amount || 0;
    });
    return map;
  }, [purchasesArray, returnsArray]);

  // Para el resumen principal: suma total de compras y devoluciones
  const totalPurchases = useMemo(() => purchasesArray.reduce((a, b) => a + (b.amount || 0), 0), [purchasesArray]);
  const totalReturns = useMemo(() => returnsArray.reduce((a, b) => a + (b.amount || 0), 0), [returnsArray]);

  // Para el gráfico: compras y devoluciones por proveedor
  const chartData = useMemo(() => {
    const providers = Object.keys(providerData);
    return providers.map((prov, idx) => ({
      label: prov,
      value: Object.values(providerData[prov].purchases).reduce((a, b) => a + b, 0) - Object.values(providerData[prov].returns).reduce((a, b) => a + b, 0),
      bgColor: '#f6ad55',
      borderColor: '#b7791f',
      hoverBgColor: '#ffe6b3',
    }));
  }, [providerData]);

  return (
    <div className="relative w-80 min-h-64 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center border border-gray-200 cursor-pointer group"
      onClick={() => setShowModal(true)}
      title="Ver movimientos de proveedores"
    >
      <div className="flex flex-col items-center justify-center h-full w-full">
        <span className="text-lg font-bold text-yellow-700 mb-2">Movimientos de Proveedor</span>
        <div className="flex flex-row gap-6 items-center justify-center w-full mb-2">
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500">Compras</span>
            <span className="text-2xl font-bold text-green-600">{currency(totalPurchases)}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500">Devoluciones</span>
            <span className="text-2xl font-bold text-red-500">{currency(totalReturns)}</span>
          </div>
        </div>
        <span className="text-base font-semibold text-gray-500 mt-2">Click para ver detalle</span>
      </div>
      {showModal && (
        <Modal
          content={
            <div className="flex flex-col items-center justify-center gap-4 p-2 md:p-6 min-w-[320px] max-w-[98vw]">
              <div className="flex-shrink-0 flex items-center justify-center w-full max-w-[420px] h-[320px] md:h-[420px] bg-white rounded-2xl shadow-lg border border-gray-200 mx-auto">
                <PieChart chartInfo={chartData} large hideLegend />
              </div>
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[320px] w-full max-w-[420px] mx-auto">
                <h3 className="text-xl font-bold mb-2 text-gray-700 text-center">Detalle por proveedor</h3>
                {Object.keys(providerData).map(provider => (
                  <div key={provider} className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 px-4 py-3 cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => setSelectedProvider(provider)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">{provider}</span>
                      <span className="text-xs text-green-700">Compras: {currency(Object.values(providerData[provider].purchases).reduce((a, b) => a + b, 0))}</span>
                      <span className="text-xs text-red-500">Devoluciones: {currency(Object.values(providerData[provider].returns).reduce((a, b) => a + b, 0))}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Modal detalle por proveedor */}
              {selectedProvider && (
                <Modal
                  content={
                    <div className="w-auto mt-4 ml-4 overflow-y-auto">
                      <h4 className="text-lg font-bold text-gray-700 mb-2">{selectedProvider}</h4>
                      <div className="flex flex-col gap-2 mb-2">
                        <div className="text-xs text-gray-500 mb-1">Compras por producto:</div>
                        {Object.keys(providerData[selectedProvider].purchases).length === 0 ? <span className="text-xs text-gray-400">Sin compras</span> :
                          Object.entries(providerData[selectedProvider].purchases).map(([prod, amt]) => (
                            <div key={prod} className="flex items-center justify-between text-xs bg-white border-b border-gray-100 px-2 py-1">
                              <span className="text-gray-700">{prod}</span>
                              <span className="text-green-700 font-mono">{currency(amt)}</span>
                            </div>
                          ))}
                        <div className="text-xs text-gray-500 mt-2 mb-1">Devoluciones por producto:</div>
                        {Object.keys(providerData[selectedProvider].returns).length === 0 ? <span className="text-xs text-gray-400">Sin devoluciones</span> :
                          Object.entries(providerData[selectedProvider].returns).map(([prod, amt]) => (
                            <div key={prod} className="flex items-center justify-between text-xs bg-white border-b border-gray-100 px-2 py-1">
                              <span className="text-gray-700">{prod}</span>
                              <span className="text-red-500 font-mono">{currency(amt)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  }
                  closeModal={() => setSelectedProvider(null)}
                  ableToClose={true}
                  closeOnEsc={true}
                  closeOnClickOutside={true}
                />
              )}
            </div>
          }
          closeModal={() => { setShowModal(false); setSelectedProvider(null); }}
          ableToClose={true}
          closeOnEsc={true}
          closeOnClickOutside={true}
          width="auto"
          fit={true}
          shape="rounded-2xl"
        />
      )}
    </div>
  );
}
