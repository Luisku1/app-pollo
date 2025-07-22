// NetDifferenceCard.jsx
import { useState } from 'react';
import { MdOutlineDifference, MdCheckCircle } from 'react-icons/md';
import { useSelector } from 'react-redux';
import { useDateNavigation } from '../../hooks/useDateNavigation';
import { useNetDifference } from '../../hooks/BranchMovements/useNetDifference';
import Modal from '../Modals/Modal';
import EmployeeName from '../Names/EmployeeName';
import { useRoles } from '../../context/RolesContext';

export default function NetDifferenceCard({ inHeader = false }) {
  const { company, currentUser } = useSelector((state) => state.user);
  const { currentDate } = useDateNavigation();
  const { data, loading, error } = useNetDifference({ companyId: company._id, date: currentDate })
  const { isManager } = useRoles();
  const [showModal, setShowModal] = useState(false);
  const [expandedEmployees, setExpandedEmployees] = useState([]);
  const [expandedProducts, setExpandedProducts] = useState([]);

  // Filtrar datos según permisos
  let filteredByEmployee = data?.byEmployee || {};
  let filteredByProduct = data?.byProduct || {};
  if (!isManager(currentUser.role) && currentUser?._id) {
    // Buscar sólo el empleado actual
    filteredByEmployee = Object.fromEntries(
      Object.entries(data?.byEmployee || {}).filter(([employeeId, emp]) => emp.employee?._id === currentUser._id)
    );
    // Filtrar byProduct para sólo mostrar al usuario
    filteredByProduct = Object.fromEntries(
      Object.entries(data?.byProduct || {}).map(([productId, prod]) => [
        productId,
        {
          ...prod,
          employees: Object.fromEntries(
            Object.entries(prod.employees || {}).filter(([employeeId, emp]) => emp.employee?._id === currentUser._id)
          )
        }
      ]).filter(([_, prod]) => Object.keys(prod.employees).length > 0)
    );
  }

  // Suma total de diferencias (sólo lo filtrado)
  const totalDiff = Object.values(filteredByEmployee).reduce((acc, emp) => acc + emp.totalDifference, 0);

  // Helper: Modal content (table view)
  function renderModalContent() {
    if (loading) return <div className="p-6 text-center">Cargando...</div>;
    if (error) return <div className="p-6 text-center text-red-600">Error al cargar datos</div>;
    if (!data) return <div className="p-6 text-center">No hay diferencia en movimientos</div>;
    return (
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
            {Object.entries(filteredByEmployee).map(([employeeId, emp]) => (
              <>
                <tr
                  key={employeeId}
                  className="border-b last:border-b-0 cursor-pointer hover:bg-yellow-100"
                  onClick={() => {
                    setExpandedEmployees(prev =>
                      prev.includes(employeeId)
                        ? prev.filter(id => id !== employeeId)
                        : [...prev, employeeId]
                    );
                  }}
                >
                  <EmployeeName employee={emp.employee} />
                  <td className={`px-3 py-2 text-right font-bold ${emp.totalDifference < 0 ? 'text-red-600' : 'text-green-600'}`}>{emp.totalDifference.toLocaleString('es-MX', { maximumFractionDigits: 2 })}</td>
                </tr>
                {expandedEmployees.includes(employeeId) && (
                  <tr>
                    <td colSpan={2} className="bg-yellow-50 px-3 py-2">
                      <table className="w-full text-xs">
                        <thead>
                          <tr>
                            <th className="text-left">Producto</th>
                            <th className="text-right">Diferencia (kg)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {emp.netDifference && Object.entries(emp.netDifference).map(([productId, prod]) => (
                            <tr key={productId}>
                              <td>{prod.name}</td>
                              <td className={`text-right font-bold ${prod.difference < 0 ? 'text-red-600' : 'text-green-600'}`}>{prod.difference.toLocaleString('es-MX', { maximumFractionDigits: 2 })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </>
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
            {Object.entries(filteredByProduct).map(([productId, prod]) => {
              const total = prod.employees ? Object.values(prod.employees).reduce((acc, e) => acc + e.difference, 0) : 0;
              return (
                <>
                  <tr
                    key={productId}
                    className="border-b last:border-b-0 cursor-pointer hover:bg-yellow-100"
                    onClick={() => {
                      setExpandedProducts(prev =>
                        prev.includes(productId)
                          ? prev.filter(id => id !== productId)
                          : [...prev, productId]
                      );
                    }}
                  >
                    <td className="px-3 py-2">{prod.name}</td>
                    <td className={`px-3 py-2 text-right font-bold ${total < 0 ? 'text-red-600' : 'text-green-600'}`}>{total.toLocaleString('es-MX', { maximumFractionDigits: 2 })}</td>
                  </tr>
                  {expandedProducts.includes(productId) && (
                    <tr>
                      <td colSpan={2} className="bg-yellow-50 px-3 py-2">
                        <table className="w-full text-xs">
                          <thead>
                            <tr>
                              <th className="text-left">Empleado</th>
                              <th className="text-right">Diferencia (kg)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {prod.employees && Object.entries(prod.employees).map(([employeeId, emp]) => (
                              <tr key={employeeId}>
                                <td><EmployeeName employee={emp.employee} /></td>
                                <td className={`text-right font-bold ${emp.difference < 0 ? 'text-red-600' : 'text-green-600'}`}>{emp.difference.toLocaleString('es-MX', { maximumFractionDigits: 2 })}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // Helper: Button for header or default
  function renderButton() {
    if (inHeader) {
      const isZero = !totalDiff || Math.abs(totalDiff) < 0.01;
      const icon = isZero ? <MdCheckCircle className="text-green-500" size={22} /> : <MdOutlineDifference className={totalDiff < 0 ? "text-red-500" : "text-green-600"} size={22} />;
      return (
        <button
          className={`flex items-center gap-2 px-3 py-1 rounded-lg border shadow-sm font-bold text-sm transition min-w-[90px] ${isZero ? 'bg-green-50 border-green-200 text-green-700' : totalDiff < 0 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'} hover:brightness-95`}
          onClick={() => setShowModal(true)}
          title="Ver diferencias netas de movimientos"
        >
          {icon}
          <span className="font-semibold">{isZero ? '0' : totalDiff.toLocaleString('es-MX', { style: 'decimal', maximumFractionDigits: 2 })} kg</span>
        </button>
      );
    }
    // Default button
    return (
      <button
        className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-200 shadow-sm min-w-[160px] hover:bg-yellow-100 transition font-bold text-yellow-800"
        onClick={() => setShowModal(true)}
        title="Ver diferencias netas de movimientos"
      >
        <span className="text-2xl">🔄</span>
        <span className="text-xs text-gray-500 font-semibold">Diferencia en movimientos</span>
        <span className={`text-lg font-bold ${totalDiff < 0 ? 'text-red-600' : 'text-green-600'}`}>{totalDiff.toLocaleString('es-MX', { style: 'decimal', maximumFractionDigits: 2 })} kg</span>
      </button>
    );
  }

  // Render
  return (
    <>
      {renderButton()}
      <Modal
        isShown={showModal}
        closeModal={() => setShowModal(false)}
        title="Resumen de diferencias en movimientos"
        width="11/12"
        content={renderModalContent()}
      />
    </>
  );
}
