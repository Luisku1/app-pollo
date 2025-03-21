import { useEffect, useState } from "react"
import { useSelector } from 'react-redux'
import { Link } from "react-router-dom"
import { useRoles } from "../context/RolesContext"

export default function ListadoDeCuentas() {

  const { company, currentUser } = useSelector((state) => state.user)
  const [error, setError] = useState(null)
  const [daysReportsData, setDayReportData] = useState([])
  const { isController } = useRoles()

  useEffect(() => {

    const fetchDayReportsData = async () => {

      const date = new Date().toISOString()

      try {

        const res = await fetch('/api/report/get-days-reports-data/' + company._id + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          return
        }

        setDayReportData(data.reportsData)

      } catch (error) {

        setError(error.message)
      }
    }

    if (isController(currentUser.role)) {

      fetchDayReportsData()

    } else {

      setError('No puedes acceder a esta información')

    }

  }, [company._id, currentUser, isController])

  useEffect(() => {

    document.title = 'Cuentas Diarias'
  })

  return (
    <main className="p-3 max-w-lg mx-auto">

      <h1 className='text-3xl text-center font-semibold mt-7'>
        Diario de cuentas
      </h1>

      {daysReportsData ?

        <div>
          {daysReportsData && daysReportsData.length > 0 ?


            <div>

              {daysReportsData.length > 0 && daysReportsData.map((reportData) => (
                <div className="bg-white p-5 my-4 rounded-3xl shadow-lg" key={reportData._id}>

                  <Link to={'/reporte/' + reportData.createdAt}>

                    <div className=''>

                      <p className="text-lg font-semibold text-red-500 mb-3">Fecha: {(new Date(reportData.createdAt)).toLocaleDateString('es-mx', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
                      <p className="text-center">Efectivo: {reportData.incomes.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
                      <p className="text-center">Sobrante: {reportData.stock.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
                      <p className="text-center">Gastos: {reportData.outgoings.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
                    </div>
                  </Link>

                </div>
              ))}

            </div>
            :

            <div className="bg-white p-5 my-4 rounded-3xl shadow-lg text-lg font-semibold text-center">

              {error ?
                <p>{error}</p>
                :
                <p>Parece que es tu primer día</p>
              }

            </div>
          }

        </div>

        : ''}
    </main>
  )
}
