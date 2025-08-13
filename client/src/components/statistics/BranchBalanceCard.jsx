import { useState, useMemo } from 'react';
import Modal from '../Modals/Modal';
import PieChart from '../Charts/PieChart';
import { currency } from '../../helpers/Functions';
import BranchReportCard from '../BranchReportCard';

/*
  Props:
    branchReports: array de branchReport
    onSelectBranchReport?: (report) => void  // callback para mostrar detalles externos
*/
export default function BranchBalanceCard({ branchReports = [], updateBranchReportSingle = undefined }) {

  const [showModal, setShowModal] = useState(false);
  const [branchReportToShow, setBranchReportToShow] = useState(null);

  // Balance por sucursal (ordenar de mayor a menor)
  const balanceData = useMemo(() => (branchReports || [])
    .map(br => {
      const value = br.balance || 0;
      const positive = value >= 0;
      return {
        label: br.branch?.branch || br.branch?.name || 'Sucursal',
        value,
        bgColor: positive ? '#38a169' : '#e53e3e',
        borderColor: positive ? '#276749' : '#9b2c2c',
        hoverBgColor: positive ? '#68d391' : '#feb2b2',
        report: br,
        action: () => setBranchReportToShow(br)
      };
    })
    .sort((a, b) => a.value - b.value), [branchReports]);

  const total = useMemo(() => balanceData.reduce((acc, i) => acc + i.value, 0), [balanceData]);
  const totalClass = total < 0 ? 'text-red-600' : 'text-green-600';

  const handleItemClick = (item) => {
    if (item.action) item.action();
  };

  return (
    <div className="relative w-64 h-64 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center border border-gray-200 group"
      onClick={() => setShowModal(true)}
      title="Ver balance por sucursal"
    >
      <div className="flex flex-col items-center justify-center h-full cursor-pointer">
        <span className="text-lg font-bold text-gray-700 mb-2">Balance sucursales</span>
        <span className={`text-4xl font-extrabold ${totalClass}`}>{balanceData.length ? currency(total) : '-'}</span>
        <span className="text-base font-semibold text-gray-500 mt-1">Total</span>
      </div>
      {showModal && (
        <Modal
          content={
            <div className="flex flex-col items-center justify-center gap-4 p-2 md:p-6 min-w-[320px] max-w-[98vw]">
              <div className="flex-shrink-0 flex items-center justify-center w-full max-w-[420px] h-[320px] md:h-[420px] bg-white rounded-2xl shadow-lg border border-gray-200 mx-auto">
                <PieChart chartInfo={balanceData} large hideLegend label={'Balance'} onSliceClick={handleItemClick} />
              </div>
              <Modal
                content={
                  <BranchReportCard updateBranchReportSingle={updateBranchReportSingle} reportData={branchReportToShow} selfChange={(br) => setBranchReportToShow(br)} />
                }
                closeModal={() => setBranchReportToShow(null)}
                isShown={!!branchReportToShow}
                fit={true}
              />
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[320px] w-full max-w-[420px] mx-auto">
                <h3 className="text-xl font-bold mb-2 text-gray-700 text-center">Balance por sucursal</h3>
                {balanceData.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 bg-gray-50 rounded-lg shadow-sm border border-gray-200 px-4 py-3 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleItemClick(item)}
                    title="Ver detalle de sucursal"
                  >
                    <span className="inline-block w-4 h-4 rounded-full" style={{ background: item.bgColor, border: `2px solid ${item.borderColor}` }} />
                    <span className="font-semibold text-gray-700 flex-1">{item.label}</span>
                    <span className={`font-mono text-lg font-bold ${item.value < 0 ? 'text-red-600' : 'text-green-700'}`}>{currency(item.value)}</span>
                  </div>
                ))}
                {balanceData.length === 0 && <p className="text-center text-sm text-gray-500">Sin datos</p>}
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
