import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useSelector } from 'react-redux'
import { FaCheck } from "react-icons/fa"

export default function Gastos() {

  const { currentUser, company } = useSelector((state) => state.user)
  const [outgoings, setOutgoings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const paramsDate = useParams().date
  const [outgoingsTotal, setOutgoingsTotal] = useState(0.0)

  const setOutgoingsTotalFunction = (outgoings) => {

    let total = 0
    outgoings.forEach((outgoing) => {
      total += parseFloat(outgoing.amount)
    })

    setOutgoingsTotal(total)
  }

  useEffect(() => {

    const fetchOutgoings = async () => {

      const date = (paramsDate ? new Date(paramsDate) : new Date()).toISOString()

      setLoading(true)
      setOutgoingsTotal(0.0)
      setOutgoings([])

      try {

        const res = await fetch('/api/outgoing/get-outgoings/' + company._id + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          setError('No hay gastos registrados')
          setLoading(false)
          return
        }

        data.outgoings.sort((outgoing, nextOutgoing) => {

          return outgoing.branch.position - nextOutgoing.branch.position
        })

        setOutgoings(data.outgoings)
        setOutgoingsTotalFunction(data.outgoings)
        setError(null)
        setLoading(false)

      } catch (error) {

        setError(error.message)
        setLoading(false)
      }
    }

    fetchOutgoings()

  }, [paramsDate, company])

  return (

    <main className="p-3 max-w-lg mx-auto">
      <h1 className='text-3xl text-center font-semibold mt-7'>
        Gastos
        <br />
      </h1>


      {error ? <p>{error}</p> : ''}

      {outgoings && outgoings.length > 0 ?

        <div className="bg-white p-3 mt-4">

          {outgoings && outgoings.length > 0 ?
            <div id='header' className='grid grid-cols-12 gap-4 items-center justify-around font-semibold'>
              <p className='p-3 rounded-lg col-span-3 text-center'>Sucursal</p>
              <p className='p-3 rounded-lg col-span-4 text-center'>Concepto</p>
              <p className='p-3 rounded-lg col-span-3 text-center'>Monto</p>
            </div>
            : ''}
          {outgoings && outgoings.length > 0 && outgoings.map((outgoing, index) => (


            <div key={outgoing._id} className={'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2'}>

              <div id='list-element' className='flex col-span-10 items-center'>
                <p className='text-center text-xs w-6/12'>{outgoing.branch.branch}</p>
                <p className='text-center text-xs w-6/12'>{outgoing.concept}</p>
                <p className='text-center text-xs w-6/12'>{outgoing.amount.toLocaleString("es-MX", { style: 'currency', currency: 'MXN' })}</p>
              </div>

              <div>
                <button id={outgoing._id} disabled={loading} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                  <span>
                    <FaCheck className='text-green-700 m-auto' />
                  </span>
                </button>

              </div>

            </div>

          ))}
        </div>
        : ''}
    </main>
  )
}
