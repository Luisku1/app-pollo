import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getEmployeeFullName, currency } from "../../helpers/Functions";
import { formatDateAndTime } from "../../helpers/DatePickerFunctions";
import ShowDetails from "../ShowDetails";
import RowItem from "../RowItem";
import { MdStorefront } from "react-icons/md";
import { GiChickenOven } from "react-icons/gi";
import { TbMoneybag } from "react-icons/tb";
import { FaInfoCircle } from "react-icons/fa";
import { CiSquareInfo } from "react-icons/ci";
import DeleteButton from "../Buttons/DeleteButton";
import ConfirmationButton from "../Buttons/ConfirmationButton";
import EmployeeInfo from "../EmployeeInfo";
import BranchName from "../Names/BranchName";
import CustomerName from "../Names/CustomerName"; // in case branch missing but customer present
import ProviderName from "../Names/ProviderName";
import EmployeeName from "../Names/EmployeeName";

export default function ProviderMovementsList({ movements = [], totalWeight = 0, totalAmount = 0, onDelete = null }) {
  const { currentUser } = useSelector((state) => state.user);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [deletingMovementId, setDeletingMovementId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const isAuthorized = (employee) => currentUser._id === employee._id || !onDelete;
  const deletable = !!onDelete;

  const fields = [
    { key: 'isReturn', label: '¿Es devolución?', format: (data) => data.isReturn ? 'Sí' : 'No' },
    { key: 'weight', label: 'Peso', format: (data) => `${data.weight.toFixed(2)} Kg` },
    { key: 'pieces', label: 'Piezas', format: (data) => data.pieces?.toFixed(2) ?? '' },
    { key: 'price', label: 'Precio', format: (data) => currency({ amount: data.price }) },
    { key: 'amount', label: 'Monto', format: (data) => currency({ amount: data.amount }) },
    { key: 'provider.name', label: 'Proveedor', format: (data) => data.provider?.name },
    { key: 'branch.branch', label: 'Sucursal', format: (data) => data.branch?.branch },
    { key: 'employee.name', label: 'Encargado', format: (data) => getEmployeeFullName(data.employee) },
    { key: 'comment', label: 'Comentario' },
    { key: 'createdAt', label: 'Hora', format: (data) => formatDateAndTime(data.createdAt) },
  ];

  const renderTotal = () => (
    <div className="flex justify-end">
      <p className="text-green-800 font-bold text-lg">
        {totalWeight.toFixed(2)} Kg:
      </p>
      <p className="text-green-800 font-bold text-lg ml-4">
        {currency({ amount: totalAmount })}
      </p>
    </div>
  );

  const handleDelete = (movement) => {
    setDeletingMovementId(movement._id);
    setTimeout(() => {
      onDelete(movement);
      setDeletingMovementId(null);
    }, 300);
  };

  const renderMovementItem = (movement, index) => {
    const { employee, product, pieces, weight, amount, branch, provider, comment, createdAt, isReturn } = movement;
    const tempMovement = { ...movement, index };
    const isDev = isReturn === true;
    return (
      isAuthorized(employee) && (
        <div
          className={`transition-opacity duration-300 ${deletingMovementId === movement._id ? "opacity-0" : "opacity-100"}`}
          key={movement._id}
        >
          {weight !== 0 ? (
            <div className={`grid grid-cols-12 border border-black border-opacity-30 rounded-2xl shadow-sm mb-2 py-1 ${isDev ? 'bg-red-100 border-red-400' : ''}`}>
              <div className="col-span-10 items-center">
                <div className="col-span-12">
                  <div className={`w-full mb-1 ${isDev ? 'text-red-700' : 'text-red-800'}`}>
                    <RowItem>
                      <div className="flex gap-3 items-center">
                        {branch && <div className="flex items-center gap-1"><MdStorefront /><BranchName branch={branch} /></div>}
                        {!branch && movement.customer && <CustomerName customer={movement.customer} />}
                        {provider && <ProviderName provider={provider} />}
                      </div>
                      <EmployeeName employee={employee} fullName />
                    </RowItem>
                  </div>
                  <div className="w-full text-sm font-semibold">
                    <RowItem>
                      <p className="flex gap-1 items-center font-semibold"><GiChickenOven />{product?.name}</p>
                      <p className="">{`${pieces ?? ''} pzs`}</p>
                      <p className="">{`${weight} kg`}</p>
                      <p className={`flex gap-1 items-center ${isDev ? 'text-red-700' : ''}`}><TbMoneybag className="text-orange-800" />{amount.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
                    </RowItem>
                  </div>
                  <div className="w-full mt-1">
                    <RowItem>
                      <p className={`text-xs flex gap-1 items-center ${isDev ? 'text-red-700' : ''}`}><FaInfoCircle className="text-blue-800" />{isDev ? 'DEVOLUCIÓN: ' : ''}{comment || 'Sin observaciones.'}</p>
                      {formatDateAndTime(createdAt)}
                    </RowItem>
                  </div>
                </div>
              </div>
              <div className="col-span-2 my-auto">
                <div className="flex flex-col gap-2 justify-center my-auto items-center">
                  <button
                    onClick={() => {
                      setSelectedMovement(tempMovement);
                    }}
                    className="border rounded-lg shadow-md w-10 h-10 flex justify-center items-center"
                  >
                    <CiSquareInfo className={`w-full h-full ${isDev ? 'text-red-600' : 'text-blue-600'}`} />
                  </button>
                  {deletable && (
                    <div className="w-10 h-10">
                      <DeleteButton
                        deleteFunction={() => handleDelete(tempMovement)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            ''
          )}
        </div>
      )
    );
  };

  const renderMovementList = () => (
    <div>
      {renderTotal()}
      {movements && movements.length > 0 && movements.map((movement, index) => renderMovementItem(movement, index))}
      {(!movements || movements.length === 0) && (
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-500 text-lg">No hay movimientos registrados</p>
        </div>
      )}
    </div>
  );

  const renderActions = () => (
    <div>
      <div className="w-full flex justify-center">
        {deletable && selectedMovement && (
          <div className="w-full flex flex-col gap-2">
            <ConfirmationButton onConfirm={() => onDelete(selectedMovement)} className="bg-delete-button  text-white w-10/12 rounded-xl">
              Eliminar
            </ConfirmationButton>
            <ConfirmationButton onConfirm={() => console.log('editing')} className="bg-update-button  text-white w-10/12 rounded-xl">
              Actualizar
            </ConfirmationButton>
          </div>
        )}
      </div>
    </div>
  );

  const shouldOpenModal = useMemo(() => {
    return selectedMovement !== null && selectedMovement !== undefined && movements.length > 0 && movements.find((m) => m._id === selectedMovement._id) !== undefined;
  }, [selectedMovement, movements]);

  return (
    <div>
      {renderMovementList()}
      <EmployeeInfo employee={selectedEmployee} toggleInfo={() => setSelectedEmployee(null)} />
      {shouldOpenModal && (
        <ShowDetails
          data={selectedMovement}
          actions={renderActions}
          fields={fields}
          title={selectedMovement.isReturn ? `Detalles de la devolución de ${selectedMovement.product?.name}` : `Detalles del movimiento de ${selectedMovement.product?.name}`}
          closeModal={() => { setSelectedMovement(null) }}
        />
      )}
    </div>
  );
}
