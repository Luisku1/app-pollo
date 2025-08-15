/* eslint-disable react/prop-types */
import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { formatInformationDate } from "../../../helpers/DatePickerFunctions";
import { useRoles } from "../../../context/RolesContext";
import { currency } from "../../../helpers/Functions";
import ShowDetails from "../../ShowDetails";
import RowItem from "../../RowItem";
import { GiChickenOven } from "react-icons/gi";
import { FaInfoCircle } from "react-icons/fa";
import ConfirmationButton from "../../Buttons/ConfirmationButton";
import DeleteButton from "../../Buttons/DeleteButton";
import { CiSquareInfo } from "react-icons/ci";
import EmployeeInfo from "../../EmployeeInfo";
import { MoneyBag } from "../../Reutilizable/Labels";
import CustomerName from "../../Names/CustomerName";
import BranchName from "../../Names/BranchName";
import EmployeeName from "../../Names/EmployeeName";

export default function ListaEntradas({ inputs, onDelete = null }) {
  const { currentUser } = useSelector((state) => state.user);
  const { isManager } = useRoles();
  const [selectedInput, setSelectedInput] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const isAuthorized = (employee) =>
    currentUser._id === employee._id ||
    isManager(currentUser.companyData?.[0].role) ||
    !onDelete;
  const deletable = onDelete != null;

  const fields = [
    {
      key: "weight",
      label: "Peso",
      format: (data) => `${data.weight.toFixed(2)} Kg`,
    },
    {
      key: "pieces",
      label: "Piezas",
      format: (data) => data.pieces.toFixed(2),
    },
    {
      key: "price",
      label: "Precio",
      format: (data) => currency({ amount: data.price }),
    },
    {
      key: "amount",
      label: "Monto",
      format: (data) => currency({ amount: data.amount }),
    },
    {
      key: "branch.branch",
      label: "Entró a",
      format: (data) => data.branch.branch,
    },
    {
      key: "employee.name",
      label: "Encargado",
      format: (data) => `${data.employee.name} ${data.employee.lastName}`,
    },
    { key: "comment", label: "Comentario" },
    {
      key: "createdAt",
      label: "Hora",
      format: (data) => formatInformationDate(data.createdAt),
    },
  ];

  const totalWeight = useMemo(
    () => inputs.reduce((acc, input) => acc + input.weight, 0),
    [inputs]
  );
  const totalAmount = useMemo(
    () => inputs.reduce((acc, input) => acc + input.amount, 0),
    [inputs]
  );

  const renderTotal = () => {
    return (
      <div className="justify-self-end">
        <p className="text-green-800 font-bold text-lg">
          {`${totalWeight.toFixed(3)} Kg - ${currency({
            amount: totalAmount,
          })}`}
        </p>
      </div>
    );
  };

  const renderInputItem = (input, index) => {
    const {
      employee,
      product,
      pieces,
      weight,
      amount,
      branch,
      comment,
      customer,
      createdAt,
    } = input;
    const tempInput = { ...input, index };

    return (
      isAuthorized(employee) && (
        <div className="" key={input._id}>
          {input.weight !== 0 ? (
            <div className="grid grid-cols-12 border border-black border-opacity-30 rounded-2xl shadow-sm mb-2 py-1">
              <div id="list-element" className="col-span-10 items-center">
                <div id="list-element" className="grid grid-cols-12">
                  <div className="col-span-12">
                    <div className="w-full text-red-800 mb-1">
                      <RowItem>
                        {customer &&
                          <CustomerName customer={customer} />
                        }
                        {branch &&
                          <BranchName branch={branch} />
                        }
                        {employee &&
                          <EmployeeName employee={employee} />
                        }
                      </RowItem>
                    </div>
                    <div className="w-full text-sm font-semibold">
                      <RowItem className="">
                        <p className="flex gap-1 items-center font-semibold">
                          <GiChickenOven />
                          {product.name}
                        </p>
                        <p className="">{`${pieces} pzs`}</p>
                        <p className="">{`${weight} kg`}</p>
                        <p className="flex gap-1 items-center">
                          <MoneyBag />
                          {amount.toLocaleString("es-Mx", {
                            style: "currency",
                            currency: "MXN",
                          })}
                        </p>
                      </RowItem>
                    </div>
                    <div className="w-full mt-1">
                      <RowItem>
                        <p className="text-xs flex gap-1 items-center">
                          <FaInfoCircle className="text-blue-800" />
                          {comment || "Sin observaciones."}
                        </p>
                        <div className="text-sm text-black flex justify-self-end">
                          {formatInformationDate(createdAt)}
                        </div>
                      </RowItem>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-2 my-auto">
                <div className="flex flex-col gap-2 justify-center my-auto items-center">
                  <button
                    onClick={() => {
                      setSelectedInput(tempInput);
                    }}
                    className="border rounded-lg shadow-md w-10 h-10 flex justify-center items-center" >
                    <CiSquareInfo className="w-full h-full text-blue-600" />
                  </button>
                  {deletable && (
                    <div className="w-10 h-10">
                      <DeleteButton deleteFunction={() => onDelete(tempInput)} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      )
    );
  };

  const renderInputsList = () => {
    return (
      <div>
        {renderTotal()}
        {inputs &&
          inputs.length > 0 &&
          inputs.map((input, index) => renderInputItem(input, index))}
      </div>
    );
  };

  const renderActions = () => {
    return (
      <div>
        <div className="w-full flex justify-center">
          {deletable && selectedInput && (
            <div className="w-full flex flex-col gap-2">
              <ConfirmationButton
                onConfirm={() => onDelete(selectedInput)}
                className="bg-delete-button  text-white w-10/12 rounded-xl"
              >
                Eliminar
              </ConfirmationButton>
              <ConfirmationButton
                onConfirm={() => console.log("editing")}
                className="bg-update-button  text-white w-10/12 rounded-xl"
              >
                Actualizar
              </ConfirmationButton>
            </div>
          )}
        </div>
      </div>
    );
  };

  const shouldOpenModal = useMemo(() => {
    return (
      selectedInput !== null &&
      selectedInput !== undefined &&
      inputs.length > 0 &&
      inputs.find((input) => input._id === selectedInput._id) !== undefined
    );
  }, [selectedInput, inputs]);

  return (
    <div>
      {renderInputsList()}
      <EmployeeInfo employee={selectedEmployee} toggleInfo={() => setSelectedEmployee(null)} />
      {shouldOpenModal && (
        <ShowDetails
          data={selectedInput}
          actions={renderActions}
          fields={fields}
          title={"Detalles de la entrada de " + selectedInput.product.name}
          closeModal={() => {
            setSelectedInput(null);
          }}
        />
      )}
    </div>
  );
}
