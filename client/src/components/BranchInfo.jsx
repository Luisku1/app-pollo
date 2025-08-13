
import { useState } from "react";
import Modal from "./Modals/Modal";
import { FaMapMarkerAlt, FaEdit, FaPhoneAlt, FaStore } from "react-icons/fa";
import RegistroSucursal from "../pages/RegistroSucursal";
import { currency } from "../helpers/Functions";

export default function BranchInfo({ branch, toggleInfo, isShown, handleBranchUpdate }) {
  const [editing, setEditing] = useState(false);

  if (!branch) return null;

  const handleEdit = () => setEditing(true);
  const handleCloseEdit = () => setEditing(false);


  const branchCard = () => (
    <div className="p-4 rounded-2xl bg-white shadow-lg max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <FaStore className="text-2xl text-blue-700" />
        <h2 className="text-2xl font-bold text-blue-800 flex-1">{branch.branch}</h2>
        <button onClick={handleEdit} className="hover:bg-blue-100 p-2 rounded-full" title="Editar sucursal">
          <FaEdit className="text-blue-500" />
        </button>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <FaMapMarkerAlt className="text-red-500" />
        <a href={branch.location} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
          {branch.location}
        </a>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <FaPhoneAlt className="text-green-600" />
        <span className="text-gray-700">{branch.phoneNumber || 'Sin teléfono'}</span>
      </div>
      <div className="mb-2">
        <span className="font-semibold">Renta:</span> <span>{currency(branch?.rentAmount ?? 0) ?? 'N/A'} / mes {branch.rentDay ? `(Día ${branch.rentDay})` : ''}</span>
      </div>
      {branch.company.name &&
        <div className="mb-2">
          <span className="font-semibold">Empresa:</span> <span>{branch.company?.name}</span>
        </div>
      }
      <div className="mb-2">
        <span className="font-semibold">Posición:</span> <span>{branch.position ?? 'N/A'}</span>
      </div>
      <div className="mb-2">
        <span className="font-semibold">Activa:</span> <span className={branch.active ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{branch.active ? 'Sí' : 'No'}</span>
      </div>
    </div>
  );


  // Reutiliza RegistroSucursal como modal de edición
  // Se asume que RegistroSucursal acepta props: branch, onClose, onUpdate, isEdit

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
        content={branchCard()}
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
            <RegistroSucursal
              branch={branch}
              isEdit={true}
              onClose={handleCloseEdit}
              onUpdate={handleBranchUpdate}
            />
          }
        />
      )}
    </div>
  );
}
