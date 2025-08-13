import { useState } from "react";
import Modal from "./Modals/Modal";
import { FaMapMarkerAlt, FaEdit, FaPhoneAlt, FaUser } from "react-icons/fa";
import { currency } from "../helpers/Functions";
import RegistroCliente from "../pages/RegistroCliente";

export default function CustomerInfo({ customer, toggleInfo, isShown, handleCustomerUpdate }) {
  const [editing, setEditing] = useState(false);

  if (!customer) return null;

  const handleEdit = () => setEditing(true);
  const handleCloseEdit = () => setEditing(false);

  const customerCard = () => (
    <div className="p-4 rounded-2xl bg-white shadow-lg max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <FaUser className="text-2xl text-green-700" />
        <h2 className="text-2xl font-bold text-green-800 flex-1">{customer.name} {customer.lastName}</h2>
        <button onClick={handleEdit} className="hover:bg-green-100 p-2 rounded-full" title="Editar cliente">
          <FaEdit className="text-green-500" />
        </button>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <FaMapMarkerAlt className="text-red-500" />
        <span className="text-blue-600 break-all">{customer.address || 'Sin dirección'}</span>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <FaPhoneAlt className="text-green-600" />
        <span className="text-gray-700">{customer.phoneNumber || 'Sin teléfono'}</span>
      </div>
      <div className="mb-2">
        <span className="font-semibold">Saldo:</span> <span>{currency(customer?.balance ?? 0) ?? 'N/A'}</span>
      </div>
      <div className="mb-2">
        <span className="font-semibold">Empresa:</span> <span>{customer.company?.name || customer.company || 'N/A'}</span>
      </div>
      <div className="mb-2">
        <span className="font-semibold">Activa:</span> <span className={customer.active ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{customer.active ? 'Sí' : 'No'}</span>
      </div>
    </div>
  );

  // Reutiliza RegistroCliente como modal de edición
  // Se asume que RegistroCliente acepta props: customer, onClose, onUpdate, isEdit

  return (
    <div>
      <Modal
        closeModal={toggleInfo}
        closeOnClickOutside={true}
        closeOnClickInside={false}
        closeOnEsc={true}
        width="4/6"
        shape="rounded-3xl"
        isShown={isShown}
        content={customerCard()}
      />
      {editing && (
        <Modal
          closeModal={handleCloseEdit}
          closeOnClickOutside={true}
          closeOnClickInside={false}
          closeOnEsc={true}
          shape="rounded-3xl"
          isShown={editing}
          content={
            <RegistroCliente
              customer={customer}
              isEdit={true}
              onClose={handleCloseEdit}
              onUpdate={handleCustomerUpdate}
            />
          }
        />
      )}
    </div>
  );
}
