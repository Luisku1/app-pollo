import { useState } from "react";
import { NavLink } from "react-router-dom"; // Import NavLink
import Modal from "../Modals/Modal";
import PhoneLinks from "../PhoneLinks";
import { useRoles } from "../../context/RolesContext";
import { useSelector } from "react-redux";

export default function ProviderInfo({ provider, toggleInfo }) {

  const { currentUser } = useSelector((state) => state.user);
  const [showPayments, setShowPayments] = useState(false);
  const { isSupervisor } = useRoles();

  const providerCard = () => {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">
          {isSupervisor(currentUser.role) ? (
            <NavLink to={`${provider.location}`} className="text-[#2B6CB0] hover:underline">
              {`${provider.name}`}
            </NavLink>
          ) : (
            <span className="text-gray-700">{`${provider.name}`}</span>
          )}
        </h2>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <p className="text-lg">
            Teléfono:
          </p>
          <PhoneLinks phoneNumber={provider.phoneNumber} name={provider.name} />
        </div>
        <div className="flex flex-col gap-2">
          <button
            className="bg-[#3182CE] text-white py-3 px-4 rounded"
            onClick={() => setShowPayments(true)}
          >
            Ver Pagos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="text-base">
      {provider && (
        <Modal
          closeModal={() => toggleInfo()}
          closeOnClickOutside={true}
          closeOnClickInside={false}
          width="4/6"
          shape="rounded-3xl"
          content={providerCard()}
        />
      )}
      {showPayments &&(
        <Modal
          closeModal={() => setShowPayments(false)}
          closeOnClickOutside={true}
          closeOnClickInside={false}
          width="4/6"
          shape="rounded-3xl"
          content={<div><p>Pagos</p></div>}
        />
      )}
    </div>
  );
}