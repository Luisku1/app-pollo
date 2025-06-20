import { useState, useMemo } from 'react';
import Modal from '../Modals/Modal';
import { currency } from '../../helpers/Functions';

export default function ProductPriceComparisonCard({ purchasesArray = [], providerInputsArray = [] }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Obtiene todos los nombres de productos únicos de ambos arreglos
  const allProductNames = useMemo(() => {
    const names = new Set();
    purchasesArray.forEach(p => names.add(p.product?.name || 'Sin nombre'));
    providerInputsArray.forEach(i => names.add(i.product?.name || 'Sin nombre'));
    return Array.from(names);
  }, [purchasesArray, providerInputsArray]);

  // Calcula promedios y comparación orientado a rendimiento
  const comparisonData = useMemo(() => {
    return allProductNames.map(productName => {
      // Compras
      const purchases = purchasesArray.filter(p => (p.product?.name || 'Sin nombre') === productName);
      const totalPurchaseValue = purchases.reduce((acc, p) => acc + (p.price || 0) * (p.weight || 0), 0);
      const totalPurchaseWeight = purchases.reduce((acc, p) => acc + (p.weight || 0), 0);
      const totalPurchaseAmount = purchases.reduce((acc, p) => acc + (p.amount || 0), 0);
      const avgPurchasePrice = totalPurchaseWeight ? totalPurchaseValue / totalPurchaseWeight : null;
      // Repartos
      const inputs = providerInputsArray.filter(i => (i.product?.name || 'Sin nombre') === productName);
      const totalInputValue = inputs.reduce((acc, i) => acc + (i.price || 0) * (i.weight || 0), 0);
      const totalInputWeight = inputs.reduce((acc, i) => acc + (i.weight || 0), 0);
      const totalInputAmount = inputs.reduce((acc, i) => acc + (i.amount || 0), 0);
      const avgInputPrice = totalInputWeight ? totalInputValue / totalInputWeight : null;
      // Diferencia de montos (rendimiento)
      const diffAmount = totalInputAmount - totalPurchaseAmount;
      const diffWeight = totalInputWeight - totalPurchaseWeight;
      let percentAmount = null, percentWeight = null;
      if (totalPurchaseAmount > 0) percentAmount = (diffAmount / totalPurchaseAmount) * 100;
      if (totalPurchaseWeight > 0) percentWeight = (diffWeight / totalPurchaseWeight) * 100;
      return {
        productName,
        avgPurchasePrice,
        avgInputPrice,
        totalPurchaseAmount,
        totalInputAmount,
        totalPurchaseWeight,
        totalInputWeight,
        diffAmount,
        diffWeight,
        percentAmount,
        percentWeight,
        purchases,
        inputs
      };
    }).sort((a, b) => (b.totalInputAmount + b.totalPurchaseAmount) - (a.totalInputAmount + a.totalPurchaseAmount));
  }, [allProductNames, purchasesArray, providerInputsArray]);

  console.log(selectedProduct);

  return (
    <div className="relative w-80 min-h-64 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center border border-gray-200 cursor-pointer group"
      onClick={() => setShowModal(true)}
      title="Comparar precios promedio de compra y reparto por producto"
    >
      <div className="flex flex-col items-center justify-center h-full w-full">
        <span className="text-lg font-bold text-gray-800 mb-2">Comparativo Compra vs Reparto</span>
        <div className="flex flex-col gap-2 w-full px-2">
          {comparisonData.length === 0 && <span className="text-gray-400 text-center">Sin datos</span>}
          {comparisonData.slice(0, 4).map(prod => (
            <div key={prod.productName} className="flex items-center justify-between w-full gap-2">
              <span className="font-semibold text-gray-700 truncate max-w-[100px]">{prod.productName}</span>
              <span className="font-mono text-xs text-blue-700">{currency(prod.totalPurchaseAmount)}</span>
              <span className="font-mono text-xs text-green-700">{currency(prod.totalInputAmount)}</span>
            </div>
          ))}
          {comparisonData.length > 4 && <span className="text-xs text-gray-400">y {comparisonData.length - 4} más...</span>}
        </div>
        <span className="text-base font-semibold text-gray-500 mt-3">Click para ver detalle</span>
      </div>
      {showModal && (
        <Modal
          content={
            <div className="flex flex-col items-center justify-center gap-4 p-2 md:p-6 min-w-[320px] max-w-[98vw]">
              <h3 className="text-xl font-bold mb-2 text-gray-700 text-center">Comparativo por producto</h3>
              <div className="flex flex-col gap-4 w-full max-w-[600px] mx-auto">
                <div className="grid grid-cols-4 gap-2 px-4 text-xs text-gray-500 font-semibold">
                  <span className="truncate">Producto</span>
                  <span className="text-center">Compra($)</span>
                  <span className="text-center">Reparto($)</span>
                  <span className="text-center">Dif. $</span>
                </div>
                {comparisonData.map(prod => (
                  <div key={prod.productName} className="grid grid-cols-4 gap-2 items-center bg-gray-50 rounded-lg shadow-sm border border-gray-200 px-4 py-3 cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => setSelectedProduct(prod)}
                  >
                    <span className="truncate font-semibold text-gray-700" title={prod.productName}>{prod.productName}</span>
                    <span className="text-center font-mono text-xs text-blue-700">{currency(prod.totalPurchaseAmount)}</span>
                    <span className="text-center font-mono text-xs text-green-700">{currency(prod.totalInputAmount)}</span>
                    <span className={`text-center font-mono text-xs ${prod.diffAmount > 0 ? 'text-green-700' : prod.diffAmount < 0 ? 'text-red-600' : 'text-gray-500'}`}>{currency(prod.diffAmount)}</span>
                  </div>
                ))}
              </div>
              {/* Detalle en un modal anidado */}
              {selectedProduct && (
                <Modal
                  content={
                    <div className="w-auto mt-4 ml-4 overflow-y-auto">
                      <h4 className="text-lg font-bold text-gray-700 mb-2">Detalle: {selectedProduct.productName}</h4>
                      <div className="flex flex-col gap-2 mb-2">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">Precio promedio compra:</span>
                          <span className="font-mono text-blue-700">{selectedProduct.avgPurchasePrice !== null ? currency(selectedProduct.avgPurchasePrice) : '-'}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">Precio promedio reparto:</span>
                          <span className="font-mono text-green-700">{selectedProduct.avgInputPrice !== null ? currency(selectedProduct.avgInputPrice) : '-'}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">% ganancia por precio:</span>
                          <span className={`font-mono ${selectedProduct.avgPurchasePrice && selectedProduct.avgInputPrice ? (selectedProduct.avgInputPrice - selectedProduct.avgPurchasePrice) > 0 ? 'text-green-700' : 'text-red-600' : 'text-gray-400'}`}>{
                            selectedProduct.avgPurchasePrice && selectedProduct.avgInputPrice
                              ? `${(((selectedProduct.avgInputPrice - selectedProduct.avgPurchasePrice) / selectedProduct.avgPurchasePrice) * 100).toFixed(1)}%`
                              : '-'
                          }</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="text-xs text-gray-500 mb-1">Compras:</div>
                        {selectedProduct.purchases.length === 0 ? <span className="text-xs text-gray-400">Sin compras</span> :
                          selectedProduct.purchases.map((p, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs bg-white border-b border-gray-100 px-2 py-1">
                              <span className="text-gray-700">{currency(p.price)} x {p.weight}kg = {currency(p.amount)}</span>
                              <span className="text-gray-400">{p.date ? new Date(p.date).toLocaleDateString() : ''}</span>
                            </div>
                          ))}
                        <div className="text-xs text-gray-500 mt-2 mb-1">Repartos:</div>
                        {selectedProduct.inputs.length === 0 ? <span className="text-xs text-gray-400">Sin repartos</span> :
                          selectedProduct.inputs.map((i, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs bg-white border-b border-gray-100 px-2 py-1">
                              <span className="text-gray-700">{currency(i.price)} x {i.weight}kg = {currency(i.amount)}</span>
                              <span className="text-gray-400">{i.branchName || i.branch?.branch || ''}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  }
                  closeModal={() => setSelectedProduct(null)}
                  ableToClose={true}
                  closeOnEsc={true}
                  closeOnClickOutside={true}
                />
              )}
            </div>
          }
          closeModal={() => { setShowModal(false); setSelectedProduct(null); }}
          ableToClose={true}
          closeOnEsc={true}
          closeOnClickOutside={true}
          width="auto"
          fit={true}
        />
      )}
    </div>
  );
}
