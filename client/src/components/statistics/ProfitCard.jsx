import { useState } from 'react';
import Modal from '../Modals/Modal';
import PieChart from '../Charts/PieChart';
import { currency } from '../../helpers/Functions';

export default function ProfitCard({ branchReports, customerReports }) {
  const [showModal, setShowModal] = useState(false);

  // Ejemplo: ganancias por sucursal (ventas - compras)
  const profitData = branchReports?.map((br, idx) => {
    const customer = customerReports?.find(cr => cr.branchId === br.branchId);
    const sales = customer?.totalSales || 0;
    const purchases = br.totalPurchases || 0;
    return {
      label: br.branchName,
      value: sales - purchases,
      bgColor: '#4CAF50',
      borderColor: '#206e09',
      hoverBgColor: '#24d111',
    };
  }) || [];

  return (
    <div className="relative w-64 h-64 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center border border-gray-200 cursor-pointer group"
      onClick={() => setShowModal(true)}
      title="Ver ganancias por sucursal"
    >
      <div className="flex flex-col items-center justify-center h-full">
        <span className="text-lg font-bold text-green-700 mb-2">Ganancias</span>
        <span className="text-4xl font-extrabold text-green-500">{profitData.length ? currency(profitData.reduce((a, b) => a + b.value, 0)) : '-'}</span>
        <span className="text-base font-semibold text-gray-500 mt-1">Total</span>
      </div>
      {showModal && (
        <Modal
          content={
            <div className="flex flex-col items-center justify-center gap-4 p-2 md:p-6 min-w-[320px] max-w-[98vw]">
              <div className="flex-shrink-0 flex items-center justify-center w-full max-w-[420px] h-[320px] md:h-[420px] bg-white rounded-2xl shadow-lg border border-gray-200 mx-auto">
                <PieChart chartInfo={profitData} large hideLegend />
              </div>
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[320px] w-full max-w-[420px] mx-auto">
                <h3 className="text-xl font-bold mb-2 text-gray-700 text-center">Ganancias por sucursal</h3>
                {profitData.map((item, idx) => (
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
