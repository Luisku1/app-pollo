/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import getEmployeeSupervisorReports from "../services/employees/getEmployeeSupervisorReports";
import ShowListModal from "./Modals/ShowListModal";
import { useSupervisorReports } from "../hooks/Supervisors/useSupervisorReports";
import SupervisorReportList from "./SupervisorReportList";

export default function EmployeeSupervisorReports({ employeeId, employee, toggleComponent }) {

  const { supervisorReports, setSupervisorReports, replaceReport } = useSupervisorReports({ supervisorId: null })
  const [showModal, setShowModal] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        const data = await getEmployeeSupervisorReports(employeeId, new Date().toISOString());
        setLoading(false);
        setSupervisorReports(data);
      } catch (error) {
        console.error("Error fetching supervisor reports:", error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, [employeeId, setSupervisorReports]);

  const toggleModal = () => {
    if (toggleComponent) toggleComponent()
    setShowModal(prev => !prev)
  }

  const totalBalance = useMemo(() => {
    return supervisorReports?.reduce((acc, report) => acc + (report.balance || 0), 0) ?? 0;
  }, [supervisorReports]);

  // Crear el componente para extraInformation
  const extraInformation = () => (
    <div className="p-4 bg-gray-100 rounded-md flex flex-wrap items-center gap-4">
      <p className="text-lg font-semibold">Balance Total:</p>
      <p className={`text-xl font-bold ${totalBalance < 0 ? "text-red-500" : "text-green-500"}`}>
        {totalBalance.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
      </p>
    </div>
  );

  return (
    <div>
      <ShowListModal
        extraInformation={extraInformation}
        className={'mt-4 w-full'}
        title={`Cuentas en supervisión de ${employee?.name}`}
        loading={loading}
        toggleComponent={toggleModal}
        ListComponent={SupervisorReportList}
        ListComponentProps={{ supervisorReports, replaceReport: replaceReport }}
        modalIsOpen={showModal}
      />
    </div>
  );
}
