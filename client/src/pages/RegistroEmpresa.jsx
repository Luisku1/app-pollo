import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { addCompany } from "../redux/user/userSlice"

export default function RegistroEmpresa() {

  const {currentUser} = useSelector(state => state.user)
  const [formData, setFormData] = useState({})
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

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


      const res = await fetch('api/company/create',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id
        })
      })

      const data = await res.json()

      if(data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }

      dispatch(addCompany(data))

      navigate('/registro-empleado')

    } catch (error) {

      setLoading(false)
      setError(error.message)
    }
  }

  useEffect(() => {

    document.title = 'Registro de Empresa'
  })

  return (
    <main>

      <div className="p-3 max-w-lg mx-auto">

        <h1 className='text-3xl text-center font-semibold my-7'>

          Registra tu empresa

        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" name="name" id="name" placeholder="Nombre de tu empresa" className='border p-3 rounded-lg' onChange={handleChange} />
          <button disabled={loading} className="bg-button text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
            {loading ? 'Cargando...' : 'Registrar'}
          </button>
        </form>

        {error && <p className='text-red-500 mt-5'>{error}</p>}

      </div>


    </main>
  )
}
