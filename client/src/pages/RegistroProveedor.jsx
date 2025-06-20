import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { ToastDanger, ToastSuccess } from "../helpers/toastify";

export default function RegistroProveedor({ provider, setProvider }) {
  const isEditing = !!provider;
  const { company } = useSelector(state => state.user)
  const [formData, setFormData] = useState(provider ? { ...provider } : {})
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEditing) setFormData({ ...provider })
  }, [provider])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    const form = document.getElementById('form')
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (isEditing) {
        ToastSuccess('Proveedor actualizado correctamente')
      } else {

        ToastSuccess('Proveedor registrado correctamente')
      }
      let res, data;
      if (isEditing) {
        res = await fetch(`/api/provider/update/${provider._id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, company: company._id })
          })
      } else {
        res = await fetch('/api/provider/create',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, company: company._id })
          })
      }
      data = await res.json()
      if (data.success === false) {
        if(data.statusCode === 500) {
          ToastDanger('Este proveedor ya existe. No se ha registrado')
        }
        setLoading(false)
        return
      }
      if (isEditing && setProvider) setProvider({ ...formData })
      if (!isEditing) setFormData({})
    } catch (error) {
      if (isEditing) {
        ToastDanger('Error al actualizar el proveedor')
        if (setProvider) setProvider(provider)
      } else {
        ToastDanger('Error al registrar el proveedor')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.title = isEditing ? 'Editar Proveedor' : 'Registro Proveedor'
  }, [isEditing])

  return (
    <main>

      <div className="p-3 max-w-lg mx-auto">

        <h1 className='text-3xl text-center font-semibold my-7'>

          {isEditing ? 'Editar Proveedor' : 'Registra un Nuevo Proveedor'}

        </h1>

        <form onSubmit={handleSubmit} id="form" className="flex flex-col gap-4">
          <input type="text" name="name" id="name" placeholder="Nombre del proveedor" className='border p-3 rounded-lg' onChange={handleChange} value={formData.name || ''} required />
          <input type="text" name="lastName" id="lastName" placeholder="Apellido (En caso de ser necesario)" className='border p-3 rounded-lg' onChange={handleChange} value={formData.lastName || ''} />
          <input type="text" name="location" id="location" placeholder="https://maps.app.goo.gl/YU99bo6wYVY9AMdL6" className='border p-3 rounded-lg' onChange={handleChange} value={formData.location || ''} />
          <input type="tel" name="phoneNumber" id="phoneNumber" placeholder="Teléfono del proveedor" className='border p-3 rounded-lg' required onChange={handleChange} value={formData.phoneNumber || ''} />
          <button disabled={loading} className="bg-button text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
            {loading ? 'Cargando...' : isEditing ? 'Actualizar' : 'Registrar'}
          </button>
        </form>

        {error && <p className='text-red-500 mt-5'>{error}</p>}

      </div>


    </main>
  )
}
