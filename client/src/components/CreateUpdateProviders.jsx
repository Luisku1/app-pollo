import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Modal from "./Modals/Modal";

export default function CreateUpdateProviders() {
  const { currentUser, company } = useSelector((state) => state.user);
  const [providers, setProviders] = useState([]);
  const [products, setProducts] = useState([]);
  const [select, setSelect] = useState(false);
  const [registerProvider, setRegisterProvider] = useState(false);
  const [registerProduct, setRegisterProduct] = useState(false);
  const [register, setRegister] = useState(true);
  const [check, setCheck] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    isReturn: false,
    specialPrice: false,
    comment: "sin comentarios",
  });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        company: company._id,
        employee: currentUser._id,
      };

      await handleNewMovements(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleNewMovements = async (movements) => {
    const form = document.getElementById("form");

    try {
      setLoading(true);

      const res = await fetch("api/provider/create-movement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(movements),
      });

      const data = await res.json();

      if (data.success === false) {
        setError(data.message);
        setLoading(false);
        return;
      }

      form.reset();
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.id]: e.target.type=="number"? parseFloat(e.target.value) : e.target.value
    });

    providers.map((elemProvider) => {
      if (e.target.value == elemProvider._id && e.target.value != "") {
        setFormData({
          ...formData,
          [e.target.id]: elemProvider
        });
        setRegisterProvider(true)
      }        
    });

    products.map((elemProduct) => {
      if (e.target.value == elemProduct._id && e.target.value != "") {
        setFormData({
          ...formData,
          [e.target.id]: elemProduct
        });
        setRegisterProduct(true)
      }
    });
  };

  useEffect(()=>{
    if (registerProduct && registerProduct){
      setRegister(false)
    }
  },[registerProvider, registerProduct])

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
        setError(error.message);
      }
    };

    fetchProviders();
    fetchProducts();
  }, [company._id]);

  console.log(formData);
  return (
    <form
      onSubmit={handleSubmit}
      id="form"
      className="flex flex-col gap-4 text-base"
    >
      {error && (
        <Modal
          content={<p>{error}</p>}
          closeModal={() => setError(null)}
          closeOnClickOutside={true}
          closeOnEsc={true}
        />
      )}
      <div className="flex flex-col space-y-4">
        <div className="grid grid-cols-1 gap-2">
          <div className="relative">
            <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
              Tipo de Transacción
            </label>
            <select
              id="isReturn"
              className="w-full border border-black p-3 rounded-lg"
              onChange={()=>{setSelect((prev)=> !prev), setFormData({ ...formData, isReturn: !select })}}
            >
              {["Compra", "Devolución"].map((option) => (
                <option key={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <div className="relative">
            <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
              Proveedor
            </label>
            <select
              id="provider"
              onClick={handleChange}
              className="w-full border border-black p-3 rounded-lg"
            >
              <option value="" >Selecione un proveedor</option>
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
            <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
              Producto
            </label>
            <select
              id="product"
              onClick={handleChange}
              className="w-full border border-black p-3 rounded-lg"
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
              <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
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
              <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
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
              <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
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
            <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
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
            onClick={()=>{setCheck((prev) => !prev), setFormData({...formData, specialPrice: !check})}}
          />
          <label className="text-black font-bold w-full">PRECIO ESPECIAL</label>
        </div>
        <button
          disabled={loading || register}
          className={
            "bg-" +
            (select? "red" : "blue") +
            "-500 text-white p-3 rounded-lg col-span-3 mt-4"
          }
        >
          <b>REGISTRAR {select? "DEVOLUCIÓN" : "COMPRA"}</b>
        </button>
      </div>
    </form>
  );
}
