import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useLogin } from '../hooks/useLogin'

export default function InicioSesion() {

  const [formData, setFormData] = useState({})
  const { loading, error } = useSelector((state) => state.user)
  const { login } = useLogin();

  const handleChange = (e) => {

    setFormData({

      ...formData,
      [e.target.id]: e.target.value,

    })
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(formData);
  }

  useEffect(() => {

    document.title = 'Inicia Sesión'
    const numberInput = document.getElementById('phoneNumber')
    numberInput.focus()
  }, [])

  return (

    <main className="p-3 max-w-lg mx-auto">

      <h1 className='text-3xl text-center font-semibold my-7'>

        Inicia Sesión

      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <input type="tel" name="phoneNumber" id="phoneNumber" placeholder='Número telefónico' className='border p-3 rounded-lg' onChange={handleChange} />
        <input type="password" name="password" id="password" placeholder='Contraseña' className='border p-3 rounded-lg' onChange={handleChange} />

        <button disabled={loading} className="bg-button text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
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
