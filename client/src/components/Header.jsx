import { GiChicken } from 'react-icons/gi';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { MdSearch, MdHome } from "react-icons/md"; // Added MdHome
import '../assets/dropdown.css';
import { useRoles } from '../context/RolesContext';
import { useDate } from '../context/DateContext'; // Import DateContext
import { formatDate, formatInformationDate } from '../helpers/DatePickerFunctions';

export default function Header() {

  const { currentUser, company } = useSelector((state) => state.user);
  const { roles, isSupervisor, isManager } = useRoles();
  const { currentDate } = useDate() || {}; // Add fallback to prevent destructuring error
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1); // Added state for highlighted index
  const homeLink = !currentUser ?
    '/inicio-sesion'
    :
    isManager(currentUser.role?._id ?? currentUser.role) ?
      '/reporte'
      :
      isSupervisor(currentUser.role?._id ?? currentUser.role) ?
        '/supervision-diaria'
        :
        '/formato';

  const isToday = formatDate(currentDate) === formatDate(new Date());

  const menuOptions = [
    { text: 'Perfil', link: currentUser ? `/perfil/${currentUser._id}` : '/inicio-sesion' },
    { text: 'Crear formato', link: '/formato', date: true },
    { text: 'Supervisión', link: '/supervision-diaria', role: 'supervisor', date: true },
    { text: 'Registro Empleado', link: '/registro-empleado', role: 'supervisor' },
    { text: 'Registro Cliente', link: '/registro-cliente', role: 'supervisor' },
    { text: 'Registro Proveedor', link: '/registro-proveedor', role: 'supervisor' },
    { text: 'Sucursales', link: '/sucursales', role: 'supervisor' },
    { text: 'Reporte', link: '/reporte', role: 'supervisor', date: true },
    { text: 'Nomina', link: '/nomina', role: 'manager', date: true },
    { text: 'Cuentas', link: '/listado-de-cuentas', role: 'manager' },
    { text: 'Empleados', link: '/empleados', role: 'manager' },
    { text: 'Productos', link: '/productos', role: 'manager' },
    { text: 'Precios', link: '/precios', role: 'manager' },
    { text: 'Empresa', link: '/empresas', role: 'manager' },
  ];

  useEffect(() => {
    const filtered = menuOptions.flatMap(option => {
      const matchesSearch = option.text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !option.role ||
        (option.role === 'supervisor' && isSupervisor(currentUser?.role)) ||
        (option.role === 'manager' && isManager(currentUser?.role));

      if (matchesSearch && matchesRole) {
        if (!isToday && option.date) {
          return [
            option,
            { ...option, text: `${option.text} (${formatInformationDate(currentDate)})` } // Add option with date
          ];
        }
        return option;
      }
      return [];
    });

    setFilteredOptions(filtered);
  }, [searchTerm, currentUser, roles, isToday, currentDate]); // Added isToday and currentDate to dependencies

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowDropdown(false);
      }
      if (e.ctrlKey && (e.key === 'm' || e.key === 'M')) { // Added shortcut for Ctrl + T
        e.preventDefault();
        document.getElementById('search-bar')?.focus();
        setShowDropdown(true);
      }
      if (showDropdown) { // Handle arrow key navigation
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setHighlightedIndex((prev) => (prev + 1) % filteredOptions.length); // Wrap to the beginning
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setHighlightedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length); // Wrap to the end
        } else if (e.key === 'Enter' && highlightedIndex >= 0) {
          e.preventDefault();
          const selectedOption = filteredOptions[highlightedIndex];
          if (selectedOption) {
            setShowDropdown(false);
            setSearchTerm('');
            window.location.href = selectedOption.link; // Navigate to the selected option
          }
        }
      }
    };

    const handlePopState = () => {
      setShowDropdown(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [showDropdown, filteredOptions, highlightedIndex]); // Added dependencies

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-container') && !e.target.closest('#search-bar')) { // Ensure clicks outside close the dropdown
        setShowDropdown(false);
        setSearchTerm(''); // Clear the search term when clicking outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside); // Use 'mousedown' for better detection

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className='bg-header shadow-md sticky top-0 z-[9999]'>
      <div className='flex justify-between items-center mx-auto p-3 max-w-full flex-row-reverse'>
        <Link to={homeLink}> {/* Changed to home icon */}
          <MdHome className='text-white border rounded-md border-white h-9 w-9 mr-4' />
        </Link>
        <div
          className={`relative flex mx-auto items-center w-8/12 ${showDropdown ? 'z-[11000]' : ''}`}
        >
          {showDropdown && (
            <div
              className='fixed inset-0 bg-transparent'
              onClick={() => setShowDropdown(false)}
            ></div>
          )}
          <div className='relative w-full dropdown-container'>
            <MdSearch
              onClick={() => setShowDropdown(true)}
              className='absolute left-2.5 text-gray-500 mt-2.5 w-5 h-5 '
            />
            <input
              id='search-bar' // Added id for search bar
              onClick={() => setShowDropdown(true)}
              type='text'
              className='w-full pl-10 pr-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400'
              placeholder='Buscar...'
              autoComplete='off'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {(searchTerm || showDropdown) && (
              <ul className='absolute top-full left-0 w-full bg-white border border-gray-300 rounded shadow-md mt-1'>
                {filteredOptions.map((option, index) => (
                  <li
                    key={index}
                    className={`px-4 py-2 cursor-pointer ${highlightedIndex === index ? 'bg-gray-200' : 'hover:bg-gray-100'
                      }`} // Highlight selected option
                    onMouseEnter={() => setHighlightedIndex(index)} // Update highlight on hover
                    onClick={() => {
                      setShowDropdown(false);
                      setSearchTerm('');
                    }}
                  >
                    <Link
                      to={option.link}
                      className='block w-full h-full'
                    >
                      {option.text}
                    </Link>
                  </li>
                ))}
                {filteredOptions.length === 0 && (
                  <li className='px-4 py-2 text-gray-500'>No hay resultados</li>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
