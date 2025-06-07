import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

export default function RegistroSucursal() {

  const {currentUser, company} = useSelector(state => state.user)
  const [formData, setFormData] = useState({})
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [zones, setZones] = useState([])
  const [branchPosition, setBranchPosition] = useState(0)

  useEffect(() => {

    const fetchZones = async () => {

      try {

        const res = await fetch('/api/zone/zones/' + company._id)
        const data = await res.json()

        if(data.success == false) {
          setError(data.message)
          return
        }

        setError(null)
        setZones(data.zones)

      } catch (error) {

        setError(error.message)
      }
    }

    const fetchLastBranchesPosition = async () => {

      try {


        const res = await fetch('/api/branch/get-branches-last-position/' + company._id)
        const data = await res.json()

        if(data.success === false) {

          setError(data.message)
          return
        }

        setBranchPosition(data.branchPosition)
        setError(null)

      } catch (error) {

        setError(error.message)

      }
    }


    fetchLastBranchesPosition()
    fetchZones()

  }, [company._id])

  const handleChange = (e) => {

    setFormData({

      ...formData,
      [e.target.id]: e.target.value

    })
  }

  const handleSubmit = async (e) => {

    e.preventDefault()

    try {

      setLoading(true)

      const res = await fetch('/api/branch/new-branch/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          position: branchPosition,
          company: company._id
        })
      })

      const data = await res.json()

      if(data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      await initializeProducts(e, data.branch)

      navigate('/sucursales')

    } catch (error) {

      setLoading(false)
      setError(error.message)
    }
  }

  const initializeProducts = async (e, branch) => {

    e.preventDefault()

    try {

      setLoading(true)

      const res = await fetch('/api/product/price/initialize-prices/' + company._id + '/' + branch._id, {

        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await res.json()

      if(data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      setError(null)
      setLoading(false)

    } catch(error) {

      setError(error)
      setLoading(false)
    }
  }

  useEffect(() => {

    document.title = 'Registro de Sucursal'
  })

  return (

    <main className="p-3 max-w-lg mx-auto">

        <h1 className='text-3xl text-center font-semibold my-7'>

          Registro de sucursal

        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" name="branch" id="branch" placeholder="Nombre de sucursal" className='border p-3 rounded-lg' onChange={handleChange} />
          <input type="text" name="location" id="location" placeholder="https://maps.app.goo.gl/YU99bo6wYVY9AMdL6" className='border p-3 rounded-lg' onChange={handleChange} />
          <input type="tel" name="phoneNumber" id="phoneNumber" placeholder="Ingresa el teléfono de la sucursal" className='border p-3 rounded-lg' onChange={handleChange} />
          <input type="number" name="p" id="p" placeholder="%" step={0.001} className='border p-3 rounded-lg' onChange={handleChange} />
          <input type="text" name="rentDay" id="rentDay" placeholder="Día de renta" className='border p-3 rounded-lg' onChange={handleChange} />
          <input type="number" name="rentAmount" id="rentAmount" placeholder="Monto de renta" className='border p-3 rounded-lg' onChange={handleChange} />
          <input type="number" name="position" id="position" defaultValue={branchPosition} disabled className='border p-3 rounded-lg' onChange={handleChange} />
          <select name="zone" id="zone" className='border p-3 rounded-lg'>
          {zones && zones.length == 0 ? <option> No hay zonas registradas </option> : ''}
          {zones && zones.length > 0 && zones.map((zone) => (

            <option selected={zone._id == currentUser._id ? 'selected' : ''} key={zone.id} value={zone._id}>{zone.name}</option>

          ))}
        </select>
          <button disabled={loading} className="bg-button text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
            {loading ? 'Cargando...' : 'Registrar'}
          </button>
        </form>

        {error && <p className='text-red-500 mt-5'>{error}</p>}



    </main>
  )
}
