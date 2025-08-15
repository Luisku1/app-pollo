import { IoIosAddCircle } from "react-icons/io";
import { useState, useEffect, useRef, useMemo } from "react";
import Modal from "./Modals/Modal";
import EntradaInicial from "../pages/EntradaInicial";
import ExtraOutgoings from "./Outgoings/ExtraOutgoings";
import RegistroCuentaDiaria from "../pages/RegistroCuentaDiaria";
import CreateRest from "./CreateRest";
import Penalties from "./Penalties";
import { useSelector } from "react-redux";

import RegistroProveedor from "../pages/RegistroProveedor";
import IncomesAndOutgoings from "./SupervisorSections/IncomesAndOutgoings";
import EntradasYSalidas from "./Movimientos/EntradasYSalidas";
import Payments from "./Outgoings/Payments";
import ProviderRegisters from "./ProviderRegisters";
import { useRoles } from "../context/RolesContext";
import StockAndOutgoings from "./StockAndOutgoings";


export const RegistersMenu = ({ desktopButton }) => {
  const { currentUser } = useSelector((state) => state.user)
  const [showing, setShowing] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const { isSeller, isSupervisor, isManager } = useRoles();
  const [searchTerm, setSearchTerm] = useState("");
  const optionRefs = useRef([]);
  const searchInputRef = useRef(null);
  const isDesktop = window.innerWidth >= 1280; // Ajusta el ancho según tus necesidades

  // Lista base de opciones con metadatos de rol (rol mínimo requerido)
  const menu = useMemo(() => ([
    { title: "Dinero", role: 'supervisor', onSelec: () => <IncomesAndOutgoings /> },
    { title: "Movimientos Internos", role: 'supervisor', onSelec: () => <EntradasYSalidas /> },
    { title: "Entrada de Proveedor", role: 'supervisor', onSelec: () => <EntradaInicial /> },
    { title: "Movimientos de Proveedor", role: 'manager', onSelec: () => <ProviderRegisters /> },
    { title: "Gastos", role: 'supervisor', onSelec: () => <ExtraOutgoings /> },
    { title: "Pago a empleados", role: 'supervisor', onSelec: () => <Payments /> },
    { title: "Formato exprés", role: 'seller', onSelec: () => <StockAndOutgoings /> },
    { title: "Descansos", role: 'supervisor', onSelec: () => <CreateRest /> },
    { title: "Retardos y faltas", role: 'supervisor', onSelec: () => <Penalties /> },
    { title: "Registrar proveedor", role: 'supervisor', onSelec: () => <RegistroProveedor /> },
  ]), []);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  // Filtrado por rol similar al de Search.jsx
  const roleValue = currentUser?.companyData?.[0]?.role;
  const normalize = (str) => str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const normalizedSearch = normalize(searchTerm);

  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
      // Rol
      const matchesRole = !item.role ||
        (item.role === 'supervisor' && isSupervisor(roleValue)) ||
        (item.role === 'manager' && isManager(roleValue)) ||
        (item.role === 'seller' && isSeller(roleValue));
      if (!matchesRole) return false;
      // Texto
      if (!searchTerm) return true;
      return normalize(item.title).includes(normalizedSearch);
    });
  }, [menu, roleValue, isSupervisor, isManager, isSeller, normalizedSearch, searchTerm]);
  // Shortcut para abrir/cerrar el menú con la tecla +
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "+") {
        e.preventDefault();
        toggleMenu();
      }
      if (isOpen) {
        if (e.key === 'ArrowDown') {
          setHighlightedIndex((prev) => (prev + 1) % filteredMenu.length);
        } else if (e.key === 'ArrowUp') {
          setHighlightedIndex((prev) => (prev - 1 + filteredMenu.length) % filteredMenu.length);
        } else if (e.key === 'Enter' && highlightedIndex >= 0) {
          e.preventDefault();
          setShowing(filteredMenu[highlightedIndex].onSelec);
          setIsOpen(false);
        } else if (e.key === 'Escape') {
          setIsOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, filteredMenu]);

  useEffect(() => {
    if (isOpen && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex].scrollIntoView({
        block: 'nearest',
      });
    }
  }, [highlightedIndex, isOpen]);

  // Focus automático al abrir el modal por primera vez
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      setSearchTerm("");
    }
  }, [isOpen]);


  // Cuando se selecciona un registro, resetea el searchTerm y el highlightedIndex
  const handleSelect = (onSelec) => {
    setShowing(onSelec);
    setIsOpen(false);
    setSearchTerm("");
    setHighlightedIndex(0);
  };

  if (!currentUser) return null

  return (
    <div className="w-fit">
      {/* Desktop button (if provided) */}
      {desktopButton && (
        <span onClick={toggleMenu}>{desktopButton}</span>
      )}
      {/* Mobile floating button */}
      {!desktopButton && (
        <button
          onClick={toggleMenu}
          className="fixed bottom-4 right-4 bg-header text-white p-3 rounded-full shadow-lg hover:bg-black transition duration-300 ease-in-out z-50 opacity-60"
        >
          <IoIosAddCircle className="text-3xl" />
        </button>
      )}

      {isOpen && (
        <Modal
          closeModal={() => setIsOpen(false)}
          ableToClose={true}
          closeOnEsc={true}
          closeOnClickOutside={true}
          width="auto"
          fit={true}
          content={
            <div className="w-full max-w-md flex flex-col items-center gap-4">
              <h2 className="text-lg text-center font-bold mb-2">Agregar registro</h2>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 "
              />
              <ul className="w-full mt-2 px-2" style={{ maxHeight: 320, minHeight: 220, overflowY: 'auto', overflowX: 'hidden' }}>
                {filteredMenu.length === 0 ? (
                  <li className="text-gray-400 text-center py-2">No hay resultados</li>
                ) : (
                  filteredMenu.map((item, idx) => (
                    <li
                      key={item.title}
                      ref={el => optionRefs.current[idx] = el}
                      className={`w-full py-2 rounded-lg cursor-pointer mb-2 text-lg font-medium border border-gray-200
                        ${idx === highlightedIndex ? 'bg-orange-100 text-orange-700 border-orange-300 ' : 'bg-white hover:bg-gray-100'}`}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      onClick={() => handleSelect(item.onSelec)}
                    >
                      <span className="block w-full text-left">{item.title}</span>
                    </li>
                  ))
                )}
              </ul>
              {isDesktop && (
                <p className="text-xs text-gray-400 mt-2">Navega con ↑ ↓ y selecciona con Enter</p>
              )}
            </div>
          }
        />
      )}
      {showing &&
        <Modal
          content={showing}
          ableToClose={true}
          fit={true}
          shape="rounded-lg border-2 border-gray-300"
          closeOnEsc={true}
          width="w-full"
          closeOnClickOutside={true}
          closeModal={() => { setShowing(null); setIsOpen(true); setSearchTerm(""); setHighlightedIndex(0); }}
        />
      }
    </div>
  );
};