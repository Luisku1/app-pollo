import { IoIosAddCircle } from "react-icons/io";
import { useState } from "react";
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

const menu = [
  { title: "Dinero", onSelec: () => { return <Incomes /> } },
  { title: "Pago a empleados", onSelec: () => { < EmployeePayments /> } },
  { title: "Entrada de Proveedor", onSelec: () => { return <EntradaInicial /> } },
  { title: "Entradas", onSelec: () => { return <Entradas /> } },
  { title: "Salidas", onSelec: () => { return <Salidas /> } },
  { title: "Gastos", onSelec: () => { return <ExtraOutgoings /> } },
  { title: "Formato", onSelec: () => { return <RegistroCuentaDiaria /> } },
  { title: "Descansos", onSelec: () => { return <CreateRest /> } },
  { title: "Retardos y faltas", onSelec: () => { <Penalties /> } },
]

export const RegistersMenu = () => {

  const { currentUser } = useSelector((state) => state.user)
  const [showing, setShowing] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  if (!currentUser) return null

  return (
      <div>
        <button
          onClick={toggleMenu}
          className="fixed bottom-4 right-4 bg-header text-white p-3 rounded-full shadow-lg hover:bg-black transition duration-300 ease-in-out z-50"
        >
          <IoIosAddCircle className="text-3xl" />
        </button>

        {isOpen && (
          <div
            className='fixed inset-0 bg-transparent'
            onClick={() => setIsOpen(false)}
          ></div>
        )}

        {isOpen && (
          <div
            className="fixed bottom-16 right-4 bg-white shadow-lg rounded-lg p-4 z-50 max-h-80 overflow-y-auto h-auto border border-gray-300 mb-2"
          >
            <h2 className="text-lg text-center font-bold mb-2">Menu</h2>
            <ul className="space-y-2">
              {menu.map((item, index) => (
                <li key={index} className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setShowing(item.onSelec);
                      toggleMenu();
                    }}
                    className="text-black hover:underline text-left w-full"
                  >
                    <p className="text-left ">{item.title}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showing &&
          <Modal
            content={showing}
            ableToClose={true}
            fit={true}
            shape="rounded-lg border-2 border-gray-300"
            closeOnClickOutside={true}
            closeModal={() => setShowing(null)}
          />
        }
      </div>
    );
};