/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from 'react';
import { getEmployeesBranchReports } from '../services/employees/getEmployeesBranchReports';
import { useBranchReports } from '../hooks/BranchReports.js/useBranchReports';
import ShowListModal from './Modals/ShowListModal';
import TarjetaCuenta from './TarjetaCuenta';
import { useSelector } from 'react-redux';

const EmployeeBranchReports = ({ employeeId, employee, toggleComponent }) => {

  const { company } = useSelector(state => state.user)
  const { branchReports, setReports, replaceReport } = useBranchReports({ companyId: null });
  const [showModal, setShowModal] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    const fetchBranchReports = async () => {
      try {
        setLoading(true);
        const data = await getEmployeesBranchReports(employeeId, new Date().toISOString(), company._id);
        setLoading(false);
        setReports(data);
      } catch (err) {
        setLoading(false);
        console.error('Error fetching branch reports:', err);
      }
    };

    fetchBranchReports();

  }, [employeeId, setReports])

  const toggleModal = () => {
    if (toggleComponent) toggleComponent()
    setShowModal(prev => !prev)
  }

  const totalBalance = useMemo(() => {
    return branchReports?.reduce((acc, report) => acc + (report.balance || 0), 0) ?? 0;
  }, [branchReports]);

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
        className={'mt-4 w-full'}
        extraInformation={() => extraInformation()}
        title={`Cuentas en pollería de ${employee?.name}`}
        loading={loading}
        toggleComponent={toggleModal}
        ListComponent={TarjetaCuenta}
        ListComponentProps={{ reportArray: branchReports, replaceReport: replaceReport }}
        modalIsOpen={showModal}
      />
    </div>
  );
};

export default EmployeeBranchReports;
