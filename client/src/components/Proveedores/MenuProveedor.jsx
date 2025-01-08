/* eslint-disable react/prop-types */
import { useState } from 'react'

const MenuProveedor = ({date, onAddPurchase}) => {
  const [formData, setFormData] = useState({
    weight: '',
    price: '',
    amount: '',
    pieces: '',
    comment: '',
    specialPrice: false,
    product: '',
    company: '',
    supervisor: '',
    provider: '',
    isReturn: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddPurchase(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">{formData.isReturn ? 'Registrar Devolución' : 'Registrar Compra'}</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700">Peso</label>
        <input
          type="number"
          name="weight"
          value={formData.weight}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Precio</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Monto</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Piezas</label>
        <input
          type="number"
          name="pieces"
          value={formData.pieces}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Comentario</label>
        <textarea
          name="comment"
          value={formData.comment}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Precio Especial</label>
        <input
          type="checkbox"
          name="specialPrice"
          checked={formData.specialPrice}
          onChange={handleChange}
          className="mt-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Producto</label>
        <input
          type="text"
          name="product"
          value={formData.product}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Compañía</label>
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Supervisor</label>
        <input
          type="text"
          name="supervisor"
          value={formData.supervisor}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Proveedor</label>
        <input
          type="text"
          name="provider"
          value={formData.provider}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Tipo de Transacción</label>
        <select
          name="isReturn"
          value={formData.isReturn}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
        >
          <option value={false}>Compra</option>
          <option value={true}>Devolución</option>
        </select>
      </div>
      <button
        type="submit"
        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
      >
        {formData.isReturn ? 'Registrar Devolución' : 'Registrar Compra'}
      </button>
    </form>
  );
};

export default MenuProveedor;