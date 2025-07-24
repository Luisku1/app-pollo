import { useEffect, useState, useRef, useMemo } from "react";
import { MdSearch } from "react-icons/md";
import { useSelector } from "react-redux";
import Modal from "./Modals/Modal";
import { useNavigate } from "react-router-dom";
import { formatDate, formatInformationDate } from '../helpers/DatePickerFunctions';
import { useRoles } from '../context/RolesContext';
import { dateFromYYYYMMDD, formatDateYYYYMMDD, today } from "../../../common/dateOps";
import { useDateNavigation } from "../hooks/useDateNavigation";



export const SearchMenu = ({ modalMode, desktopButton }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const navigate = useNavigate();
  const { roles, isSupervisor, isManager, isController } = useRoles();
  const { currentDate, dateFromYYYYMMDD: dateYYYYMMDD, today: isToday } = useDateNavigation();
  const optionRefs = useRef([]);

  // --- menuOptions igual que en Header ---
  const menuOptions = [
    { text: 'Resumen diario', link: '/', role: 'controller' },
    { text: 'Perfil', link: currentUser ? `/perfil/${currentUser._id}` : '/inicio-sesion' },
    { text: 'Crear formato', link: '/formato', date: true, dateRole: true },
    { text: 'Supervisión', link: '/supervision-diaria', role: 'supervisor', date: true },
    { text: 'Registro Empleado', link: '/registro-empleado', role: 'supervisor', dateRole: true },
    { text: 'Registro Cliente', link: '/registro-cliente', role: 'supervisor' },
    { text: 'Sucursales', link: '/sucursales', role: 'supervisor' },
    { text: 'Proveedores', link: '/proveedores', role: 'manager', date: true },
    { text: 'Reporte', link: '/reporte', role: 'supervisor', date: true },
    { text: 'Nomina', link: '/nomina', role: 'manager', date: true, dateRole: true },
    { text: 'Cuentas', link: '/listado-de-cuentas', role: 'manager' },
    { text: 'Empleados', link: '/empleados', role: 'supervisor' },
    { text: 'Productos', link: '/productos', role: 'manager' },
    { text: 'Precios', link: '/precios', role: 'manager' },
    { text: 'Empresa', link: '/empresas', role: 'manager' },
  ];


  useEffect(() => {
    if (showModal) {
      document.body.classList.add('no-scroll'); // Add class to prevent body scroll
    } else {
      document.body.classList.remove('no-scroll'); // Remove class to allow body scroll
    }

    return () => {
      document.body.classList.remove('no-scroll'); // Cleanup on unmount
    };
  }, [showModal]);


  const filteredOptions = useMemo(() => {
    return menuOptions.flatMap(option => {
      const normalize = (str) => str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
      const matchesSearch = normalize(option.text).includes(normalize(searchTerm));
      const matchesRole = !option.role ||
        (option.role === 'supervisor' && isSupervisor(currentUser?.role)) ||
        (option.role === 'manager' && isManager(currentUser?.role)) ||
        (option.role === 'controller' && isController(currentUser?.role));
      if (matchesSearch && matchesRole) {
        if (!isToday && option.date) {
          if (option.dateRole && !isManager(currentUser?.role)) {
            return option;
          }
          return [
            option,
            { ...option, text: `${option.text} (${formatInformationDate(dateYYYYMMDD)})`, link: `${option.link}/${currentDate}` }
          ];
        } else {
          if (isToday && option.date) {
            let yesterdayDate = new Date(dateYYYYMMDD);
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            yesterdayDate = formatDateYYYYMMDD(yesterdayDate);
            if (option.dateRole && !isManager(currentUser?.role)) {
              return option;
            }
            return [
              option,
              { ...option, text: `${option.text} (${formatInformationDate(dateFromYYYYMMDD(yesterdayDate))})`, link: `${option.link}/${yesterdayDate}` }
            ];
          }
        }
        return option;
      }
      return [];
    });

  }, [searchTerm, currentUser, currentDate, isToday, dateYYYYMMDD, isSupervisor, isManager, isController]);


  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  useEffect(() => {
    if (highlightedIndex >= filteredOptions.length) {
      setHighlightedIndex(0);
    }
  }, [filteredOptions]);

  useEffect(() => {

    if (!currentUser) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowModal(false);
      }
      if (e.ctrlKey && (e.key === 'b' || e.key === 'B')) { // Added shortcut for Ctrl + T
        e.preventDefault();
        document.getElementById('search-bar')?.focus();
        setShowModal(prev => !prev);
      }
      if (showModal) {
        if (e.key === 'ArrowDown') {
          setHighlightedIndex((prev) => (prev + 1) % filteredOptions.length); // Navigate options

        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setHighlightedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
        }
        else if (e.ctrlKey) {
          // Solo ejecuta si el modal está abierto y hay opción seleccionada
          if (!showModal) return;
          if (e.key === 'Enter') {
            const selectedOption = filteredOptions[highlightedIndex];
            console.log(highlightedIndex)
            // Evita doble ejecución y navegación SPA
            e.preventDefault();
            e.stopPropagation();
            if (selectedOption && selectedOption.link) {
              const newTab = window.open(selectedOption.link, '_blank');
              console.log(selectedOption.link, newTab);
              newTab?.focus();
              setShowModal(false);
              setSearchTerm('');
            }
            return;
          }
          // Enter normal: navega en SPA

        } else if (e.key === 'Enter') {

          const selectedOption = filteredOptions[highlightedIndex];

          if (selectedOption && selectedOption.link) {
            e.preventDefault();
            setShowModal(false);
            setSearchTerm('');
            navigate(selectedOption.link);
          }
        }
      }
    };

    const handlePopState = () => {
      setShowModal(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [showModal, filteredOptions, highlightedIndex, currentUser]); // Added dependencies

  useEffect(() => {
    if (showModal && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex].scrollIntoView({
        block: 'nearest',
      });
    }
  }, [highlightedIndex, showModal, filteredOptions]);

  if (!currentUser) return null;

  return (
    <>
      {/* Desktop button (if provided) */}
      {desktopButton && (
        <span onClick={() => setShowModal(true)}>{desktopButton}</span>
      )}
      {/* Mobile floating button */}
      {!desktopButton && (
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-4 opacity-60 left-4 bg-header text-white p-3 rounded-full shadow-lg hover:bg-black transition duration-300 ease-in-out z-50"
          title="Buscar página"
        >
          <MdSearch className="text-3xl" />
        </button>
      )}
      {modalMode && showModal && (
        <Modal
          closeModal={() => setShowModal(false)}
          ableToClose={true}
          closeOnEsc={true}
          closeOnClickOutside={true}
          width="auto"
          fit={true}
          content={
            <div className="p-4 w-full max-w-md flex flex-col items-center gap-4">
              <input
                autoFocus
                type="text"
                placeholder="Buscar página..."
                className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 text-lg"
                value={searchTerm}
                onChange={e => { e.stopPropagation(); e.preventDefault(); setSearchTerm(e.target.value); }}
              />
              <ul className="w-full mt-2" style={{ maxHeight: 300, overflowY: 'auto' }}>
                {filteredOptions.length === 0 && (
                  <li className="text-gray-400 text-center py-2">No hay resultados</li>
                )}
                {filteredOptions.map((option, idx) => (
                  <li
                    key={option.text + option.link}
                    ref={el => optionRefs.current[idx] = el}
                    className={`px-4 py-2 rounded cursor-pointer ${idx === highlightedIndex ? 'bg-orange-100 text-orange-700' : 'hover:bg-gray-100'}`}
                    onClick={() => {
                      navigate(option.link);
                      setShowModal(false);
                      setSearchTerm("");
                    }}
                  >
                    {option.text}
                  </li>
                ))}
              </ul>
            </div>
          }
        />
      )}
    </>
  );
};