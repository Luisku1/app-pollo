import { useState } from "react";
import { NavLink } from "react-router-dom"; // Import NavLink
import Modal from "../Modals/Modal";
import PhoneLinks from "../PhoneLinks";
import { useRoles } from "../../context/RolesContext";
import { useSelector } from "react-redux";

export default function BranchInfo({ branch, toggleInfo }) {
  const { currentUser } = useSelector((state) => state.user);
  const [showPayments, setShowPayments] = useState(false);
  const [showChecks, setShowChecks] = useState(false);
  const { isSupervisor } = useRoles();

  const branchCard = () => {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">
          {isSupervisor(currentUser.role) ? (
            <NavLink
              to={`${branch.location}`}
              target="_blank"
              className="text-[#2B6CB0] hover:underline"
            >
              {`${branch.branch}`}
            </NavLink>
          ) : (
            <span className="text-gray-700">{`${branch.branch}`}</span>
          )}
        </h2>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <p className="text-lg">Día de Renta: {branch.rentDay} </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <p className="text-lg">
            Monto de Renta:{" "}
            {parseFloat(branch.rentAmount).toLocaleString("es-Mx", {
              style: "currency",
              currency: "MXN",
            })}{" "}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <p className="text-lg">Teléfono: </p>
          <PhoneLinks phoneNumber={branch.phoneNumber} name={branch.branch} />
        </div>
        <div className="flex flex-col gap-2">
          <button
            className="bg-[#3182CE] text-white py-3 px-4 rounded"
            onClick={() => setShowPayments(true)}
          >
            Ver Pagos
          </button>
          <button className="bg-[#2B6CB0] text-white py-3 px-4 rounded">
            Ver Cuentas
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="text-base">
      {branch && (
        <Modal
          closeModal={() => toggleInfo()}
          closeOnClickOutside={true}
          closeOnClickInside={false}
          width="4/6"
          shape="rounded-3xl"
          content={branchCard()}
        />
      )}
      {showPayments && (
        <Modal
          closeModal={() => setShowPayments(false)}
          closeOnClickOutside={true}
          closeOnClickInside={false}
          width="4/6"
          shape="rounded-3xl"
          content={
            <div>
              <p>Pagos</p>
            </div>
          }
        />
      )}
      {showChecks && (
        <Modal
          closeModal={() => setShowChecks(false)}
          closeOnClickOutside={true}
          closeOnClickInside={false}
          width="4/6"
          shape="rounded-3xl"
          content={
            <div>
              <p>Cuentas</p>
            </div>
          }
        />
      )}
    </div>
  );
}
