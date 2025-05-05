import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Modal from "./Modals/Modal";
import { useProvidersMovements } from "../hooks/Providers/useProvidersMovements";
import HistoryMovementsProvideres from "./Proveedores/HistoryMovementsProviders";

export default function CreateMovementsProviders(dateDay) {
  const { currentUser, company } = useSelector((state) => state.user);
  const [providers, setProviders] = useState([]);
  const [products, setProducts] = useState([]);
  const [select, setSelect] = useState(false);
  const [registerProvider, setRegisterProvider] = useState(false);
  const [registerProduct, setRegisterProduct] = useState(false);
  const [register, setRegister] = useState(true);
  const [check, setCheck] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    isReturn: false,
    specialPrice: false,
    comment: "",
  });
  const {
    selectedMovement,
    totalWeight,
    state: stateMovements,
    loading: loadingMovements,
    error: errorMovements,
    newMovement,
    onDeleteMovement,
  } = useProvidersMovements({
    companyId: company._id,
    date: dateDay,
    typeMovement: select,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    setSelect(false);
    setRegisterProvider(false);
    setRegisterProduct(false);
    setRegister(true);
    setCheck(false);
    setShowModal(false);
    setFormData({ isReturn: false, specialPrice: false, comment: "" });
  }, [stateMovements]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        company: company,
        employee: currentUser,
      };
      await newMovement(data);
      console.log(loadingMovements);
      setLoading(loadingMovements);
    } catch (error) {
      setLoading(loadingMovements);
      setError(errorMovements);
      console.error(error);
    }
  };
  console.log(formData);
  const changeShowModal = () => {
    setShowModal((prev) => !prev);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]:
        e.target.type == "number" ? parseFloat(e.target.value) : e.target.value,
    });

    providers.map((elemProvider) => {
      if (e.target.value == elemProvider._id && e.target.value != "") {
        setFormData({
          ...formData,
          [e.target.id]: elemProvider,
        });
        setRegisterProvider(true);
      }
    });

    products.map((elemProduct) => {
      if (e.target.value == elemProduct._id && e.target.value != "") {
        setFormData({
          ...formData,
          [e.target.id]: elemProduct,
        });
        setRegisterProduct(true);
      }
    });
  };
  useEffect(() => {
    if (registerProduct && registerProduct) {
      setRegister(false);
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
    <main>
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
          <div className="grid grid-col-1 gap-2">
            <div className="relative">
              <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform border border-header rounded-lg bg-white text-black text-sm font-semibold border border-header rounded-lg">
                Tipo de Transacción
              </label>
              <select
                id="isReturn"
                className="border border-black p-3 rounded-lg w-full"
                onChange={() => {
                  setSelect((prev) => !prev),
                    setFormData({ ...formData, isReturn: !select });
                }}
              >
                {["Compra", "Devolución"].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div className="relative">
              <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform border border-header rounded-lg bg-white text-black text-sm font-semibold border border-header rounded-lg">
                Proveedor
              </label>
              <select
                id="provider"
                onClick={handleChange}
                className="w-full border border-black p-3 rounded-lg"
              >
                <option value="">Selecione un proveedor</option>
                {providers.map((provider) => (
                  <option key={provider.name} value={provider._id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div className="relative">
              <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform border border-header rounded-lg bg-white text-black text-sm font-semibold border border-header rounded-lg">
                Producto
              </label>
              <select
                id="product"
                onClick={handleChange}
                className="w-full border border-black p-3 rounded-lg "
              >
                <option value="">Selecione un producto</option>
                {products.map((product) => (
                  <option key={product.name} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <div className="relative">
                <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform border border-header rounded-lg bg-white text-black text-sm font-semibold border border-header rounded-lg">
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
            </div>
            <div>
              <div className="relative">
                <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform border border-header rounded-lg bg-white text-black text-sm font-semibold">
                  Precio
                </label>
                <input
                  type="number"
                  id="price"
                  placeholder="$0.00"
                  onChange={handleChange}
                  className="w-full border border-black p-3 rounded-lg"
                  required
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform border border-header rounded-lg bg-white text-black text-sm font-semibold">
                  Monto
                </label>
                <input
                  type="number"
                  id="amount"
                  placeholder="$0.00"
                  onChange={handleChange}
                  className="w-full border border-black p-3 rounded-lg"
                  required
                />
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
          <div className="flex items-center gap-4 mt-4 w-full">
            <input
              type="checkbox"
              id="specialPrice"
              className="w-6 h-6 accent-blue-600"
              onClick={() => {
                setCheck((prev) => !prev),
                  setFormData({ ...formData, specialPrice: !check });
              }}
            />
            <label className="text-black font-bold w-full">
              PRECIO ESPECIAL
            </label>
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
      <div className="mb-3 mt-5">
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
      <form>
        <div className="grid grid-cols-1 mt-3">
          <div className="flex flex-col-2">
            <div className="relative w-3/4">
              <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform border border-header rounded-lg bg-white text-black text-sm font-semibold">
                Proveedor
              </label>
              <select
                id="provider"
                onClick={handleChange}
                className="w-full border border-black p-3 rounded-lg h-full"
              >
                <option value="">Selecione un proveedor</option>
                {providers.map((provider) => (
                  <option key={provider.name} value={provider._id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative w-1/4 ml-1">
              <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform border border-header rounded-lg bg-white text-black text-sm font-semibold">
                Pago
              </label>
              <input
                type="number"
                id="price"
                placeholder="$0.00"
                onChange={handleChange}
                className="w-full border border-black p-3 rounded-lg h-full"
                required
              />
            </div>
          </div>
          <button
            disabled={loading || register}
            className={"bg-green-500 text-white p-3 rounded-lg col-span-3 mt-4"}
          >
            <b>REGISTRAR PAGO</b>
          </button>
        </div>
      </form>
    </main>
  );
}
