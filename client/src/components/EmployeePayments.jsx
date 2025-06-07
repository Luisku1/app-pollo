/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from 'react';
import { getEmployeePayments } from '../services/employees/employeePayments';
import ShowListModal from './Modals/ShowListModal';
import TarjetaCuenta from './TarjetaCuenta';
import EmployeePaymentsList from './EmployeePaymentsList';
import { useDate } from '../context/DateContext';

const EmployeePayments = ({ employeeId, employee, toggleComponent }) => {
  const [payments, setPayments] = useState([]);
  const [showModal, setShowModal] = useState(true);
  const [loading, setLoading] = useState(false);
  const { currentDate: date } = useDate();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const data = await getEmployeePayments({ employeeId, date });
        setLoading(false);
        setPayments(data.employeePayments);
      } catch (err) {
        setLoading(false);
        console.error('Error fetching employee payments:', err);
      }
    };

    fetchPayments();
  }, [employeeId]);

  const toggleModal = () => {
    if (toggleComponent) toggleComponent();
    setShowModal((prev) => !prev);
  };

  const totalPayments = useMemo(() => {
    return payments?.reduce((acc, payment) => acc + (payment.amount || 0), 0) ?? 0;
  }, [payments]);

  const extraInformation = () => (
    <div className="p-4 bg-gray-100 rounded-md flex flex-wrap items-center gap-4">
      <p className="text-lg font-semibold">Total Pagos:</p>
      <p className={`text-xl font-bold ${totalPayments < 0 ? "text-red-500" : "text-green-500"}`}>
        {totalPayments.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
      </p>
    </div>
  );

  return (
    <div>
      <ShowListModal
        className={'mt-4 w-full'}
        extraInformation={() => extraInformation()}
        title={`Pagos de ${employee?.name}`}
        loading={loading}
        toggleComponent={toggleModal}
        ListComponent={EmployeePaymentsList}
        ListComponentProps={{ payments }}
        modalIsOpen={showModal}
      />
    </div>
  );
};

export default EmployeePayments;
