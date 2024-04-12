import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useParams, Link } from "react-router-dom"

export default function Reporte() {

  const { company } = useSelector((state) => state.user)
  const paramsDate = useParams().date
  const [branchReports, setBranchReports] = useState([])
  const [supervisorsInfo, setSupervisorsInfo] = useState([])
  const [error, setError] = useState(null)
  const [incomesTotal, setIncomesTotal] = useState(0.0)
  const [stockTotal, setStockTotal] = useState(0.0)
  const [outgoingsTotal, setOutgoingsTotal] = useState(0.0)
  const [balanceTotal, setBalanceTotal] = useState(0.0)

  useEffect(() => {

    setIncomesTotal(0.0)
    setStockTotal(0.0)
    setOutgoingsTotal(0.0)
    setBalanceTotal(0.0)
    setBranchReports([])

    const fetchBranchesReports = async () => {

      const date = (paramsDate ? new Date(paramsDate) : new Date()).toISOString()

      try {

        const res = await fetch('/api/report/get-branches-reports/' + company._id + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          return
        }

        let incomesTotalPivot = 0.0
        let stockTotalPivot = 0.0
        let outgoingsTotalPivot = 0.0
        let balanceTotalPivot = 0.0

        data.branchReports.sort((report, nextReport) => {


          return report.branch.position - nextReport.branch.position
        })

        data.branchReports.forEach((branchReport) => {

          incomesTotalPivot += branchReport.incomes
          stockTotalPivot += branchReport.finalStock
          outgoingsTotalPivot += branchReport.outgoings
          balanceTotalPivot += branchReport.balance

        })
        setIncomesTotal((prev) => prev + incomesTotalPivot)
        setStockTotal((prev) => prev + stockTotalPivot)
        setOutgoingsTotal((prev) => prev + outgoingsTotalPivot)
        setBalanceTotal((prev) => prev + balanceTotalPivot)
        setBranchReports(data.branchReports)
        setError(null)

      } catch (error) {

        setError(error.message)
      }
    }

    const fetchSupervisorsInfo = async () => {

      const date = (paramsDate ? new Date(paramsDate) : new Date()).toISOString()

      try {

        const res = await fetch('/api/report/get-supervisors-info/' + company._id + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          return
        }

        setSupervisorsInfo(data.supervisorsInfo.data)
        setError(null)

      } catch (error) {

        setError(error.message)
      }
    }


    fetchBranchesReports()
    fetchSupervisorsInfo()

  }, [company._id, paramsDate])

  return (

    <main className="p-3 max-w-lg mx-auto">

      <h1 className='text-3xl text-center font-semibold mt-7'>
        Supervisores
      </h1>

      {branchReports && branchReports.length > 0 ?

        <table className='border bg-white mt-4 w-full'>

          <thead className="border border-black">

            <tr>
              <th>Sucursal</th>
              <th>Gastos</th>
              <th>Sobrante</th>
              <th>Efectivo</th>
              <th>Balance</th>
            </tr>
          </thead>

          {branchReports.map((branchReport) => (

            <tbody key={branchReport._id}>


              <tr>
                <Link className='' to={'/formato/' + branchReport.createdAt + '/' + branchReport.branch._id}>
                  <td className="text-center">{branchReport.branch.branch}</td>
                </Link>
                <td className="text-center">{branchReport.outgoings.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</td>
                <td className="text-center">{branchReport.finalStock.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</td>
                <td className="text-center">{branchReport.incomes.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</td>
                <td className={branchReport.balance < 0 ? 'text-red-500' : 'text-green-500' + ' text-center'}>{branchReport.balance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} </td>
              </tr>
            </tbody>
          ))}


          <tfoot className="border border-black">
            <tr className="mt-2">
              <td className="text-center text-m font-bold">Totales:</td>
              <td className="text-center text-m font-bold">{outgoingsTotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</td>
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

            <p className="text-2xl">{info.supervisor.name + ' ' + info.supervisor.lastName}</p>

            <div className="p-3">
              <p className="text-lg">Efectivo bruto: {info.totalIncomes.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
              <p className="text-lg">Gastos: {info.totalExtraOutgoings.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>

              <p className="text-lg">Efectivo neto: {(info.totalIncomes - info.totalExtraOutgoings).toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
            </div>

          </div>
        </div>
      ))}


    </main>
  )
}
