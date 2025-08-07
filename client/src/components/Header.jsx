import { useSelector } from 'react-redux';
import MobileHeaderMenu from './MobileHeaderMenu';
import { useRoles } from '../context/RolesContext';
import NetDifferenceCard from './statistics/NetDifferenceCard';
import { RegistersMenu } from './RegistersMenu';
import { SearchMenu } from './Search';
import { MdSearch } from 'react-icons/md';
import { IoIosAddCircle } from 'react-icons/io';
import { useBranches } from '../hooks/Branches/useBranches';
import { useEmployees } from '../hooks/Employees/useEmployees';
import { useCustomers } from '../hooks/Customers/useCustomers';
import FechaDePagina from './FechaDePagina';
import { useDateNavigation } from '../hooks/useDateNavigation';
import { useEmployeesDailyBalances } from '../hooks/Employees/useEmployeesDailyBalances';

export default function Header() {

  const { currentUser, company } = useSelector((state) => state.user);

  const { isSupervisor } = useRoles();
  const { currentDate } = useDateNavigation();

  const { employeesDailyBalances } = useEmployeesDailyBalances({ companyId: company?._id, date: currentDate });
  const { branches } = useBranches({ companyId: company?._id })
  const { employees } = useEmployees({ companyId: company?._id })
  const { customers } = useCustomers({ companyId: company?._id })

  return (
    <header className='bg-header shadow-md sticky top-0 z-[9999] flex flex-col items-center justify-center p-2'>
      {currentUser &&
        <div className='w-full flex items-center justify-between gap-2'>
          {/* Mobile: FechaDePagina y MobileHeaderMenu en el mismo renglón */}
          <div className='flex items-center w-full xl:hidden'>
            <div className='flex-1 flex justify-center items-center'>
              <FechaDePagina />
            </div>
            <div className='flex items-center'>
              <MobileHeaderMenu currentUser={currentUser} />
            </div>
          </div>

          {/* Desktop: Nueva organización */}
          <div className='hidden xl:flex w-full items-center'>
            {/* Izquierda: FechaDePagina alineada al centro de su lado */}
            <div className='flex-1 flex justify-center items-center'>
              <FechaDePagina />
            </div>
            {/* Centro: Barra de búsqueda */}
            <div className='flex-1 flex justify-center items-center'>
              <SearchMenu modalMode={true} desktopButton={
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm transition text-base font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400"
                  style={{ minWidth: '200px' }}
                />
              } />
            </div>
            {/* Derecha: RegistersMenu y NetDifferenceCard alineados al centro de su lado */}
            <div className='flex-1 flex justify-center items-center gap-2'>
              <RegistersMenu desktopButton={
                <button
                  className="flex items-center gap-1 px-3 py-1 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 shadow-sm transition text-base font-semibold"
                  title="Agregar registro (Ctrl +)"
                >
                  <IoIosAddCircle className="text-2xl" />
                  <span className="hidden lg:inline">Agregar</span>
                </button>
              } />
              {isSupervisor(currentUser?.role) && (
                <NetDifferenceCard inHeader />
              )}
            </div>
          </div>
        </div>
      }
      {!currentUser &&
        <div className='flex-1 flex justify-center items-center'>
          <h1 className='text-2xl font-bold text-white'>Pio App</h1>
        </div>
      }
      <div className="flex xl:hidden w-full">
        <SearchMenu modalMode={true} />
        <RegistersMenu />
      </div>
    </header>
  );
}
