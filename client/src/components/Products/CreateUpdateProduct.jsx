import { useEffect, useState } from "react";

export function CreateUpdateProduct({ onSubmit, product, loading = false }) {

  const [productFormData, setProductFormData] = useState({ byPieces: true, isSupply: false })

  useEffect(() => {
    if (product) {
      setProductFormData({
        name: product.name,
        price: product.price,
        byPieces: product.byPieces || false,
        isSupply: product.isSupply || false,
      });
    }
  }, [product]);

  const handleProductInputsChange = (e) => {
    setProductFormData({
      ...productFormData,
      [e.target.id]: e.target.value,
    })
  }

  const productButtonControl = () => {

    const nameInput = document.getElementById('name')
    const button = document.getElementById('product-button')

    if (nameInput.value == '') {

      button.disabled = true

    } else {

      button.disabled = false
    }
  }

  return (

    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{product ? "Actualizar Producto" : "Crear Producto"}</h2>
      <form id="productForm" onSubmit={onSubmit} className="bg-white shadow-md rounded-2xl border border-gray-200 flex flex-col gap-3 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            autoCapitalize="on"
            autoComplete="off"
            name="name"
            id="name"
            value={productFormData.name || ''}
            placeholder="Nombre del producto"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-lg"
            required
            onInput={productButtonControl}
            onChange={handleProductInputsChange}
          />
          {!product && !productFormData.isSupply && (
            <input
              type="number"
              autoComplete="off"
              name="price"
              id="price"
              value={productFormData.price || ''}
              placeholder="Precio inicial"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-lg"
              onChange={handleProductInputsChange}
              min="0"
              required
              step="0.01"
            />
          )}
        </div>
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="byPieces"
              name="byPieces"
              checked={!!productFormData.byPieces}
              onChange={e => setProductFormData(prev => ({ ...prev, byPieces: e.target.checked }))}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-400"
            />
            <label htmlFor="byPieces" className="text-sm text-gray-700 select-none cursor-pointer">
              {`${productFormData.byPieces === false ? 'Marca la casilla si el producto se vende por pieza' : 'Desmarca la casilla si el producto se vende por lote'}`}
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isSupply"
              name="isSupply"
              checked={!!productFormData.isSupply}
              onChange={e => setProductFormData(prev => ({ ...prev, isSupply: e.target.checked }))}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-400"
            />
            <label htmlFor="isSupply" className="text-sm text-gray-700 select-none cursor-pointer">
              {productFormData.isSupply
                ? 'Es insumo: no requiere precio por sucursal (clientes sí pueden tener precio)'
                : 'Marca si es insumo (sin precio por sucursal)'}
            </label>
          </div>
        </div>
        <button
          type="submit"
          id="product-button"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold rounded-xl p-3 uppercase tracking-wide shadow transition hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? product ? 'Actualizando...' : 'Agregando...' : product ? 'Actualizar' : 'Agregar'}
        </button>
      </form>
    </div>
  )
}