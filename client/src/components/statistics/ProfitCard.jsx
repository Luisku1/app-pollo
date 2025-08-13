import { useState, useMemo } from 'react';
import Modal from '../Modals/Modal';
import PieChart from '../Charts/PieChart';
import { currency } from '../../helpers/Functions';

/*
  Calcula ganancias:
  - Por sucursal: incomes - providerInputs - outgoings (aprox. margen diario bruto)
  - Por cliente: sales - returns
  Muestra ambas vistas con toggle dentro del modal.
*/
export default function ProfitCard({ branchReports = [], customerReports = [] }) {
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState('branches'); // 'branches' | 'customers'

  const branchProfitData = useMemo(() => (branchReports || []).map((br) => {
    const incomes = br.incomes || 0;
    const providerInputs = br.providerInputs || 0;
    const inputs = br.inputs || 0;
    const outputs = br.outputs || 0;
    const profit = incomes - providerInputs + outputs - inputs;
    return {
      label: br.branch?.branch || br.branch?.name || br.branchName || 'Sucursal',
      value: profit,
      bgColor: profit >= 0 ? '#4CAF50' : '#d33',
      borderColor: profit >= 0 ? '#206e09' : '#7a1212',
      hoverBgColor: profit >= 0 ? '#24d111' : '#ff4d4d'
    };
  }), [branchReports]);

  const customerProfitData = useMemo(() => (customerReports || []).map((cr) => {
    const sales = cr.sales || 0;
    const returns = cr.returns || 0;
    const payments = cr.payments || 0;
    const profit = payments - sales - returns;
    return {
      label: cr.customer?.name || 'Cliente',
      value: profit,
      bgColor: profit >= 0 ? '#56a0db' : '#d33',
      borderColor: profit >= 0 ? '#0c4e82' : '#7a1212',
      hoverBgColor: profit >= 0 ? '#0091ff' : '#ff4d4d'
    };
  }), [customerReports]);

  const activeData = view === 'branches' ? branchProfitData : customerProfitData;
  const total = useMemo(() => activeData.reduce((acc, i) => acc + i.value, 0), [activeData]);
  const totalClass = total < 0 ? 'text-red-600' : 'text-green-500';

  return (
    <div
      className="relative w-64 h-64 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center border border-gray-200 cursor-pointer group"
      onClick={() => setShowModal(true)}
      title="Ver ganancias"
    >
      <div className="flex flex-col items-center justify-center h-full">
        <span className="text-lg font-bold text-green-700 mb-2">Ganancias</span>
        <span className={`text-4xl font-extrabold ${activeData.length ? totalClass : 'text-green-500'}`}>{activeData.length ? currency(total) : '-'}</span>
        <span className="text-base font-semibold text-gray-500 mt-1 capitalize">{view === 'branches' ? 'Sucursales' : 'Clientes'}</span>
      </div>
      {showModal && (
        <Modal
          content={
            <div className="flex flex-col items-center justify-center gap-4 p-2 md:p-6 min-w-[320px] max-w-[98vw]">
              <div className="flex gap-2 w-full max-w-[420px] mb-2">
                <button
                  type="button"
                  onClick={() => setView('branches')}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition ${view === 'branches' ? 'bg-green-600 text-white border-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'}`}
                >Sucursales</button>
                <button
                  type="button"
                  onClick={() => setView('customers')}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition ${view === 'customers' ? 'bg-blue-600 text-white border-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'}`}
                >Clientes</button>
              </div>
              <div className="flex-shrink-0 flex items-center justify-center w-full max-w-[420px] h-[320px] md:h-[420px] bg-white rounded-2xl shadow-lg border border-gray-200 mx-auto">
                <PieChart chartInfo={activeData} large hideLegend hideLabels />
              </div>
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[320px] w-full max-w-[420px] mx-auto">
                <h3 className="text-xl font-bold mb-2 text-gray-700 text-center">Ganancias por {view === 'branches' ? 'sucursal' : 'cliente'}</h3>
                {activeData.map((item) => (
                  <div key={item.label} className="flex items-center gap-3 bg-gray-50 rounded-lg shadow-sm border border-gray-200 px-4 py-3">
                    <span className="inline-block w-4 h-4 rounded-full" style={{ background: item.bgColor, border: `2px solid ${item.borderColor}` }} />
                    <span className="font-semibold text-gray-700 flex-1">{item.label}</span>
                    <span className={`font-mono text-lg font-bold ${item.value >= 0 ? 'text-gray-900' : 'text-red-600'}`}>{currency(item.value)}</span>
                  </div>
                ))}
                {activeData.length === 0 && (
                  <p className="text-center text-sm text-gray-500">Sin datos</p>
                )}
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
