import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { MdSearch, MdHome } from "react-icons/md"; // Added MdHome
import '../assets/dropdown.css';
import { useRoles } from '../context/RolesContext';
import { useDate } from '../context/DateContext'; // Import DateContext
import { formatDate, formatInformationDate } from '../helpers/DatePickerFunctions';
import { normalizeText } from '../helpers/Functions';
import { RegistersMenu } from './RegistersMenu';
import { SearchMenu } from './Search';
import { useBranches } from '../hooks/Branches/useBranches';
import { useEmployees } from '../hooks/Employees/useEmployees';
import { useCustomers } from '../hooks/Customers/useCustomers';
import FechaDePagina from './FechaDePagina';
import { useDateNavigation } from '../hooks/useDateNavigation';

export default function Header() {

  const { company } = useSelector((state) => state.user);
  const { currentDate, setDate, isDateAware } = useDateNavigation({ fallbackToToday: true }); // Use the custom hook to get the current date

  const { branches } = useBranches({ companyId: company._id })
  const { employees } = useEmployees({ companyId: company._id })
  const { customers } = useCustomers({ companyId: company._id })

  return (
    <header className='bg-header shadow-md sticky top-0 z-[9999] flex flex-col items-center justify-center p-2'>
      {isDateAware &&
        <div className='w-full flex justify-center items-center'>
          <FechaDePagina changeDatePickerValue={setDate} changeDay={setDate} higherZ={true} currentDate={currentDate} />
        </div>
      }
      <SearchMenu modalMode={true} />
      <RegistersMenu />
    </header>
  );
}
