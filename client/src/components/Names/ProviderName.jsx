import { useState } from "react";
import Modal from "../Modals/Modal";
import { FaUserTie, FaEdit, FaMapMarkerAlt } from "react-icons/fa";
import { currency } from "../../helpers/Functions";
import PhoneLinks from "../PhoneLinks";
import RegistroProveedor from "../../pages/RegistroProveedor";

// Componente de información (inline) similar a BranchInfo/CustomerInfo
function ProviderInfo({ provider, toggleInfo, isShown, handleProviderUpdate }) {
  const [editing, setEditing] = useState(false);
  const [providerState, setProviderState] = useState(provider);
  if (!providerState) return null;

  const handleEdit = () => setEditing(true);
  const handleCloseEdit = () => setEditing(false);
  const onSaved = (updated) => {
    setProviderState(updated);
    if (handleProviderUpdate) handleProviderUpdate(updated);
    setEditing(false);
  };

  const card = (
    <div className="p-4 rounded-2xl bg-white shadow-lg max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <FaUserTie className="text-2xl text-purple-700" />
        <h2 className="text-2xl font-bold text-purple-800 flex-1">{providerState.name} {providerState.lastName || ''}</h2>
        <button onClick={handleEdit} className="hover:bg-purple-100 p-2 rounded-full" title="Editar proveedor">
          <FaEdit className="text-purple-500" />
        </button>
      </div>
      <PhoneLinks phoneNumber={providerState.phoneNumber} />
      {providerState.location && (
        <div className="mb-2 flex items-center gap-2">
          <FaMapMarkerAlt className="text-red-500" />
          <a href={providerState.location} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
            {providerState.location}
          </a>
        </div>
      )}
      {providerState.balance !== undefined && (
        <div className="mb-2">
          <span className="font-semibold">Saldo:</span> <span>{currency(providerState.balance || 0)}</span>
        </div>
      )}
      {providerState.company?.name && (
        <div className="mb-2">
          <span className="font-semibold">Empresa:</span> <span>{providerState.company.name}</span>
        </div>
      )}
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
        content={card}
      />
      {editing && (
        <Modal
          closeModal={handleCloseEdit}
          closeOnClickOutside={true}
          closeOnClickInside={false}
          closeOnEsc={true}
          shape="rounded-3xl"
          isShown={editing}
          width="4/6"
          content={<RegistroProveedor provider={providerState} setProvider={onSaved} onSaved={onSaved} onCancel={handleCloseEdit} />}
        />
      )}
    </div>
  );
}

export default function ProviderName({ provider, handleProviderUpdate }) {
  const [showInfo, setShowInfo] = useState(false);
  if (!provider) return null;
  return (
    <div>
      <ProviderInfo provider={provider} toggleInfo={() => setShowInfo(p => !p)} isShown={showInfo} handleProviderUpdate={handleProviderUpdate} />
      <button onClick={() => setShowInfo(true)}>
        <span className="font-bold text-md flex gap-1 text-purple-700 items-center hover:underline">
          {provider.name} {provider.lastName || ''}
        </span>
      </button>
    </div>
  );
}
