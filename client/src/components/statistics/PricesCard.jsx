import { useState } from 'react';
import Modal from '../Modals/Modal';
import { currency } from '../../helpers/Functions';
import { useAvgPrices } from '../../hooks/Prices/useAvgPrices';
import { useSelector } from 'react-redux';

export default function PricesCard() {

  const { company } = useSelector(state => state.user);
  const { data: items } = useAvgPrices({ companyId: company._id });
  const [open, setOpen] = useState(false);

  const top = (items || []).slice(0, 6);

  console.log(items, top)

  if (top.length === 0) return null;

  return (
    <div className="relative w-80 min-h-64 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center border border-gray-200 cursor-pointer group"
      onClick={() => setOpen(true)}
      title="Precios promedio por producto"
    >
      <div className="flex flex-col items-center justify-center h-full w-full p-3">
        <span className="text-lg font-bold text-gray-800 mb-2">Precios promedio</span>
        <div className="flex flex-col gap-2 w-full px-2">
          {top.length === 0 && <span className="text-gray-400 text-center">Sin datos</span>}
          {top.map(p => (
            <div key={p.productId} className="flex items-center justify-between w-full gap-2">
              <span className="font-semibold text-gray-700 truncate max-w-[120px]">{p.productName}</span>
              <span className="font-mono text-xs text-gray-600">{p.branchesCount} suc.</span>
              <span className="font-mono text-xs text-blue-700">{currency(p.avgPrice || 0)}</span>
            </div>
          ))}
          {items.length > 6 && <span className="text-xs text-gray-400">y {items?.length - 6} más...</span>}
        </div>
        <span className="text-base font-semibold text-gray-500 mt-3">Click para ver detalle</span>
      </div>
      {open && (
        <Modal
          content={
            <div className="flex flex-col gap-3 p-4 min-w-[320px] max-w-[96vw]">
              <h3 className="text-xl font-bold text-gray-700 text-center">Precios promedio por producto</h3>
              <div className="grid grid-cols-3 gap-2 px-4 text-xs text-gray-500 font-semibold">
                <span>Producto</span>
                <span className="text-center">Sucursales</span>
                <span className="text-right">Promedio</span>
              </div>
              {(items || []).map(p => (
                <div key={p.productId} className="grid grid-cols-3 gap-2 items-center bg-gray-50 rounded-lg shadow-sm border border-gray-200 px-4 py-2">
                  <span className="truncate font-semibold text-gray-700" title={p.productName}>{p.productName}</span>
                  <span className="text-center font-mono text-xs text-gray-600">{p.branchesCount}</span>
                  <span className="text-right font-mono text-sm text-blue-700">{currency(p.avgPrice || 0)}</span>
                </div>
              ))}
            </div>
          }
          closeModal={() => setOpen(false)}
          ableToClose={true}
          closeOnEsc={true}
          closeOnClickOutside={true}
          width="auto"
          fit={true}
          shape="rounded-2xl"
        />
      )}
    </div>
  );
}
