import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function RegistroDueño() {

  const [formData, setFormData] = useState({})
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {

    setFormData({

      ...formData,
      [e.target.id]: e.target.value,

    })
  }

  const handleSubmit = async (e) => {

    e.preventDefault()

    try {
      setLoading(true)

      const res = await fetch('/api/auth/owner-sign-up',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        })

      const data = await res.json()

      if (data.success === false) {
        setError(data.message)
        setLoading(false)
        return
      }

      setLoading(false)
      setError(null)

      navigate('/inicio-sesion')

    } catch (error) {

      setLoading(false)
      setError(error.message)

    }

  }

  useEffect(() => {

    document.title = 'Registro de Dueños'
  })

  return (

    <div className="p-3 max-w-lg mx-auto">

      <h1 className='text-3xl text-center font-semibold my-7'>
        Regístro
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <h2 className='font-semibold text-sm'>Nombres</h2>
        <input type="text" name="name" id="name" placeholder="Nombres" className='border p-3 rounded-lg' onChange={handleChange} />
        <h2 className='font-semibold text-sm'>Apellidos</h2>
        <input type="text" name="lastName" id="lastName" placeholder='Apellidos' className='border p-3 rounded-lg' onChange={handleChange} />
        <h2 className='font-semibold text-sm'>Número de teléfono</h2>
        <input type="tel" name="phoneNumber" id="phoneNumber" placeholder='Número de Teléfono' className='border p-3 rounded-lg' onChange={handleChange} />
        <h2 className='font-semibold text-sm'>Negocio o empresa</h2>
        <input type="text" name="company" id="company" placeholder='Nombre de tu empresa' className='border p-3 rounded-lg' onChange={handleChange} />
        <h2 className='font-semibold text-sm'>Contraseña</h2>
        <input type="password" name="password" id="password" placeholder='Contraseña' className='border p-3 rounded-lg' onChange={handleChange} />

        <button disabled={loading} className="bg-button text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
          {loading ? 'Cargando...' : 'Registrarse'}
        </button>
      </form>

      <div className="flex gap-2 mt-5">
        <p>¿Ya tienes una cuenta?</p>
        <Link to={"/inicio-sesion"}>
          <span className="text-blue-700">Inicia sesión</span>
        </Link>
      </div>

      {error && <p className='text-red-500 mt-5'>{error}</p>}

    </div>
  )
}
