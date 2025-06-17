// NetDifferenceCard.jsx
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useDateNavigation } from '../../hooks/useDateNavigation';
import { useNetDifference } from '../../hooks/BranchMovements/useNetDifference';
import Modal from '../Modals/Modal';

export default function NetDifferenceCard() {
  const { company } = useSelector((state) => state.user);
  const { currentDate } = useDateNavigation();
  const { data, loading, error } = useNetDifference({ companyId: company._id, date: currentDate });
  const [showModal, setShowModal] = useState(false);

  // Suma total de diferencias
  const totalDiff = data ? Object.values(data.byEmployee).reduce((acc, emp) => acc + emp.totalDifference, 0) : 0;

  return (
    <>
      <button
        className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-200 shadow-sm min-w-[160px] hover:bg-yellow-100 transition font-bold text-yellow-800"
        onClick={() => setShowModal(true)}
        title="Ver diferencias netas de movimientos"
      >
        <span className="text-2xl">🔄</span>
        <span className="text-xs text-gray-500 font-semibold">Diferencia en movimientos</span>
        <span className={`text-lg font-bold ${totalDiff < 0 ? 'text-red-600' : 'text-green-600'}`}>{totalDiff.toLocaleString('es-MX', { style: 'decimal', maximumFractionDigits: 2 })} kg</span>
      </button>
      <Modal
        isShown={showModal}
        closeModal={() => setShowModal(false)}
        title="Resumen de diferencias en movimientos"
        width="11/12"
        content={
          loading ? <div className="p-6 text-center">Cargando...</div> :
          error ? <div className="p-6 text-center text-red-600">Error al cargar datos</div> :
          data ? (
            <div className="flex flex-col gap-6 p-2 md:p-6 max-h-[70vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-2 text-gray-700 text-center">Por empleado</h3>
              <table className="min-w-full text-sm mb-6">
                <thead>
                  <tr className="bg-gray-100 uppercase text-xs text-gray-700">
                    <th className="px-3 py-2 text-left">Empleado</th>
                    <th className="px-3 py-2 text-right">Total diferencia (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(data.byEmployee).map(emp => (
                    <tr key={emp.employee._id} className="border-b last:border-b-0">
                      <td className="px-3 py-2">{emp.employee.name} {emp.employee.lastName}</td>
                      <td className={`px-3 py-2 text-right font-bold ${emp.totalDifference < 0 ? 'text-red-600' : 'text-green-600'}`}>{emp.totalDifference.toLocaleString('es-MX', { maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h3 className="text-lg font-bold mb-2 text-gray-700 text-center">Por producto</h3>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 uppercase text-xs text-gray-700">
                    <th className="px-3 py-2 text-left">Producto</th>
                    <th className="px-3 py-2 text-right">Total diferencia (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(data.byProduct).map(prod => {
                    const total = Object.values(prod.employees).reduce((acc, e) => acc + e.difference, 0);
                    return (
                      <tr key={prod.name} className="border-b last:border-b-0">
                        <td className="px-3 py-2">{prod.name}</td>
                        <td className={`px-3 py-2 text-right font-bold ${total < 0 ? 'text-red-600' : 'text-green-600'}`}>{total.toLocaleString('es-MX', { maximumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null
        }
      />
    </>
  );
}
