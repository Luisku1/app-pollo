import { IoIosAddCircle } from "react-icons/io";
import { useState } from "react";
import { Modal } from "./Modals/Modal";

export const RegistersMenu = () => {
  const [showing, setShowing] = useState(null);
  const menu = [
    { title: "Dinero", onSelec: () => { <Incomes/>} },
    { title: "Entradas", onSelec: () => { } },
    { title: "Salidas", onSelec: () => { } },
    { title: "Gastos", onSelec: () => { } },
    { title: "Pago a empleados", onSelec: () => { } }
  ]

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <button
        onClick={toggleMenu}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600"
      >
        <IoIosAddCircle className="text-3xl" />
      </button>

      {showing &&
        <Modal
          content={showing}
          ableToClose={true}
          closeOnClickOutside={true}
          closeModal={() => setShowing(null)}
        />
      }
    </div>
  );
};