import { IoIosAddCircle } from "react-icons/io";
import { useState } from "react";
import Incomes from "./Incomes/Incomes";
import Modal from "./Modals/Modal";

export const RegistersMenu = () => {
  const [showing, setShowing] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const menu = [
    { title: "Dinero", onSelec: () => { return <Incomes /> } },
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
        className="fixed bottom-4 right-4 bg-header text-white p-3 rounded-full shadow-lg hover:bg-black transition duration-300 ease-in-out z-50"
      >
        <IoIosAddCircle className="text-3xl" />
      </button>

      {isOpen && (
        <div className="fixed bottom-16 right-4 bg-white shadow-lg rounded-lg p-4 z-50">
          <h2 className="text-lg font-bold mb-2">Menu</h2>
          <ul className="space-y-2">
            {menu.map((item, index) => (
              <li key={index} className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setShowing(item.onSelec);
                    toggleMenu();
                  }}
                  className="text-black hover:underline text-center w-full"
                >
                  <p className="text-center ">{item.title}</p>
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
          closeOnClickOutside={true}
          closeModal={() => setShowing(null)}
        />
      }
    </div>
  );
};