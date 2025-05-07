import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Modal from "./Modals/Modal";
import ProvidersSelect from "./Select/ProvidersSelect";
import ProductsSelect from "./Select/ProductsSelect";
import { useProvidersMovements } from "../hooks/Providers/useProvidersMovements";
import HistoryMovementsProvideres from "./Proveedores/HistoryMovementsProviders";
import CreatePaymentsProviders from "./CreatePaymentsProviders";
import { useDate } from "../context/DateContext";
import { isToday } from "../helpers/DatePickerFunctions";

export default function CreateMovementsProviders() {
  const { currentDate } = useDate();
  const { currentUser, company } = useSelector((state) => state.user);
  const [providers, setProviders] = useState([]);
  const [products, setProducts] = useState([]);
  const [select, setSelect] = useState(false);
  const [registerProvider, setRegisterProvider] = useState(null);
  const [registerProduct, setRegisterProduct] = useState(null);
  const [register, setRegister] = useState(true);
  const [check, setCheck] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    isReturn: false,
    specialPrice: false,
    comment: "",
    prices: 0,
    amount: 0,
    pieces: 0
  });
  const {
    selectedMovement,
    totalWeight,
    loading: loadingMovements,
    error: errorMovements,
    newMovement,
    onDeleteMovement,
  } = useProvidersMovements({
    companyId: company._id,
    date: currentDate,
    typeMovement: select,
  });
  const [error, setError] = useState(null);

  const resetForm = () => {
    setSelect(false);
    setRegisterProvider(null);
    setRegisterProduct(null);
    setRegister(true);
    setCheck(false);
    setShowModal(false);
    setFormData({
      isReturn: false,
      specialPrice: false,
      comment: "",
      prices: 0,
      amount: 0,
      pieces: 0
    });
  };

  const handleSubmit = async (e) => {
    const form = document.getElementById("form-movement");
    e.preventDefault();
    setLoading(true);
    try {
      const movementDate = isToday(currentDate)
        ? new Date()
        : new Date(currentDate);
      const data = {
        ...formData,
        company: company,
        createdAt: movementDate,
        employee: currentUser,
      };
      resetForm();
      await newMovement(data);
      setError(null);
      setLoading(loadingMovements);
      form.reset();
    } catch (error) {
      setLoading(loadingMovements);
      setError(errorMovements);
      console.error(error);
    }
  };
  const changeShowModal = () => {
    setShowModal((prev) => !prev);
  };

  const handleSelectProvider = (provider) => {
    setRegisterProvider(provider);
  };

  const handleSelectProduct = (product) => {
    setRegisterProduct(product);
  };

  const handleChange = (e) => {
    switch (e.target.id) {
      case "weight":
        setFormData({
          ...formData,
          [e.target.id]: parseFloat(e.target.value),
        });
        break;
      case "prices" || "specialPrice":
        if (check) {
          setFormData({
            ...formData,
            [e.target.id]: parseFloat(e.target.value),
            amount: parseFloat(formData.pieces) * parseFloat(e.target.value),
          });
        }
        break;
      case "pieces":
        setFormData({
          ...formData,
          [e.target.id]: parseFloat(e.target.value),
          amount: parseFloat(formData.prices) * parseFloat(e.target.value),
        });
        break;
      default:
        setFormData({
          ...formData,
          [e.target.id]: e.target.value,
        });
        break;
    }
  };

  useEffect(() => {
    if (registerProvider != null && registerProduct != null) {
      setRegister(false);
      setFormData({
        ...formData,
        provider: registerProvider,
        product: registerProduct,
      });
    }
  }, [registerProvider, registerProduct]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await fetch("/api/provider/get-providers/" + company._id);
        const data = await res.json();

        if (data.success === false) {
          setError(data.message);
          return;
        }

        setProviders(data.providers);
        setError(null);
      } catch (error) {
        setLoading((prevLoading) => !prevLoading);
        setError(error.message);
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/product/get-products/" + company._id);
        const data = await res.json();

        if (data.success === false) {
          setError(data.message);
          return;
        }

        setProducts(data.products);
        setError(null);
      } catch (error) {
        setLoading((prevLoading) => !prevLoading);
        setError(error.message);
      }
    };

    fetchProviders();
    fetchProducts();
  }, [company._id]);


  return (
    <main className="space-y-3">
      <div className="p-5 border border-black rounded-lg bg-white">
        <div className="mb-3 mt-3">
          <button
            title={`${select ? "Devoluciones" : "Compras"} del Día`}
            className="flex flex-cols-2 bg-white text text-black font-bold p-2 border border-header rounded-lg w-full"
            onClick={changeShowModal}
          >
            <div className="w-3/4  ml-12">{`${
              select ? "Devoluciones" : "Compras"
            } del Día:`}</div>
            <div className="w-1/4 font-bold border border-header rounded-lg ">
              {(totalWeight ? totalWeight.toFixed(2) : "0.00") + " Kg"}
            </div>
          </button>
        </div>
        {showModal && (
          <Modal
            title={`${select ? "Devoluciones" : "Compras"} del Día`}
            content={
              <HistoryMovementsProvideres
                movements={selectedMovement}
                onDelete={onDeleteMovement}
              />
            }
            closeModal={changeShowModal}
            closeOnClickOutside={true}
            closeOnEsc={true}
          ></Modal>
        )}
        <div className="grid grid-cols-2 relative mb-4 mt-3 border border-black rounded-lg">
          <button
            disabled={!select}
            className={
              (!select
                ? "bg-blue-700 opacity-75 text-white "
                : "bg-white text-black ") + "w-full h-full p-1 rounded-lg"
            }
            onClick={() => {
              setSelect(false), setFormData({ ...formData, isReturn: !select });
            }}
          >
            Compra
          </button>
          <button
            disabled={select}
            className={
              (select
                ? "bg-red-700 opacity-75 text-white "
                : "bg-white text-black ") + "w-full h-full p-1 rounded-lg"
            }
            onClick={() => {
              setSelect(true), setFormData({ ...formData, isReturn: !select });
            }}
          >
            Devolucion
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          id="form-movement"
          className="flex flex-cols-3 gap-4 text-base"
        >
          {error && (
            <Modal
              content={<p>{error}</p>}
              closeModal={() => setError(null)}
              closeOnClickOutside={true}
              closeOnEsc={true}
            />
          )}
          <div className="flex flex-col space-y-3">
            <div className="grid grid-cols-1 gap-2">
              <div className="relative">
                <ProvidersSelect
                  options={providers}
                  defaultLabel={"Proveedores"}
                  selectedOption={registerProvider}
                  handleSelectChange={handleSelectProvider}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="relative">
                <ProductsSelect
                  options={products}
                  defaultLabel={"Productos"}
                  selectedOption={registerProduct}
                  handleSelectChange={handleSelectProduct}
                />
              </div>
            </div>
            <div className="flex flex-col-2 ">
              <div className="bg-white w-3/4 h-full relative">
                <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform border border-header rounded-lg bg-white text-black text-sm font-semibold">
                  Precio
                </label>
                <input
                  type="number"
                  id="prices"
                  disabled={!check}
                  value={formData.prices == 0 ? 0 : formData.prices}
                  placeholder="$0.00"
                  onChange={handleChange}
                  className="border border-black p-3 rounded-lg w-full"
                  required
                />
              </div>
              <div className="flex flex-cols-2 relative w-1/4 h-full ml-1">
                <div className="flex items-center w-1/2 h-full">
                  <input
                    type="checkbox"
                    id="specialPrice"
                    className="accent-blue-800 w-8 h-8"
                    onClick={() => {
                      setCheck((prev) => !prev),
                        setFormData({ ...formData, specialPrice: !check });
                    }}
                  />
                </div>
                <div className="flex items-center w-full text-sm font-semibold text-black">
                  CAMBIO DE PRECIO
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="relative">
                <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform border border-header rounded-lg bg-white text-black text-sm font-semibold">
                  Piezas
                </label>
                <input
                  type="number"
                  id="pieces"
                  placeholder="0.00 Pzs"
                  onChange={handleChange}
                  className="w-full border border-black p-3 rounded-lg"
                  required
                />
              </div>
              <div className="relative">
                <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform border border-header rounded-lg bg-white text-black text-sm font-semibold">
                  Peso
                </label>
                <input
                  type="number"
                  id="weight"
                  placeholder="0.00 Kg"
                  onChange={handleChange}
                  className="w-full border border-black p-3 rounded-lg"
                  required
                />
              </div>
              <div className="relative">
                <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform border border-header rounded-lg bg-white text-black text-sm font-semibold">
                  Monto Total
                </label>
                <div className="w-full border border-black p-3 rounded-lg">
                  {formData.pieces * formData.prices >= 0
                    ? "$" + formData.pieces * formData.prices
                    : "-$" + -1 * (formData.pieces * formData.prices)}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="relative">
                <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform border border-header rounded-lg bg-white text-black text-sm font-semibold">
                  Comentario
                </label>
                <textarea
                  id="comment"
                  type="textarea"
                  placeholder="Descripción del Registro"
                  onChange={handleChange}
                  className="w-full border border-black p-3 rounded-lg"
                />
              </div>
            </div>
            <button
              disabled={loading || register}
              className={
                "bg-" +
                (select ? "red" : "blue") +
                "-500 text-white p-3 rounded-lg col-span-3 mt-4"
              }
            >
              <b>REGISTRAR {select ? "DEVOLUCIÓN" : "COMPRA"}</b>
            </button>
          </div>
        </form>
      </div>
      <div className="p-5 border border-black rounded-lg bg-white">
        <CreatePaymentsProviders providers={providers} />
      </div>
    </main>
  );
}
