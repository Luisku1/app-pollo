import { useState, useEffect, useCallback } from "react";
import Modal from "./Modals/Modal";
import { FaMapMarkerAlt, FaEdit, FaPhoneAlt, FaStore } from "react-icons/fa";
import RegistroSucursal from "../pages/RegistroSucursal";
import { currency } from "../helpers/Functions";

export default function BranchInfo({ branch, toggleInfo, isShown, handleBranchUpdate }) {
  const [editing, setEditing] = useState(false);
  const [localBranch, setLocalBranch] = useState(branch);
  const [toggling, setToggling] = useState(false);
  const [toggleError, setToggleError] = useState(null);

  useEffect(() => {
    setLocalBranch(branch);
  }, [branch]);

  if (!localBranch) return null;

  const handleEdit = () => setEditing(true);
  const handleCloseEdit = () => setEditing(false);

  const handleToggleActive = useCallback(async () => {
    if (toggling) return;
    setToggleError(null);
    setToggling(true);
    const prev = localBranch.active;
    // Optimistic
    setLocalBranch(b => ({ ...b, active: !b.active }));
    try {
      const res = await fetch(`/api/branch/toggle-active/${localBranch._id}`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Error al actualizar');
      if (data?.branch) {
        setLocalBranch(data.branch);
        handleBranchUpdate?.(data.branch);
      }
    } catch (e) {
      setLocalBranch(b => ({ ...b, active: prev }));
      setToggleError(e.message);
    } finally {
      setToggling(false);
    }
  }, [localBranch?._id, localBranch?.active, toggling, handleBranchUpdate]);

  const branchCard = () => (
    <div className="p-4 rounded-2xl bg-white shadow-lg max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <FaStore className="text-2xl text-blue-700" />
        <h2 className="text-2xl font-bold text-blue-800 flex-1">{localBranch.branch}</h2>
        <button onClick={handleEdit} className="hover:bg-blue-100 p-2 rounded-full" title="Editar sucursal">
          <FaEdit className="text-blue-500" />
        </button>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <FaMapMarkerAlt className="text-red-500" />
        <a href={localBranch.location} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
          {localBranch.location}
        </a>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <FaPhoneAlt className="text-green-600" />
        <span className="text-gray-700">{localBranch.phoneNumber || 'Sin teléfono'}</span>
      </div>
      <div className="mb-2">
        <span className="font-semibold">Renta:</span>{" "}
        <span>
          {currency(localBranch?.rentAmount ?? 0) ?? 'N/A'} / mes {localBranch.rentDay ? `(Día ${localBranch.rentDay})` : ''}
        </span>
      </div>
      {localBranch.company?.name && (
        <div className="mb-2">
          <span className="font-semibold">Empresa:</span> <span>{localBranch.company?.name}</span>
        </div>
      )}
      <div className="mb-2">
        <span className="font-semibold">Posición:</span> <span>{localBranch.position ?? 'N/A'}</span>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <span className="font-semibold">Activa:</span>
        <button
          type="button"
          onClick={handleToggleActive}
          disabled={toggling}
          className={`px-2 py-0.5 rounded text-sm font-bold transition-colors border ${localBranch.active
            ? 'text-green-600 border-green-300 hover:bg-green-50'
            : 'text-red-600 border-red-300 hover:bg-red-50'
            } disabled:opacity-50`}
          title="Click para alternar"
        >
          {toggling ? '...' : (localBranch.active ? 'Sí' : 'No')}
        </button>
      </div>
      {toggleError && <p className="text-xs text-red-500">{toggleError}</p>}
    </div>
  );

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
              branch={localBranch}
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