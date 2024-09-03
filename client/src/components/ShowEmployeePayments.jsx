/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { getEmployeePayments } from '../services/employees/employeePayments'
import SectionHeader from './SectionHeader'
import { MdCancel } from 'react-icons/md'
import { useSelector } from 'react-redux'
import { FaTrash } from 'react-icons/fa'
import { deleteEmployeePaymentFetch } from '../helpers/FetchFunctions'

const useEmployeePayment = ({ employeeId, date }) => {

  const [employeePayments, setEmployeePayments] = useState()

  useEffect(() => {

    if (!employeeId || !date) return

    getEmployeePayments({ employeeId, date }).then(setEmployeePayments)

  }, [employeeId, date])

  return { employeePayments }
}
export default function ShowEmployeePayments({ employeeId, employeeName, date }) {

  const { currentUser } = useSelector((state) => state.user)
  const [employeePaymentsIsOpen, setEmployeePaymentsIsOpen] = useState(false)
  const { employeePayments } = useEmployeePayment({ employeeId, date })
  const [managerRole, setManagerRole] = useState({})
  const [buttonId, setButtonId] = useState(null)
  const [loading, setLoading] = useState(false)

  const deleteEmployeePayment = async (paymentId, incomeId, extraOutgoingId, index) => {

    setLoading(true)

    const { error } = await deleteEmployeePaymentFetch(paymentId, incomeId, extraOutgoingId)

    setLoading(false)

    if (error == null) {


      employeePayments.splice(index, 1)

    } else {

      console.log(error)
    }
  }

  useEffect(() => {
    const setManagerRoleFunction = async (roles) => {

      const managerRole = roles.find((elemento) => elemento.name == 'Gerente')
      setManagerRole(managerRole)

    }

    const fetchRoles = async () => {

      try {

        const res = await fetch('/api/role/get')
        const data = await res.json()

        if (data.success === false) {
          return
        }
        await setManagerRoleFunction(data.roles)

      } catch (error) {

        console.log(error)

      }
    }

    fetchRoles()

  }, [])

  return (
    <div className='bg-white'>
      <div className=" text-red-600 font-bold text-sm">
        {employeePayments && employeePayments.employeePayments && employeePayments.employeePayments.length > 0 ?
          <button className="w-full h-full p-3 border rounded-lg" onClick={() => { setEmployeePaymentsIsOpen(true) }}>
            {employeePayments.total.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}
          </button>
          : (0).toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}
      </div>

      {employeePaymentsIsOpen && employeePayments && employeePayments.employeePayments.length > 0 ?

        <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center max-w-lg my-auto mx-auto z-10'>
          <div className=' bg-white p-5 rounded-lg justify-center items-center h-5/6 my-auto mx-auto w-11/12 overflow-y-scroll'>
            <button className="" onClick={() => { setEmployeePaymentsIsOpen(false) }}><MdCancel className="h-7 w-7" /></button>
            < div className='bg-white mt-4 mb-4'>

              <SectionHeader label={'Pagos a ' + employeeName} />

              <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold mt-4'>
                <p className='col-span-3 text-center'>Fecha</p>
                <p className='col-span-2 text-center'>Detalle</p>
                <p className='col-span-3 text-center'>Monto</p>
              </div>

              {employeePayments.employeePayments.map((employeePayment, index) => (

                <div key={employeePayment._id} className='grid grid-cols-12 items-center border border-black border-opacity-30 mt-2 shadow-m rounded-lg'>

                  <div id='list-element' className=' flex col-span-10 items-center justify-around pt-3 pb-3'>
                    <div className='grid grid-cols-1 text-center text-xs w-4/12'>

                      <p>{(new Date(employeePayment.createdAt)).toLocaleDateString('es-Mx')}</p>
                      <p>{(new Date(employeePayment.createdAt).toLocaleTimeString())}</p>
                    </div>
                    <p className='text-center text-xs w-4/12'>{employeePayment.detail}</p>
                    <p className='text-center text-xs w-4/12'>{employeePayment.amount}</p>
                  </div>

                  {((currentUser.role == managerRole._id)) ?

                    <div>
                      <button id={employeePayment._id} onClick={() => { setEmployeePaymentsIsOpen(!employeePaymentsIsOpen), setButtonId(employeePayment._id) }} disabled={loading} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                        <span>
                          <FaTrash className='text-red-700 m-auto' />
                        </span>
                      </button>

                      {employeePaymentsIsOpen && employeePayment._id == buttonId ?
                        <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                          <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5'>
                            <div>
                              <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
                            </div>
                            <div className='flex gap-10'>
                              <div>
                                <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteEmployeePayment(employeePayment._id, employeePayment.income, employeePayment.extraOutgoing, index), setEmployeePaymentsIsOpen(!employeePaymentsIsOpen) }}>Si</button>
                              </div>
                              <div>
                                <button className='rounded-lg border shadow-lg w-20 h-10' onClick={() => { setEmployeePaymentsIsOpen(!employeePaymentsIsOpen) }}>No</button>
                              </div>
                            </div>
                          </div>
                        </div>
                        : ''}

                    </div>

                    : ''}

                </div>

              ))}

            </div>
          </div>
        </div>
        : ''
      }
    </div>
  )
}
