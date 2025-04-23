import { useState } from "react";
import SectionHeader from "../components/SectionHeader";

const MenuProveedor = ({ date, onAddPurchase }) => {
  const [formData, setFormData] = useState({
    weight: "",
    price: "",
    amount: "",
    pieces: "",
    comment: "",
    specialPrice: false,
    product: "",
    company: "",
    supervisor: "",
    provider: "",
    isReturn: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddPurchase(formData);
    console.log(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-4 justify-self-center mr-12"
    >
      <div className="border rounded-md bg-inputs p-3 mt-4">
        <div className="flex flex-col space-y-4">
          <SectionHeader />
          <h2 className="relative">
            <b>
              {formData.isReturn ? "Registrar Devolución" : "Registrar Compra"}
            </b>
          </h2>
          <div className="grid grid-cols-1 gap-2">
            <div className="relative">
              <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
                Tipo de Transacción
              </label>
              <select
                name="isReturn"
                value={formData.isReturn}
                onChange={handleChange}
                className="w-full border border-black p-3 rounded-lg"
              >
                <option value={false}>Compra</option>
                <option value={true}>Devolución</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div className="relative">
              <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
                Proveedor
              </label>
              <input
                type="text"
                name="provider"
                placeholder="Nombre del proveedor"
                value={formData.provider}
                onChange={handleChange}
                className="w-full border border-black p-3 rounded-lg"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div className="relative">
              <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
                Producto
              </label>
              <input
                type="text"
                name="product"
                placeholder="Nombre del producto"
                value={formData.product}
                onChange={handleChange}
                className="w-full border border-black p-3 rounded-lg"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div >
              <div className="relative">
                <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
                  Peso
                </label>
                <input
                  type="number"
                  name="weight"
                  placeholder="0.00"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full border border-black p-3 rounded-lg"
                  required
                />
              </div>
            </div>
            <div >
              <div className="relative">
                <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
                  Precio
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  placeholder="0.00"
                  onChange={handleChange}
                  className="w-full border border-black p-3 rounded-lg"
                  required
                />
              </div>
            </div>
            <div >
              <div className="relative">
                <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
                  Monto
                </label>
                <input
                  type="number"
                  name="amount"
                  placeholder="0.00"
                  value={formData.amount}
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
                Número de Teléfono
              </label>
              <input
                type="number"
                name="pieces"
                placeholder="1.000.000.00.00"
                value={formData.pieces}
                onChange={handleChange}
                className="w-full border border-black p-3 rounded-lg"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div className="relative">
              <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
                Comentario
              </label>
              <textarea
                name="comment"
                placeholder="Descripción del producto"
                value={formData.comment}
                onChange={handleChange}
                className="w-full border border-black p-3 rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="relative">
              <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
                Precio Especial
              </label>
              <input
                type="checkbox"
                name="specialPrice"
                checked={formData.specialPrice}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div className="relative">
              <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
                Compañía
              </label>
              <input
                type="text"
                name="company"
                placeholder="Nombre de la compañía"
                value={formData.company}
                onChange={handleChange}
                className="w-full border border-black p-3 rounded-lg"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div className="relative">
              <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
                Supervisor
              </label>
              <input
                type="text"
                name="supervisor"
                placeholder="Nombre del supervisor"
                value={formData.supervisor}
                onChange={handleChange}
                className="w-full border border-black p-3 rounded-lg"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white p-3 rounded-lg col-span-3 mt-4"
          >
            {formData.isReturn ? "Registrar Devolución" : "Registrar Compra"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default MenuProveedor;