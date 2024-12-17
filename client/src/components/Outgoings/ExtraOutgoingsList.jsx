import { useSelector } from "react-redux"
import { useRoles } from "../../context/RolesContext"
import { useDayExtraOutgoings } from "../../hooks/ExtraOutgoings/useDayExtraOutgoings"
import { useDeleteExtraOutgoing } from "../../hooks/ExtraOutgoings/useDeleteExtraOutgoing"
import DeleteButton from "../Buttons/DeleteButton"
import { stringToCurrency } from "../../helpers/Functions"

/* eslint-disable react/prop-types */
export default function ExtraOutgoingsList({ initialExtraOutgoings }) {

  const { currentUser } = useSelector((state) => state.user)
  const { deleteExtraOutgoing } = useDeleteExtraOutgoing()
  const { extraOutgoings, totalExtraOutgoings, spliceExtraOutgoing } = useDayExtraOutgoings({ initialExtraOutgoings })
  const { roles } = useRoles()
  const isEmpty = extraOutgoings.length === 0

   const renderTotal = () => {
    return (
      <div className='justify-self-end'>
        <p className='text-orange-500 font-bold text-lg'>
          {stringToCurrency({amount: totalExtraOutgoings})}
        </p>
      </div>
    )
  }

  const renderListHeader = () => {
    return (
      <div>
        {!isEmpty && (
          <div id='header' className='grid grid-cols-11 items-center justify-around font-semibold mt-4'>
            <p className='p-3 rounded-lg col-span-3 text-center bg-white'>Supervisor</p>
            <p className='p-3 rounded-lg col-span-3 text-center bg-white'>Concepto</p>
            <p className='p-3 rounded-lg col-span-3 text-center bg-white'>Monto</p>
          </div>
        )}
      </div>
    )
  }

  const renderExtraOutgoingItem = ({ extraOutgoing, index }) => {

    const { partOfAPayment, _id, employee, concept, amount, detail } = extraOutgoing
    const employeeName = `${employee.name || employee}`
    const isAuthorized = currentUser._id == employee._id || currentUser.role == roles.managerRole._id
    const shouldRender = isAuthorized || currentUser.role === roles.managerRole._id;
    const shouldShowDeleteButton = isAuthorized && !partOfAPayment;

    return (
      <div key={extraOutgoing._id} >
        {shouldRender && (
          <div className={(currentUser._id == employee._id || currentUser.role == roles.managerRole._id ? '' : 'py-3 ') + 'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2'}>

            <div id='list-element' className='flex col-span-10 items-center justify-around'>
              <p className='text-center text-sm w-3/12'>{employeeName}</p>
              <p className='text-center text-sm w-3/12'>{concept || detail}</p>
              <p className='text-center text-sm w-3/12'>{stringToCurrency({ amount })}</p>
            </div>

            {shouldShowDeleteButton && (
              <DeleteButton
                deleteFunction={deleteExtraOutgoing}
                id={_id}
                index={index}
                item={extraOutgoing}
                spliceFunction={spliceExtraOutgoing}
              />
            )}

          </div>
        )}
      </div>
    )

  }

  const renderExtraOutgoingsList = () => {

    const showTotal = currentUser.role === roles.managerRole._id

    return (
      <div>
        {showTotal && renderTotal()}
        {renderListHeader()}
        {roles && roles.managerRole && !isEmpty && extraOutgoings.map((extraOutgoing, index) => renderExtraOutgoingItem({extraOutgoing, index}))}
      </div>
    )
  }

  return (
    <div>
      {renderExtraOutgoingsList()}
    </div>
  )
}
