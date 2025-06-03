/* eslint-disable react/prop-types */
import { useState } from 'react';
import { formatTime } from '../../helpers/DatePickerFunctions';
import RowItem from '../RowItem';
import { currency } from '../../helpers/Functions';
import ShowDetails from '../ShowDetails';

export default function PurchasesList({ purchases = [] }) {
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const fields = [
    { key: 'product.name', label: 'Producto', format: (data) => data.product?.name || '' },
    { key: 'provider.name', label: 'Proveedor', format: (data) => data.provider?.name || '' },
    { key: 'pieces', label: 'Piezas', format: (data) => `${data.pieces} pzs` },
    { key: 'weight', label: 'Peso', format: (data) => `${data.weight?.toFixed(2) || '0.00'} kg` },
    { key: 'amount', label: 'Monto', format: (data) => currency(data.amount) },
    { key: 'createdAt', label: 'Fecha', format: (data) => formatTime(data.createdAt) },
    { key: 'comment', label: 'Comentario', format: (data) => data.comment || 'Sin observaciones.' },
  ];

  const renderPurchaseItem = (purchase) => {
    const { product, provider, pieces, weight, amount, createdAt } = purchase;
    return (
      <div className="grid grid-cols-12 border border-black border-opacity-30 rounded-2xl shadow-sm mb-2 py-1" key={purchase._id}>
        <div className="col-span-10 items-center">
          <div className="grid grid-cols-12">
            <div className="col-span-12">
              <div className="w-full text-red-800 mb-1">
                <RowItem>
                  <p className="text-md font-bold flex gap-1 items-center">{product.name}</p>
                  <p className="text-md font-bold flex gap-1 items-center">{provider.name}</p>
                </RowItem>
              </div>
              <div className="w-full text-sm font-semibold">
                <RowItem>
                  <p className="">{`${pieces} pzs`}</p>
                  <p className="">{`${weight.toFixed(2)} kg`}</p>
                  <p className="">{currency(amount)}</p>
                </RowItem>
              </div>
              <div className="w-full mt-1">
                <RowItem>
                  <p className="text-sm text-black flex justify-self-end">{formatTime(createdAt)}</p>
                </RowItem>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-2 my-auto items-center">
          <button
            onClick={() => setSelectedPurchase(purchase)}
            className="border rounded-lg shadow-md w-10 h-10 flex justify-center items-center"
          >
            Detalles
          </button>
        </div>
      </div>
    );
  };

  const renderPurchasesList = () => {
    return (
      <div>
        {purchases && purchases.length > 0 && purchases.map((purchase) => renderPurchaseItem(purchase))}
      </div>
    );
  };

  return (
    <div>
      {renderPurchasesList()}
      {selectedPurchase && (
        <ShowDetails
          data={selectedPurchase}
          fields={fields}
          title={
            selectedPurchase.product?.name
              ? `Detalles de la compra de ${selectedPurchase.product.name}`
              : 'Detalles de la compra'
          }
          closeModal={() => setSelectedPurchase(null)}
        />
      )}
    </div>
  );
}