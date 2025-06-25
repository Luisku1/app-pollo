import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RegistersMenu } from './RegistersMenu';
import { SearchMenu } from './Search';
import { useBranches } from '../hooks/Branches/useBranches';
import { useEmployees } from '../hooks/Employees/useEmployees';
import { useCustomers } from '../hooks/Customers/useCustomers';
import FechaDePagina from './FechaDePagina';

export default function Header() {

  const { company } = useSelector((state) => state.user);

  const { branches } = useBranches({ companyId: company._id })
  const { employees } = useEmployees({ companyId: company._id })
  const { customers } = useCustomers({ companyId: company._id })

  return (
    <header className='bg-header shadow-md sticky top-0 z-[9999] flex flex-col items-center justify-center p-2'>
      <div className='w-full flex justify-center items-center'>
        <FechaDePagina />
      </div>
      <SearchMenu modalMode={true} />
      <RegistersMenu />
    </header>
  );
}
