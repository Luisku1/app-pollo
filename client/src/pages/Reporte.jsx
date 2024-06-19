import { useEffect, useState } from "react"
import { FaCheck } from "react-icons/fa"
import { useSelector } from "react-redux"
import { useParams, useNavigate, Link } from "react-router-dom"
import FechaDePagina from "../components/FechaDePagina"
import { formatDate } from "../helpers/DatePickerFunctions"

export default function Reporte() {

  const { company } = useSelector((state) => state.user)
  let paramsDate = useParams().date
  const [branchReports, setBranchReports] = useState([])
  const [supervisorsInfo, setSupervisorsInfo] = useState([])
  const [error, setError] = useState(null)
  const [incomesTotal, setIncomesTotal] = useState(0.0)
  const [stockTotal, setStockTotal] = useState(0.0)
  const [extraOutgoingsTotal, setExtraOutgoingsTotal] = useState(0.0)
  const [extraOutgoingsIsOpen, setExtraOutgoingsIsOpen] = useState(false)
  const [incomesIsOpen, setIncomesIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedSupervisor, setSelectedSupervisor] = useState(null)
  const [balanceTotal, setBalanceTotal] = useState(0.0)
  const navigate = useNavigate()
  let datePickerValue = (paramsDate ? new Date(paramsDate) : new Date())
  let stringDatePickerValue = formatDate(datePickerValue)

  const changeDatePickerValue = (e) => {

    stringDatePickerValue = (e.target.value + 'T06:00:00.000Z')
    navigate('/reporte/' + stringDatePickerValue)

  }

  const changeDay = (date) => {

    navigate('/reporte/' + date)

  }

  const extraOutgoingsIsOpenFunctionControl = (arrayLength, selectedSupervisorId) => {

    if (arrayLength > 0) {

      if (incomesIsOpen) {

        setIncomesIsOpen((prev) => !prev)
      }

      if (selectedSupervisorId == selectedSupervisor) {

        setExtraOutgoingsIsOpen((prev) => !prev)

      } else {

        if (!(selectedSupervisor == null)) {

          if (selectedSupervisor != selectedSupervisorId && !extraOutgoingsIsOpen) {
            setExtraOutgoingsIsOpen((prev) => !prev)

          }

        } else {

          setExtraOutgoingsIsOpen((prev) => !prev)
        }

        setSelectedSupervisor(selectedSupervisorId)
      }
    }
  }

  const incomesIsOpenFunctionControl = (arrayLength, selectedSupervisorId) => {

    if (arrayLength > 0) {

      if (extraOutgoingsIsOpen) {

        setExtraOutgoingsIsOpen((prev) => !prev)

      }

      if (selectedSupervisorId == selectedSupervisor) {

        setIncomesIsOpen((prev) => !prev)

      } else {

        if (!(selectedSupervisor == null)) {

          if (selectedSupervisor != selectedSupervisorId && !incomesIsOpen) {
            setIncomesIsOpen((prev) => !prev)

          }

        } else {

          setIncomesIsOpen((prev) => !prev)
        }

        setSelectedSupervisor(selectedSupervisorId)
      }
    }
  }

  useEffect(() => {

    setIncomesTotal(0.0)
    setStockTotal(0.0)
    setExtraOutgoingsTotal(0.0)
    setBalanceTotal(0.0)
    setBranchReports([])
    setSupervisorsInfo([])

    const fetchBranchesReports = async () => {

      const date = new Date(stringDatePickerValue).toISOString()

      setIncomesTotal(0.0)
      setStockTotal(0.0)
      setExtraOutgoingsTotal(0.0)
      setBalanceTotal(0.0)

      try {

        const res = await fetch('/api/report/get-branches-reports/' + company._id + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          return
        }

        let incomesTotalPivot = 0.0
        let stockTotalPivot = 0.0
        let extraOutgoingsTotalPivot = 0.0
        let balanceTotalPivot = 0.0

        data.branchReports.sort((report, nextReport) => {


          return report.branch.position - nextReport.branch.position
        })

        data.branchReports.forEach((branchReport) => {

          incomesTotalPivot += branchReport.incomes
          stockTotalPivot += branchReport.finalStock
          extraOutgoingsTotalPivot += branchReport.outgoings
          balanceTotalPivot += branchReport.balance

        })

        setIncomesTotal((prev) => prev + incomesTotalPivot)
        setStockTotal((prev) => prev + stockTotalPivot)
        setExtraOutgoingsTotal((prev) => prev + extraOutgoingsTotalPivot)
        setBalanceTotal((prev) => prev + balanceTotalPivot)
        setBranchReports(data.branchReports)
        setError(null)

      } catch (error) {

        setError(error.message)
      }
    }

    const fetchSupervisorsInfo = async () => {

      const date = new Date(stringDatePickerValue).toISOString()

      setLoading(true)

      try {

        const res = await fetch('/api/report/get-supervisors-info/' + company._id + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          setLoading(false)
          return
        }

        setSupervisorsInfo(data.supervisorsInfo.data)
        setLoading(false)
        setError(null)

      } catch (error) {

        setLoading(false)
        setError(error.message)
      }
    }


    fetchBranchesReports()
    fetchSupervisorsInfo()


  }, [company, stringDatePickerValue])

  return (

    <main className="p-3 max-w-lg mx-auto">

      <FechaDePagina changeDay={changeDay} stringDatePickerValue={stringDatePickerValue} changeDatePickerValue={changeDatePickerValue} ></FechaDePagina>

      <h1 className='text-3xl text-center font-semibold mt-7'>
        Reporte
      </h1>

      {branchReports && branchReports.length > 0 ?

        <table className='border bg-white mt-4 w-full'>

          <thead className="border border-black">

            <tr>
              {/* <th></th> */}
              <th className="text-sm">Sucursal</th>
              <th className="text-sm">
                <Link className="flex justify-center" to={'/gastos/' + stringDatePickerValue}>
                  Gastos
                </Link>
              </th>
              <th className="text-sm">
                <Link className="flex justify-center" to={'/sobrante/' + stringDatePickerValue}>
                  Sobrante
                </Link>
              </th>
              <th className="text-sm">Efectivo</th>
              <th className="text-sm">Balance</th>
            </tr>
          </thead>

          {branchReports.map((branchReport, index) => (

            <tbody key={branchReport._id} className="">


              <tr className={'border-x ' + (index + 1 != branchReports.length ? "border-b " : '') + 'border-black border-opacity-40'}>
                {/* <td className="text-xs">{branchReport.branch.position}</td> */}
                <td className="group">
                  <Link className='' to={'/formato/' + branchReport.createdAt + '/' + branchReport.branch._id}>
                    <p className=" text-sm">{branchReport.branch.branch}</p>
                    <div className="hidden group-hover:block group-hover:fixed group-hover:overflow-hidden group-hover:mt-2 ml-24 bg-slate-600 text-white shadow-2xl rounded-md p-2">
                      <p>{branchReport.employee != null ? branchReport.employee.name + ' ' + branchReport.employee.lastName : 'Empleado eliminado'}</p>
                      {branchReport.assistant != null ?

                        <p>{branchReport.assistant.name + ' ' + branchReport.assistant.lastName}</p>
                        : ''}
                    </div>
                  </Link>
                </td>
                <td className="text-center text-sm">{branchReport.outgoings.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</td>
                <td className="text-center text-sm">{branchReport.finalStock.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</td>
                <td className="text-center text-sm">{branchReport.incomes.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</td>
                <td className={(branchReport.balance < 0 ? 'text-red-500' : 'text-green-500') + ' text-center text-sm'}>{branchReport.balance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} </td>
              </tr>
            </tbody>
          ))}


          <tfoot className="border border-black text-sm">
            <tr className="mt-2">
              <td className="text-center text-m font-bold">Totales:</td>
              <td className="text-center text-m font-bold">{extraOutgoingsTotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
              <td className="text-center text-m font-bold">{stockTotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
              <td className="text-center text-m font-bold">{incomesTotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
              <td className={(balanceTotal < 0 ? 'text-red-500' : 'text-green-500') + ' text-center text-m font-bold'}>{balanceTotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
            </tr>
          </tfoot>

        </table>

        : ''}

      {supervisorsInfo && supervisorsInfo.length > 0 && supervisorsInfo.map((info) => (

        <div key={info.supervisor._id} className='border bg-white p-3 mt-4'>

          {error ? <p>{error}</p> : ''}

          <div className="">

            <div className="flex gap-4">

              <p className="text-2xl font-semibold">{info.supervisor.name + ' ' + info.supervisor.lastName}</p>

              <div className="grid grid-rows-2">
                <p className="text-lg">Efectivo neto {(info.cash - info.totalExtraOutgoings).toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
                <p className="text-lg">Depósitos {(info.deposits).toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
              </div>
            </div>

            <div className="p-3 mt-6">

              <div className="flex justify-between p-3 gap-4">

                <button className="m-auto border border-black border-opacity-20 shadow-lg rounded-3xl w-10/12 p-3" onClick={() => { incomesIsOpenFunctionControl(info.incomes.length, info.supervisor._id) }}>

                  <p className="text-lg">Ingreso bruto</p>
                  <p>{info.totalIncomes.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
                </button>

                <button className="m-auto border border-black border-opacity-20 shadow-lg rounded-3xl p-3 w-10/12" onClick={() => { extraOutgoingsIsOpenFunctionControl(info.extraOutgoings.length, info.supervisor._id) }}>
                  <p className="text-lg">Gastos</p>
                  <p>{info.totalExtraOutgoings.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
                </button>
              </div>

              {info && extraOutgoingsIsOpen && info.supervisor._id == selectedSupervisor ?

                <div className={extraOutgoingsIsOpen ? '' : 'hidden'}>

                  {info && info.extraOutgoings && info.extraOutgoings.length > 0 ?
                    <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold mt-4'>
                      <p className='p-3 rounded-lg col-span-5 text-center bg-white'>Concepto</p>
                      <p className='p-3 rounded-lg col-span-5 text-center bg-white'>Monto</p>
                    </div>
                    : ''}

                  {info && info.extraOutgoings && info.extraOutgoings.length > 0 && info.extraOutgoings.map((extraOutgoing) => (

                    <div key={extraOutgoing._id} >
                      <div className={'py-3 grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2'}>

                        <div id='list-element' className='flex col-span-10 items-center justify-around'>
                          <p className='text-center text-sm w-5/12'>{extraOutgoing.concept}</p>
                          <p className='text-center text-sm w-5/12'>{extraOutgoing.amount.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
                        </div>

                        <div>
                          <button id={extraOutgoing._id} disabled={loading} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                            <span>
                              <FaCheck className='text-green-700 m-auto' />
                            </span>
                          </button>

                        </div>

                      </div>
                    </div>

                  ))}

                </div>

                : ''}


              {info && incomesIsOpen && info.supervisor._id == selectedSupervisor ?

                <div className={incomesIsOpen ? '' : 'hidden'} >


                  <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold mt-4'>
                    <p className='col-span-4 text-center'>Sucursal</p>
                    <p className='col-span-4 text-center'>Tipo</p>
                    <p className='col-span-4 text-center'>Monto</p>
                  </div>

                  {info && info.incomes.length > 0 && info.incomes.map((income) => (

                    <div key={income._id} className='grid grid-cols-12 items-center border border-black border-opacity-30 mt-2 shadow-m rounded-lg'>

                      <div id='list-element' className=' flex col-span-12 items-center justify-around pt-3 pb-3'>
                        <p className='text-center text-xs w-4/12'>{income.branch.branch ? income.branch.branch : income.branch}</p>
                        <p className='text-center text-xs w-4/12'>{income.type.name ? income.type.name : income.type}</p>
                        <p className='text-center text-xs w-4/12'>{income.amount.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
                      </div>

                    </div>

                  ))}


                </div>
                : ''}
            </div>

          </div>
        </div>
      ))
      }
    </main >
  )
}
