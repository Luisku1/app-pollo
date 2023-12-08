import { useEffect, useState } from 'react'

export default function RegistroEmpleadoNuevo() {

  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [roles, setRoles] = useState([])
  const day = new Date().getDay()
  const daysOfTheWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

  useEffect(() => {

    const fetchRoles = async () => {

      try {

        setLoading(true)

        const res = await fetch('/api/role/roles')
        const data = await res.json()

        if (data.success === false) {
          setError(data.message)
          setLoading(false)
          return
        }

        setRoles(data.roles)
        setLoading(false)
        setError(null)
      } catch (error) {

        setError(error.message)
        setLoading(false)

      }
    }
    fetchRoles()
  }, [])

  const handleChange = (e) => {

    setFormData({

      ...formData,
      [e.target.id]: e.target.value,
    })
  }

  const handleSubmit = (e) => {

    e.preventDefault()



  }

  return (

    <main>

      <div className="p-3 max-w-lg mx-auto">

        <h1 className='text-3xl text-center font-semibold my-7'>

          Registro de Empleado

        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" name="name" id="name" placeholder="Nombres" className='border p-3 rounded-lg' onChange={handleChange} />
          <input type="text" name="lastname" id="lastname" placeholder='Apellidos' className='border p-3 rounded-lg' onChange={handleChange} />
          <input type="tel" name="phoneNumber" id="phoneNumber" placeholder='Número de teléfono' className='border p-3 rounded-lg' onChange={handleChange} />

          <div className="flex items-center justify-between">

            <p>Rol del empleado:</p>
            <select name="role" id="role" className='border p-3 rounded-lg'>
              {roles && roles.length > 0 && roles.map((role) => (

                <option selected={role.name == 'Encargado' ? 'selected' : ""} key={role._id} value={role.name}>{role.name}</option>
              ))}
            </select>

          </div>

          <div className="flex items-center justify-between">

            <p>Salario:</p>
            <input type="number" step={100} defaultValue={1300} name="salary" id="salary" className='border p-3 rounded-lg' onChange={handleChange} />

          </div>

          <div className="flex items-center justify-between">

            <p>Día de pago:</p>
            <select name="payDay" id="payDay" className='border p-3 rounded-lg'>

              {daysOfTheWeek && daysOfTheWeek.length > 0 && daysOfTheWeek.map((element, index) => (

                <option key={index} value={element} selected={index == day - 1 ? 'selected' : ""}>{element}</option>
              ))}

            </select>

          </div>

          <div className="flex items-center justify-between">

            <p>Saldo:</p>
            <input type="number" step={0.01} defaultValue={0.0} name="balance" id="balance" className='border p-3 rounded-lg' onChange={handleChange} />

          </div>

          <input type="email" name="email" id="email" placeholder='ejemplo@gmail.com' className='border p-3 rounded-lg' onChange={handleChange} />
          <input type="password" name="password" id="password" placeholder='Contraseña' className='border p-3 rounded-lg' onChange={handleChange} />

          <button disabled={loading} className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
            {loading ? 'Cargando...' : 'Registrar'}
          </button>
        </form>

        {error && <p className='text-red-500 mt-5'>{error}</p>}

      </div>

    </main>
  )
}
