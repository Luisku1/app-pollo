import { useState } from 'react';
import Modal from '../Modals/Modal';
import PieChart from '../Charts/PieChart';
import { currency } from '../../helpers/Functions';

export default function SalesVsReturnsCard({ customerReports }) {
  const [showModal, setShowModal] = useState(false);

  // Ventas vs devoluciones por cliente
  const salesData = customerReports?.map(cr => ({
    label: cr.customerName,
    value: cr.totalSales - (cr.totalReturns || 0),
    bgColor: '#3182ce',
    borderColor: '#2b6cb0',
    hoverBgColor: '#63b3ed',
  })) || [];

  return (
    <div className="relative w-64 h-64 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center border border-gray-200 cursor-pointer group"
      onClick={() => setShowModal(true)}
      title="Ver ventas netas por cliente"
    >
      <div className="flex flex-col items-center justify-center h-full">
        <span className="text-lg font-bold text-blue-700 mb-2">Ventas netas</span>
        <span className="text-4xl font-extrabold text-blue-500">{salesData.length ? currency(salesData.reduce((a, b) => a + b.value, 0)) : '-'}</span>
        <span className="text-base font-semibold text-gray-500 mt-1">Total</span>
      </div>
      {showModal && (
        <Modal
          content={
            <div className="flex flex-col items-center justify-center gap-4 p-2 md:p-6 min-w-[320px] max-w-[98vw]">
              <div className="flex-shrink-0 flex items-center justify-center w-full max-w-[420px] h-[320px] md:h-[420px] bg-white rounded-2xl shadow-lg border border-gray-200 mx-auto">
                <PieChart chartInfo={salesData} large hideLegend />
              </div>
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[320px] w-full max-w-[420px] mx-auto">
                <h3 className="text-xl font-bold mb-2 text-gray-700 text-center">Ventas netas por cliente</h3>
                {salesData.map((item, idx) => (
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
