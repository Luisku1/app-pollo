import { useState, useEffect } from "react";
import Modal from "../components/Modals/Modal";
import { useSelector } from "react-redux";
import CreateUpdateProviders from "../components/CreateUpdateProviders";

const ControlProveedores = () => {
  const modalStatus = false;
  const { company } = useSelector((state) => state.user);
  const [showModal, setShowModal] = useState();
  const [showRegister, setShowRegister] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [movements, setMovements] = useState([]);
  //const [purchases, setPurchases] = useState([]);
  //const [returns, setReturns] = useState([]);
  //const [registers, setRegisters] = useState([]);
  const [registerId, setRegisterId] = useState(null);
  const [error, setError] = useState(null);

  const handleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  useEffect(() => {
    setShowModal(modalStatus);
  }, [modalStatus]);

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const res = await fetch(
          "/api/provider/get-providers-movements/" + company._id
        );
        const data = await res.json();

        if (data.success === false) {
          setError(data.message);
          return;
        }
        console.log(data);
        setMovements(data);
        setError(null);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchMovements();
  }, [company._id]);

  const changeShowModal = () => {
    setShowModal((prev) => !prev);
  };

  const validationRegister = (btnId) => {
    movements.map((elem) => {
      if (btnId == elem._id) {
        return (
          <main key={elem._id}>
            <p>{elem.provider}</p>
          </main>
        );
      }
    });
  };

  return (
    <main className="p-3 max-w-lg mx-auto">
      <div>
        <div>
          <button
            onClick={changeShowModal}
            className="w-full bg-green-500 text-white p-3 rounded-lg col-span-3 mt-4"
          >
            <b>GENERAR REGISTRO</b>
          </button>
        </div>
        {error && (
          <Modal
            content={<p>{error}</p>}
            closeModal={() => setError(null)}
            closeOnClickOutside={true}
            closeOnEsc={true}
          />
        )}
        {showModal && (
          <Modal
            title={"Registro de Compra o Devolución"}
            content={<CreateUpdateProviders />}
            closeModal={changeShowModal}
            closeOnClickOutside={true}
            closeOnEsc={true}
          ></Modal>
        )}
      </div>
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
        {movements
          .filter((movement) => movement.isReturn == showRegister)
          .map((register) => (
            <div key={register._id}>
              <button
                className="grid grid-cols-3 w-full p-4 mt-4 mb-4 rounded-lg bg-white"
                onClick={() => {
                  setRegisterId(register._id), handleDetails();
                }}
              >
                <p className="h-full text-black font-bold text-center">
                  <b>{register.provider}</b>
                </p>
                <p className="h-full text-black font-bold text-center">
                  <b>{register.product}</b>
                </p>
                <p className="h-full text-black font-bold text-center">
                  <b>{register.createdAt}</b>
                </p>
              </button>
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
          ))}
      </div>
    </main>
  );
};

export default ControlProveedores;
