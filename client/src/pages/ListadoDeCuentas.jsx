import { useEffect, useState } from "react"
import { useSelector } from 'react-redux'

export default function ListadoDeCuentas() {

  const { currentUser, company } = useSelector((state) => state.user)
  const [daysReportsData, setDayReportData] = useState([])
  const [error, setError] = useState(null)


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

    fetchDayReportsData()
  }, [company._id])

  return (
    <main className="p-3 max-w-lg mx-auto">

      <h1 className='text-3xl text-center font-semibold mt-7'>
        Supervisión
      </h1>

      {daysReportsData ?
        <div className="bg-white p-5 mb-4 mt-8 rounded-3xl shadow-lg">

          {daysReportsData && daysReportsData.length > 0 ?


            <div>

            { daysReportsData.length > 0 && daysReportsData.map((reportData) => (

              <div key={reportData._id} className=''>

                <p className="text-center text-lg font-semibold text-red-500 mb-3">Fecha: {(new Date(reportData.createdAt)).toLocaleDateString()}</p>
                <p>Efectivo: {reportData.incomes.toLocaleString('es-Mx', {style: 'currency', currency: 'MXN'})}</p>
                <p>Sobrante: {reportData.stock.toLocaleString('es-Mx', {style: 'currency', currency: 'MXN'})}</p>
                <p>Gastos: {reportData.outgoings.toLocaleString('es-Mx', {style: 'currency', currency: 'MXN'})}</p>
                <p>Efectivo neto: {(reportData.incomes - reportData.outgoings).toLocaleString('es-Mx', {style: 'currency', currency: 'MXN'})}</p>

              </div>
            ))}

            </div>
          :
          <p className="text-lg font-semibold text-center">Parece que es tu primer día</p>
          }

        </div>

        : ''}
    </main>
  )
}
