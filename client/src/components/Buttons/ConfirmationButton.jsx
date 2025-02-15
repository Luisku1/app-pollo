/* eslint-disable react/prop-types */
import { useState } from 'react'
import { GiConfirmed } from "react-icons/gi";
import { ImCancelCircle } from "react-icons/im";

export default function ConfirmationButton({ onConfirm, children, confirmationMessage = "¿Estás seguro de que deseas realizar esta acción?", className }) {
  const [confirmationIsOpen, setConfirmationIsOpen] = useState(false);

  const toggleConfirmation = () => {
    setConfirmationIsOpen((prev) => !prev);
  };

  return (
    <div className={`w-full flex justify-center`}>
      <button onClick={toggleConfirmation} className={`w-full h-full ${className} border shadow-lg rounded-lg text-center m-3`}>
        {children}
      </button>
      {confirmationIsOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
          <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5 w-11/12 max-w-md'>
            <p>{confirmationMessage}</p>
            <div className='flex gap-4 w-full'>
              <button
                onClick={toggleConfirmation}
                className='bg-gray-500 text-white px-4 py-2 rounded-lg w-full'
              >
                <div className='flex gap-2 items-center justify-center'>
                  <span><ImCancelCircle /></span>
                  Cancelar
                </div>
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  toggleConfirmation();
                }}
                className='bg-red-500 text-white px-4 py-2 rounded-lg w-full'
              >
                <div className='flex gap-2 items-center justify-center'>
                  <span><GiConfirmed /></span>
                  Confirmar
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}