import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

export default function Supervisores() {

  const { company } = useSelector((state) => state.user)
  const [branchReports, setBranchReports] = useState([])
  const [supervisorsInfo, setSupervisorsInfo] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {

    const fetchBranchReports = async () => {

      const date = new Date().toISOString()

      try {

        const res = await fetch('/api/report/get-branch-reports/' + company._id + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          return
        }

        console.log(data)

        setBranchReports(data.branchReports)
        setError(null)

      } catch (error) {

        setError(error.message)
      }
    }

    const fetchSupervisorsInfo = async () => {

      const date = new Date().toISOString()

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
        console.log(error)
      }
    }

    fetchBranchReports()
    fetchSupervisorsInfo()

  }, [company._id])

  return (

    <main className="p-3 max-w-lg mx-auto">

      <h1 className='text-3xl text-center font-semibold mt-7'>
        Supervisores
      </h1>

      {branchReports && branchReports.length > 0 ?

        <table className='border bg-white mt-4 w-full'>

          <tr>
            <th>Sucursal</th>
            <th>Gastos</th>
            <th>Sobrante</th>
            <th>Efectivo</th>
          </tr>

          {branchReports.map((branchReport) => (

            <tr key={branchReport._id}>
              <td className="text-center">{branchReport.branch.branch}</td>
              <td className="text-center">{branchReport.outgoings.toLocaleString('es-Mx', {style: 'currency', currency: 'MXN'})}</td>
              <td className="text-center">{branchReport.finalStock.toLocaleString('es-Mx', {style: 'currency', currency: 'MXN'})}</td>
              <td className="text-center">{branchReport.incomes.toLocaleString('es-Mx', {style: 'currency', currency: 'MXN'})}</td>
            </tr>
          ))}

        </table>

        : ''}

      {supervisorsInfo && supervisorsInfo.length > 0 && supervisorsInfo.map((info) => (
        <div key={info.employeeId} className='border bg-white p-3 mt-4'>
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
