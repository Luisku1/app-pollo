import { useState } from 'react';
import Modal from '../Modals/Modal';
import PieChart from '../Charts/PieChart';
import { currency } from '../../helpers/Functions';
import OutgoingsList from '../Outgoings/OutgoingsList';
import { ToastInfo } from '../../helpers/toastify';

export default function OutgoingsCard({ branchReports }) {
  const [showModal, setShowModal] = useState(false);
  const [outgoingsToShow, setOutgoingsToShow] = useState({ array: [], branch: '' });

  // Gastos por sucursal
  const outgoingsData = branchReports?.map(br => ({
    label: br.branch.branch,
    value: br.outgoings || 0,
    array: br.outgoingsArray || [],
    bgColor: '#e53e3e',
    borderColor: '#9b2c2c',
    hoverBgColor: '#feb2b2',
    action: () => setOutgoingsToShow({ branch: br.branch.branch, array: br.outgoingsArray || [] })
  })) || [];

  const handleListClick = (item) => {

    if (!item.array.length > 0) {
      ToastInfo(`No hay gastos para mostrar en ${item.label}`);
      return;
    }
    setOutgoingsToShow({ branch: item.label, array: item.array });
  }

  return (
    <div className={`relative w-64 h-64 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center border border-gray-200 group`}
      onClick={() => setShowModal(true)}
      title="Ver gastos por sucursal"
    >
      <div className="flex flex-col cursor-pointer items-center justify-center h-full">
        <span className="text-lg font-bold text-red-700 mb-2">Gastos</span>
        <span className="text-4xl font-extrabold text-red-500">{outgoingsData.length ? currency(outgoingsData.reduce((a, b) => a + b.value, 0)) : '-'}</span>
        <span className="text-base font-semibold text-gray-500 mt-1">Total</span>
      </div>
      <Modal
        content={
          <div className="flex flex-col items-center justify-center gap-4 p-2 md:p-6 min-w-[320px] max-w-[98vw]">
            <div className="flex-shrink-0 flex items-center justify-center w-full max-w-[420px] h-[320px] md:h-[420px] bg-white rounded-2xl shadow-lg border border-gray-200 mx-auto">
              <PieChart chartInfo={outgoingsData} large hideLegend label={'Gastos'} />
            </div>
            {outgoingsToShow?.array?.length > 0 && (
              <Modal
                content={
                  <OutgoingsList outgoings={outgoingsToShow.array} />
                }
                closeModal={() => setOutgoingsToShow([])}
                title={`Gastos de ${outgoingsToShow.branch}`}
                ableToClose={true}
                closeOnEsc={true}
                closeOnClickOutside={true}
                width="auto"
                fit={true}
                isShow={!!outgoingsToShow.array?.length > 0}
                shape="rounded-2xl"
              />
            )}
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[320px] w-full max-w-[420px] mx-auto">
              <h3 className="text-xl font-bold mb-2 text-gray-700 text-center">Gastos por sucursal</h3>
              {outgoingsData.map((item, idx) => (
                <div key={item.label} className="flex items-center gap-3 bg-gray-50 rounded-lg shadow-sm border border-gray-200 px-4 py-3 cursor-pointer" onClick={() => handleListClick(item)}>
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
        isShown={showModal}
        shape="rounded-2xl"
      />
    </div>
  );
}
