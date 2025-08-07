
import { useEmployeePayroll } from "../../hooks/Employees/useEmployeePayroll";
import PhoneLinks from "../PhoneLinks";
import EmployeePayroll from "./EmployeePayroll";

export default function PortatilEmployeePayroll({ employee }) {
  const {
    payroll: employeePayroll,
    loading: payrollLoading,
    error: payrollError,
    date: payrollDate,
    updateBranchReport,
    updateSupervisorReport,
    goToPreviousWeek,
    goToNextWeek,
  } = useEmployeePayroll({ employee });

  if (payrollLoading) {
    return <p>Cargando nómina...</p>;
  }

  if (payrollError) {
    return <p>Error al cargar la nómina: {payrollError}</p>;
  }

  if (!employeePayroll) {
    return <p className="font-semibold">No hay nómina disponible para este empleado.
      <br />
      Por favor, reporta este problema.
      <br />
      <PhoneLinks phoneNumber={'55-4220-4979'} />
    </p>;
  }

  return (
    <div className="my-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <button onClick={goToPreviousWeek} className="px-2 py-1 border rounded bg-gray-200 hover:bg-gray-300">
          Semana anterior
        </button>
        <div className="text-center">
          <p className="font-semibold">Nómina</p>
          <p className="font-bold">{payrollDate}</p>
        </div>
        <button onClick={goToNextWeek} className="px-2 py-1 border rounded bg-gray-200 hover:bg-gray-300">
          Semana siguiente
        </button>
      </div>
      <EmployeePayroll
        employeePayroll={employeePayroll}
        updateBranchReportGroup={updateBranchReport.group}
        updateBranchReportSingle={updateBranchReport.single}
        updateSupervisorReportGroup={updateSupervisorReport.group}
        updateSupervisorReportSingle={updateSupervisorReport.single}
      />
    </div>
  );
}

