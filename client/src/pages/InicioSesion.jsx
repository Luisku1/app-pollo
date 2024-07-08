import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { signInStart, signInSuccess, signInFailiure, addCompany } from '../redux/user/userSlice'

export default function InicioSesion() {

  const [formData, setFormData] = useState({})
  const { loading, error } = useSelector((state) => state.user)
  const [roles, setRoles] = useState([])
  const navigate = useNavigate()
  const dispatch = useDispatch()
  let sellerRole


  useEffect(() => {

    const fetchRoles = async () => {

       try {

          const res = await fetch('/api/role/get')
          const data = await res.json()

          if (data.success === false) {
            dispatch(signInFailiure(data.message))
            return
          }

          setRoles(data.roles)

        } catch (error) {

          dispatch(signInFailiure(error.message))

        }
    }

    fetchRoles()

  }, [dispatch])


  if (roles) {

    sellerRole = roles.find((role) => (role.name == "Vendedor"))

  }

  const handleChange = (e) => {

    setFormData( {

      ...formData,
      [e.target.id]: e.target.value,

    })
  }

  const fetchCompanyByOwnerId = async (ownerId) => {

    try {

      const res = await fetch('/api/company/get-by-owner-id/' + ownerId)
      const data = await res.json()

      if(data.success === false) {

        dispatch(signInFailiure(data.message))
        return
      }

      dispatch(addCompany(data))

    } catch (error) {

      dispatch(signInFailiure(error.message))
    }
  }

  const fecthCompanyById = async (companyId) => {

    try {

      const res = await fetch('/api/company/get-by-id/' + companyId)
      const data = await res.json()

      if(data.success === false) {

        dispatch(signInFailiure(data.message))
        return
      }

      dispatch(addCompany(data))

    } catch (error) {

      dispatch(signInFailiure(error.message))
    }
  }


  const handleSubmit = async (e) => {

    e.preventDefault()

    try
    {
      dispatch(signInStart())

      if(formData.emailNumber == undefined || formData.password == undefined)
      {
        dispatch(signInFailiure('Llena todos los campos'))
        return
      }

      const res = await fetch('/api/auth/sign-in',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (data.success === false) {
        dispatch(signInFailiure(data.message))
        return
      }

      if(typeof data.company === 'undefined')
      {
        await fetchCompanyByOwnerId(data._id)

      } else {

        await fecthCompanyById(data.company)
      }

      dispatch(signInSuccess(data))


      if(data.role == sellerRole._id) {

        navigate('/formato')
        return
      }

      if(data.company != null) {

        navigate('/')
        return
      }

      navigate('/registro-empresa')

    } catch (error) {

      dispatch(signInFailiure(error.message))
    }
  }

  useEffect(() => {

    document.title = 'Inicia Sesión'
  })

  return (

    <main className="p-3 max-w-lg mx-auto">

      <h1 className='text-3xl text-center font-semibold my-7'>

        Inicia Sesión

      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <input type="text" name="emailNumber" id="emailNumber" placeholder='Correo electrónico o número telefónico' className='border p-3 rounded-lg' onChange={handleChange}/>
        <input type="password" name="password" id="password" placeholder='Contraseña' className='border p-3 rounded-lg' onChange={handleChange}/>

        <button disabled={loading} className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
          {loading ? 'Cargando...' : 'Iniciar Sesión'}
        </button>
      </form>

      <div className="flex gap-2 mt-5">
        <p>¿Eres empleador?</p>
        <Link to={"/registro"}>
          <span className="text-blue-700">Crea una cuenta</span>
        </Link>
      </div>

      {error && <p className='text-red-500 mt-5'>{error}</p>}

    </main>
  )
}
