import { useState } from "react"
import { FaTrash } from "react-icons/fa"
import { Link } from "react-router-dom"
import { today } from "../helpers/DatePickerFunctions"

/* eslint-disable react/prop-types */
export default function TarjetaCuenta({ reportArray, managerRole, currentUser }) {

  const [isOpen, setIsOpen] = useState(false)
  const [buttonId, setButtonId] = useState(null)
  const [loading, setLoading] = useState(false)
  const reports = reportArray

  const deleteBranchReport = async (reportId, index) => {

    setLoading(true)

    try {

      const res = await fetch('/api/branch/report/delete/' + reportId, {

        method: 'DELETE'

      })

      const data = await res.json()

      if (data.success === false) {

        console.log(data.message)
        setLoading(false)
        return
      }
      setLoading(false)

      reports.splice(index, 1)

    } catch (error) {

      console.log(error)
    }
  }

  return (

    <div className="">
      {reports.map((reportData, index) => (

        <div key={reportData._id} className="bg-white p-5 mb-4 mt-4 rounded-3xl shadow-lg border" >

          <div className='flex justify-around'>
            <div className='flex justify-center my-auto gap-1'>
              <p className="text-center text-lg font-semibold text-red-500 mb-3">Fecha:</p>
              <p className="text-center text-lg font-semibold text-black mb-3">{`${today(reportData.createdAt) ? 'hoy ' : ''}` + (new Date(reportData.createdAt)).toLocaleDateString()}</p>
            </div>
            <div className='flex my-auto gap-1'>
              <p className="text-center text-lg font-semibold text-red-500 mb-3">{reportData.branch.branch}</p>
            </div>
          </div>

          <div className='grid grid-cols-12'>

            <Link className='col-span-10' to={'/formato/' + reportData.createdAt + '/' + reportData.branch._id}>

              <div className=''>
                {!today(reportData.createdAt) || managerRole._id == currentUser.role || reportData.balance < 0 ?
                  <div className="flex gap-2">
                    <p className="text-lg">Faltante: </p>
                    <p className={reportData.balance < 0 ? 'text-red-700 font-bold' : '' + 'text-lg font-bold'}>{reportData.balance > 0 ? managerRole._id == currentUser.role ? parseFloat(reportData.balance).toLocaleString("es-MX", { style: 'currency', currency: 'MXN' }) : '$0.00' : parseFloat(reportData.balance).toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
                  </div>
                  : ''}
                <p>Efectivo: {reportData.incomes.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
                <p>Sobrante: {reportData.finalStock.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
                <p>Gastos: {reportData.outgoings.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
              </div>
            </Link>

            {managerRole._id == currentUser.role ?

              <div className=' col-span-2'>
                <button id={reportData._id} onClick={() => { setIsOpen(isOpen ? false : true), setButtonId(reportData._id) }} disabled={loading} className='bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                  <span>
                    <FaTrash className='text-red-700 m-auto' />
                  </span>
                </button>

                {isOpen && reportData._id == buttonId ?
                  <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                    <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5'>
                      <div>
                        <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
                      </div>
                      <div className='flex gap-10'>
                        <div>
                          <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteBranchReport(reportData._id, index), setIsOpen(isOpen ? false : true) }}>Si</button>
                        </div>
                        <div>
                          <button className='rounded-lg border shadow-lg w-20 h-10' onClick={() => { setIsOpen(isOpen ? false : true) }}>No</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  : ''}
              </div>
              : ''}
          </div>
        </div>

      ))}
    </div>

  )
}
