import { IoIosAddCircle } from "react-icons/io";
import { useState, useEffect, useRef } from "react";
import Incomes from "./Incomes/Incomes";
import Modal from "./Modals/Modal";
import EntradaInicial from "../pages/EntradaInicial";
import Entradas from "./EntradasYSalidas/Entradas/Entradas";
import Salidas from "./EntradasYSalidas/Salidas/Salidas";
import ExtraOutgoings from "./Outgoings/ExtraOutgoings";
import RegistroCuentaDiaria from "../pages/RegistroCuentaDiaria";
import CreateRest from "./CreateRest";
import Penalties from "./Penalties";
import EmployeePayments from "./EmployeePayments";
import { useSelector } from "react-redux";
import CreateProviderMovement from "./Providers/CreateProviderMovement";
import CreateProviderPayment from "./Providers/CreateProviderPayment";

const menu = [
  { title: "Dinero", onSelec: () => { return <Incomes /> } },
  { title: "Entradas", onSelec: () => { return <Entradas /> } },
  { title: "Salidas", onSelec: () => { return <Salidas /> } },
  { title: "Entrada de Proveedor", onSelec: () => { return <EntradaInicial /> } },
  { title: "Pago a Proveedor", onSelec: () => { return <CreateProviderPayment /> } },
  { title: "Compra y devolución a proveedor", onSelec: () => { return <CreateProviderMovement /> } },
  { title: "Gastos", onSelec: () => { return <ExtraOutgoings /> } },
  { title: "Pago a empleados", onSelec: () => { <EmployeePayments /> } },
  { title: "Formato", onSelec: () => { return <RegistroCuentaDiaria /> } },
  { title: "Descansos", onSelec: () => { return <CreateRest /> } },
  { title: "Retardos y faltas", onSelec: () => { <Penalties /> } },
]

export const RegistersMenu = () => {
  const { currentUser } = useSelector((state) => state.user)
  const [showing, setShowing] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const optionRefs = useRef([]);
  const isDesktop = window.innerWidth >= 1280; // Ajusta el ancho según tus necesidades

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  // Shortcut para abrir/cerrar el menú con la tecla +
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "+") {
        toggleMenu();
      }
      if (isOpen) {
        if (e.key === 'ArrowDown') {
          setHighlightedIndex((prev) => (prev + 1) % menu.length);
        } else if (e.key === 'ArrowUp') {
          setHighlightedIndex((prev) => (prev - 1 + menu.length) % menu.length);
        } else if (e.key === 'Enter' && highlightedIndex >= 0) {
          e.preventDefault();
          setShowing(menu[highlightedIndex].onSelec);
          setIsOpen(false);
        } else if (e.key === 'Escape') {
          setIsOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex]);

  useEffect(() => {
    if (isOpen && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [highlightedIndex, isOpen]);

  if (!currentUser) return null

  return (
    <div className="w-fit">
      <button
        onClick={toggleMenu}
        className="fixed bottom-4 right-4 bg-header text-white p-3 rounded-full shadow-lg hover:bg-black transition duration-300 ease-in-out z-50 opacity-60"
      >
        <IoIosAddCircle className="text-3xl" />
      </button>

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
              <ul className="w-full mt-2 px-2" style={{ maxHeight: 320, overflowY: 'auto', overflowX: 'hidden' }}>
                {menu.map((item, idx) => (
                  <li
                    key={item.title}
                    ref={el => optionRefs.current[idx] = el}
                    className={`w-full px-4 py-3 rounded-lg cursor-pointer mb-2 shadow transition-all text-lg font-medium border border-gray-200 whitespace-normal break-words
                      ${idx === highlightedIndex ? 'bg-orange-100 text-orange-700 border-orange-300 scale-105' : 'bg-white hover:bg-gray-100'}`}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onClick={() => {
                      setShowing(item.onSelec);
                      setIsOpen(false);
                    }}
                  >
                    <span className="block w-full text-left">{item.title}</span>
                  </li>
                ))}
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
          closeOnClickOutside={true}
          closeModal={() => {setShowing(null); setIsOpen(true)}}
        />
      }
    </div>
  );
};