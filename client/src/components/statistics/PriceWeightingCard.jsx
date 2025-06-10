import { useState } from 'react';
import Modal from '../Modals/Modal';
import PieChart from '../Charts/PieChart';
import { currency } from '../../helpers/Functions';

export default function PriceWeightingCard({ providerReports }) {
  const [showModal, setShowModal] = useState(false);

  // Ejemplo: ponderación de precios por proveedor
  const priceData = providerReports?.map(pr => ({
    label: pr.providerName,
    value: pr.totalAmount / (pr.totalQuantity || 1),
    bgColor: '#56a0db',
    borderColor: '#0c4e82',
    hoverBgColor: '#0091ff',
  })) || [];

  return (
    <div className="relative w-64 h-64 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center border border-gray-200 cursor-pointer group"
      onClick={() => setShowModal(true)}
      title="Ver ponderación de precios por proveedor"
    >
      <div className="flex flex-col items-center justify-center h-full">
        <span className="text-lg font-bold text-blue-700 mb-2">Ponderación de Precios</span>
        <span className="text-4xl font-extrabold text-blue-500">{priceData.length ? currency(priceData.reduce((a, b) => a + b.value, 0) / priceData.length) : '-'}</span>
        <span className="text-base font-semibold text-gray-500 mt-1">Promedio general</span>
      </div>
      {showModal && (
        <Modal
          content={
            <div className="flex flex-col items-center justify-center gap-4 p-2 md:p-6 min-w-[320px] max-w-[98vw]">
              <div className="flex-shrink-0 flex items-center justify-center w-full max-w-[420px] h-[320px] md:h-[420px] bg-white rounded-2xl shadow-lg border border-gray-200 mx-auto">
                <PieChart chartInfo={priceData} large hideLegend />
              </div>
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[320px] w-full max-w-[420px] mx-auto">
                <h3 className="text-xl font-bold mb-2 text-gray-700 text-center">Precios promedio por proveedor</h3>
                {priceData.map((item, idx) => (
                  <div key={item.label} className="flex items-center gap-3 bg-gray-50 rounded-lg shadow-sm border border-gray-200 px-4 py-3">
                    <span className="inline-block w-4 h-4 rounded-full" style={{ background: item.bgColor, border: `2px solid ${item.borderColor}` }} />
                    <span className="font-semibold text-gray-700 flex-1">{item.label}</span>
                    <span className="font-mono text-lg font-bold text-gray-900">{currency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          }
          closeModal={() => setShowModal(false)}
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
