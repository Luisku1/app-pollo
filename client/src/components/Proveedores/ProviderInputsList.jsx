/* eslint-disable react/prop-types */
import { useSelector } from "react-redux";
import { useRoles } from "../../context/RolesContext";
import { getEmployeeFullName, currency } from "../../helpers/Functions";
import { formatTime } from "../../helpers/DatePickerFunctions";
import { useMemo, useState } from "react";
import ShowDetails from "../ShowDetails";
import { CgProfile } from "react-icons/cg";
import RowItem from "../RowItem";
import { GiChickenOven } from "react-icons/gi";
import { TbMoneybag } from "react-icons/tb";
import { FaInfoCircle } from "react-icons/fa";
import { MdStorefront } from "react-icons/md";
import ConfirmationButton from "../Buttons/ConfirmationButton";
import DeleteButton from "../Buttons/DeleteButton";

export default function ProviderInputsList({ inputs, totalWeight = 0, totalAmount = 0, onDelete = null }) {

  const { currentUser } = useSelector((state) => state.user);
  const { roles } = useRoles();
  const [selectedInput, setSelectedInput] = useState(null)
  const isAuthorized = (employee) => currentUser._id === employee._id || currentUser.role === roles.managerRole._id || !onDelete
  const deletable = onDelete

  const fields = [
    { key: 'weight', label: 'Peso', format: (data) => `${data.weight.toFixed(2)} Kg` },
    { key: 'pieces', label: 'Piezas', format: (data) => data.pieces.toFixed(2) },
    { key: 'price', label: 'Precio', format: (data) => currency({ amount: data.price }) },
    { key: 'amount', label: 'Monto', format: (data) => currency({ amount: data.amount }) },
    { key: 'branch.branch', label: 'Entró a', format: (data) => data.branch.branch },
    { key: 'employee.name', label: 'Encargado', format: (data) => getEmployeeFullName(data.employee) },
    { key: 'comment', label: 'Comentario' },
    { key: 'createdAt', label: 'Hora', format: (data) => formatTime(data.createdAt) },
  ]

  const renderTotal = () => {
    return (
      <div className="flex justify-end">
        <p className="text-green-800 font-bold text-lg">
          {totalWeight.toFixed(2)} Kg:
        </p>
        <p className="text-green-800 font-bold text-lg ml-4">
          {currency({ amount: totalAmount })}
        </p>
      </div>
    )
  }

  // const renderHeader = () => {
  //   return (
  //     <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold my-4'>
  //       <p className='col-span-3 text-center'>Encargado</p>
  //       <p className='col-span-3 text-center'>Producto</p>
  //       <p className='col-span-2 text-center'>Piezas</p>
  //       <p className='col-span-2 text-center'>Kg</p>
  //       <p className='col-span-2 text-center'>Monto</p>
  //     </div>
  //   )
  // }

  const renderInputItem = (input, index) => {
    const { employee, product, pieces, weight, amount, branch, comment, createdAt } = input;

    const tempInput = { ...input, index };

    return (
      isAuthorized(employee) && (
        <div className="" key={input._id}>
          {input.weight !== 0 ? (
            <div className="grid grid-cols-12 border border-black border-opacity-30 rounded-2xl shadow-sm mb-2 py-1">
              <button
                onClick={() => {
                  setSelectedInput(tempInput);
                }}
                id="list-element"
                className="col-span-10 items-center"
              >
                <div id="list-element" className="col-span-12">
                  <div className="w-full text-red-800">
                    <RowItem>
                      <p className="text-md font-bold flex gap-1 items-center"><MdStorefront />{branch.branch}</p>
                      <p className="font-bold text-md flex gap-1 items-center truncate"><span><CgProfile /></span>{employee.name}</p>
                      <div>
                        {formatTime(createdAt)}
                      </div>
                    </RowItem>
                  </div>
                  <div className="w-full text-sm font-semibold">
                    <RowItem>
                      <p className="flex gap-1 items-center font-semibold"><GiChickenOven />{product.name}</p>
                      <p className="">{`${pieces} pzs`}</p>
                      <p className="">{`${weight} kg`}</p>
                      <p className="flex gap-1 items-center"><TbMoneybag className="text-orange-800" />{amount.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
                    </RowItem>
                  </div>
                  <div className="w-full">
                    <RowItem>
                      <p className="text-xs flex gap-1 items-center"><FaInfoCircle className="text-blue-800" />{comment || 'Sin observaciones.'}</p>
                    </RowItem>
                  </div>
                </div>
              </button>
              <div className="col-span-2 my-auto">
                {deletable && (
                  <DeleteButton
                    deleteFunction={() => onDelete(tempInput)}
                  />
                )}
              </div>
            </div>
          ) : (
            ''
          )}
        </div>
      )
    );
  };

  const renderInputList = () => {
    return (
      <div>
        {renderTotal()}
        {inputs && inputs.length > 0 && inputs.map((input, index) => (renderInputItem(input, index)))}
      </div>
    )
  }

  const renderActions = () => {
    return (
      <div>
        <div className="w-full flex justify-center">
          {deletable && selectedInput && (
            <div className="w-full flex flex-col gap-2">
              <ConfirmationButton onConfirm={() => onDelete(selectedInput)} className="bg-delete-button  text-white w-10/12 rounded-xl">
                Eliminar
              </ConfirmationButton>
              <ConfirmationButton onConfirm={() => console.log('editing')} className="bg-update-button  text-white w-10/12 rounded-xl">
                Actualizar
              </ConfirmationButton>
            </div>
          )}
        </div>
      </div>
    )
  }

  // const renderToolbar = () => {
  //   return (
  //     <div className='flex justify-between items-center'>
  //     </div>
  //   )
  // }

  const shouldOpenModal = useMemo(() => {

    return selectedInput !== null && selectedInput !== undefined && inputs.length > 0 && inputs.find((input) => input._id === selectedInput._id) !== undefined

  }, [selectedInput, inputs])

  return (
    <div>
      {renderInputList()}
      {shouldOpenModal && (
        <ShowDetails
          data={selectedInput}
          actions={renderActions}
          fields={fields}
          title={"Detalles de la entrada de " + selectedInput.product.name}
          closeModal={() => { setSelectedInput(null) }}
        />
      )}
    </div>
  )
}
