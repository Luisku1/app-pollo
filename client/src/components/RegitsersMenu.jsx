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
import { useBranches } from "../hooks/Branches/useBranches";
import { useEmployees } from "../hooks/Employees/useEmployees";
import { useCustomers } from "../hooks/Customers/useCustomers";

export const RegistersMenu = () => {
  const { currentUser, company } = useSelector((state) => state.user)
  const [showing, setShowing] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const { branches } = useBranches({ companyId: company._id })
  const { employees } = useEmployees({ companyId: company._id })
  const { customers } = useCustomers({ companyId: company._id })

  // Estado compartido para Entradas y Salidas
  const [selectedProduct, setSelectedProduct] = useState(null);
  const setSelectedProductToNull = () => setSelectedProduct(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  if (!currentUser) return null

  // Menú actualizado para pasar el estado compartido
  const menu = [
    { title: "Dinero", onSelec: () => <Incomes /> },
    { title: "Salidas", onSelec: () => <Salidas selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} setSelectedProductToNull={setSelectedProductToNull} /> },
    { title: "Entradas", onSelec: () => <Entradas selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} setSelectedProductToNull={setSelectedProductToNull} /> },
    { title: "Gastos", onSelec: () => <ExtraOutgoings /> },
    { title: "Pago a empleados", onSelec: () => <EmployeePayments /> },
    { title: "Entrada de Proveedor", onSelec: () => <EntradaInicial /> },
    { title: "Formato", onSelec: () => <RegistroCuentaDiaria /> },
    { title: "Descansos", onSelec: () => <CreateRest /> },
    { title: "Retardos y faltas", onSelec: () => <Penalties /> },
  ];

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
                    setShowing(item.onSelec());
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
          closeOnEscape={true}
          closeModal={() => setShowing(null)}
        />
      }
    </div>
  );
};