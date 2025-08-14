import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { MdSearch } from "react-icons/md";
import { useSelector } from "react-redux";
import Modal from "./Modals/Modal";
import { useNavigate } from "react-router-dom";
import { formatInformationDate } from '../helpers/DatePickerFunctions';
import { useRoles } from '../context/RolesContext';
import { dateFromYYYYMMDD, formatDateYYYYMMDD } from "../../../common/dateOps";
import { useDateNavigation } from "../hooks/useDateNavigation";

export const SearchMenu = ({ modalMode, desktopButton }) => {
  const { currentUser } = useSelector(state => state.user);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(null);

  const navigate = useNavigate();
  const { roles, isSupervisor, isManager, isController } = useRoles();
  const { currentDate, dateFromYYYYMMDD: dateYYYYMMDD, today: isToday } = useDateNavigation();
  const optionRefs = useRef([]);

  const menuOptions = useMemo(() => ([
    { text: 'Resumen diario', link: '/', role: 'controller' },
    { text: 'Perfil', link: currentUser ? `/perfil/${currentUser._id}` : '/inicio-sesion' },
    { text: 'Crear formato', link: '/formato', date: true, dateRole: true },
    { text: 'Supervisión', link: '/supervision-diaria', role: 'supervisor', date: true },
    { text: 'Gráficos', link: '/graficos', role: 'supervisor' },
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
  ]), [currentUser]);

  const filteredOptions = useMemo(() => {
    const normalize = str => str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
    return menuOptions.flatMap(option => {
      const matchesSearch = normalize(option.text).includes(normalize(searchTerm));
      const matchesRole = !option.role ||
        (option.role === 'supervisor' && isSupervisor(currentUser?.companyData?.[0]?.role)) ||
        (option.role === 'manager' && isManager(currentUser?.companyData?.[0]?.role)) ||
        (option.role === 'controller' && isController(currentUser?.companyData?.[0]?.role));
      if (!matchesSearch || !matchesRole) return [];

      if (!isToday && option.date) {
        if (option.dateRole && !isManager(currentUser?.companyData?.[0]?.role)) return option;
        return [
          option,
          { ...option, text: `${option.text} (${formatInformationDate(dateYYYYMMDD)})`, link: `${option.link}/${currentDate}` }
        ];
      } else if (isToday && option.date) {
        let yesterday = new Date(dateYYYYMMDD);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayFormatted = formatDateYYYYMMDD(yesterday);
        if (option.dateRole && !isManager(currentUser?.companyData?.[0]?.role)) return option;
        return [
          option,
          { ...option, text: `${option.text} (${formatInformationDate(dateFromYYYYMMDD(yesterdayFormatted))})`, link: `${option.link}/${yesterdayFormatted}` }
        ];
      }

      return option;
    });
  }, [searchTerm, currentUser, isSupervisor, isManager, isController, isToday, currentDate, dateYYYYMMDD, menuOptions]);

  const handleOptionSelect = useCallback((option, openInNewTab = false) => {
    if (!option || !option.link) return;
    setShowModal(false);
    setSearchTerm("");
    requestAnimationFrame(() => {
      if (openInNewTab) {
        const newTab = window.open(option.link, '_blank');
        newTab?.focus();
      } else {
        navigate(option.link);
      }
    });
  }, [navigate]);

  // Keydown para navegación y atajos, excepto Enter
  const handleKeyDown = useCallback((e) => {
    if (!currentUser) return;

    if (e.ctrlKey && (e.key === 'b' || e.key === 'B')) {
      e.preventDefault();
      setShowModal(prev => !prev);
    } else if (showModal) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowModal(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % filteredOptions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + filteredOptions.length) % filteredOptions.length);
      }
    }
  }, [showModal, currentUser, filteredOptions.length]);


  // Keydown para navegación y atajos (sin Enter)
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Keydown SOLO para Enter (más controlado y sin race condition)
  const frozenOptionRef = useRef();
  useEffect(() => {
    if (!showModal || !currentUser) return;

    const handleEnter = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        // Congela la opción seleccionada en el momento del evento
        const option = filteredOptions[highlightedIndex];
        frozenOptionRef.current = option;
        handleOptionSelect(option, e.ctrlKey);
      }
    };

    window.addEventListener('keydown', handleEnter);
    return () => window.removeEventListener('keydown', handleEnter);
  }, [showModal, currentUser, filteredOptions, highlightedIndex, handleOptionSelect]);

  useEffect(() => {
    if (filteredOptions.length > 0) {
      setHighlightedIndex(0);
    }
  }, [searchTerm, filteredOptions.length]);

  useEffect(() => {
    // Si el índice anterior ya no es válido con el nuevo filtro, reinícialo
    if (highlightedIndex >= filteredOptions.length) {
      setHighlightedIndex(0);
    }
  }, [filteredOptions, highlightedIndex]);

  useEffect(() => {
    if (showModal && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex].scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, showModal, filteredOptions]);

  if (!currentUser) return null;

  return (
    <>
      {desktopButton ? (
        <span onClick={() => setShowModal(true)}>{desktopButton}</span>
      ) : (
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
                className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <ul className="w-full mt-2" style={{ maxHeight: 300, overflowY: 'auto' }}>
                {filteredOptions.length === 0 && (
                  <li className="text-gray-400 text-center py-2">No hay resultados</li>
                )}
                {filteredOptions.map((option, idx) => (
                  <li
                    key={option.text + idx}
                    ref={el => optionRefs.current[idx] = el}
                    className={`px-4 py-2 rounded cursor-pointer ${idx === highlightedIndex ? 'bg-orange-100 text-orange-700' : 'hover:bg-gray-100'}`}
                  >
                    <a
                      href={option.link}
                      tabIndex={-1}
                      className="block w-full h-full"
                      onClick={e => {
                        // Si es Ctrl+Click o botón central, deja el comportamiento por defecto (nueva pestaña)
                        if (e.ctrlKey || e.metaKey || e.button === 1) return;
                        e.preventDefault();
                        handleOptionSelect(option);
                      }}
                    >
                      {option.text}
                    </a>
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
