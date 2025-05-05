import { useEffect, useState } from "react";
import { formatSimpleDate } from '../../helpers/DatePickerFunctions'
import HistoryMovementsProvideres from "./HistoryMovementsProviders";
import Modal from "../Modals/Modal";

export default function MovimientosProvedores ({allMovements, errors}) {
  const [showRegister, setShowRegister] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [movements, setMovements] = useState([]);
  const [error, setError] = useState(null);
  const [registerId, setRegisterId] = useState("");
  const isEmpty = movements.length === 0 || !movements; // undefined null 0

  const handleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  useEffect(() => {
    setMovements(allMovements);
    setError(errors);
  }, [allMovements, errors]);

  const validationRegister = (btnId) => {
    let valor = movements.filter((elemMovement)=> elemMovement._id == btnId)
   return <div><HistoryMovementsProvideres movements={valor}/></div>
  };

  return (
    <main className="p-3 max-w-lg mx-auto">
      {error && (
        <Modal
          content={<p>{error}</p>}
          closeModal={() => setError(null)}
          closeOnClickOutside={true}
          closeOnEsc={true}
        />
      )}
      <div className="bg-white rounded-lg">
        <div className="grid grid-cols-2 border w-full mt-4 mb-4 rounded-lg">
          <button
            disabled={!showRegister}
            className={
              "h-full rounded-lg rounded-r-none hover:shadow-xl p-3 border border-black text-white font-bold border-r-0 " +
              (!showRegister
                ? " bg-blue-600  opacity-85"
                : "bg-blue-600 text-white font-bold opacity-40")
            }
            onClick={() => {
              setShowRegister(false);
            }}
          >
            COMPRAS
          </button>
          <button
            disabled={showRegister}
            className={
              "h-full rounded-lg rounded-l-none hover:shadow-xl p-3 border border-black border-l-0 " +
              (showRegister
                ? "bg-red-700 text-white font-bold opacity-85"
                : "bg-red-700 font-bold border-opacity-85 opacity-40 text-white")
            }
            onClick={() => {
              setShowRegister(true);
            }}
          >
            DEVOLUCIONES
          </button>
        </div>
      </div>
      <div>
        {!isEmpty &&
          movements
            .filter((movement) => movement.isReturn == showRegister)
            .map((register) => (
              <div key={register._id}>
                <button
                  className="grid grid-cols-3 w-full p-4 mt-4 mb-4 rounded-lg bg-white"
                  onClick={() => {
                    setRegisterId(register._id);
                    handleDetails();
                  }}
                >
                  <p className="h-full text-black font-bold text-center">
                    <b>{register.provider.name}</b>
                  </p>
                  <p className="h-full text-black font-bold text-center">
                    <b>{register.product.name}</b>
                  </p>
                  <p className="h-full text-black font-bold text-center">
                    <b>
                      {formatSimpleDate(register.createdAt)}
                    </b>
                  </p>
                </button>
              </div>
            ))}
        {showDetails && (
          <Modal
            title={"Detalles"}
            content={validationRegister(registerId)}
            closeModal={handleDetails}
            closeOnClickOutside={true}
            closeOnEsc={true}
          ></Modal>
        )}
      </div>
    </main>
  );
}