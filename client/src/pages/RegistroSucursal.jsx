
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

// Props: branch (objeto para editar), isEdit (bool), onClose (func), onUpdate (func)
export default function RegistroSucursal({ branch, isEdit = false, onClose, onUpdate }) {
  const { currentUser, company } = useSelector(state => state.user)
  const [formData, setFormData] = useState(branch ? { ...branch } : {})
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
        if (data.success == false) {
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
        if (data.success === false) {
          setError(data.message)
          return
        }
        setBranchPosition(data.branchPosition)
        setError(null)
      } catch (error) {
        setError(error.message)
      }
    }
    if (!isEdit) fetchLastBranchesPosition()
    fetchZones()
  }, [company._id, isEdit])

  // Sincroniza formData si cambia branch (en edición)
  useEffect(() => {
    if (isEdit && branch) setFormData({ ...branch })
  }, [branch, isEdit])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (isEdit) {
        // Actualizar sucursal existente
        const res = await fetch(`/api/branch/update/${branch._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, company: company._id })
        })
        const data = await res.json()
        if (data.success === false) {
          setError(data.message)
          setLoading(false)
          return
        }
        if (onUpdate) onUpdate(data.branch)
        if (onClose) onClose()
      } else {
        // Registrar nueva sucursal
        const res = await fetch('/api/branch/new-branch/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, position: branchPosition, company: company._id })
        })
        const data = await res.json()
        if (data.success === false) {
          setError(data.message)
          setLoading(false)
          return
        }
        await initializeProducts(e, data.branch)
        navigate('/sucursales')
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const initializeProducts = async (e, branch) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await fetch('/api/product/price/initialize-prices/' + company._id + '/' + branch._id, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (data.success === false) {
        setError(data.message)
        setLoading(false)
        return
      }
      setError(null)
      setLoading(false)
    } catch (error) {
      setError(error)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isEdit)
      document.title = 'Registro de Sucursal'

  }, [isEdit])

  return (
    <main className="p-4 sm:p-8 max-w-xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 animate-fade-in">
      <div className="flex items-center justify-between my-6">
        <h1 className="text-3xl font-bold text-blue-800 tracking-tight">
          {isEdit ? 'Editar sucursal' : 'Registro de sucursal'}
        </h1>
        {isEdit && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Activa</span>
            <button
              type="button"
              className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ${formData.active ? 'bg-blue-600' : 'bg-gray-300'}`}
              onClick={() => setFormData(f => ({ ...f, active: !f.active }))}
              tabIndex={0}
              aria-pressed={formData.active ? 'true' : 'false'}
            >
              <span
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${formData.active ? 'translate-x-5' : ''}`}
              />
            </button>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label htmlFor="branch" className="font-semibold text-gray-700">Nombre de sucursal</label>
          <input
            type="text"
            name="branch"
            id="branch"
            placeholder="Ej: Sucursal Centro"
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none text-base transition"
            onChange={handleChange}
            value={formData.branch || ''}
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="location" className="font-semibold text-gray-700">Ubicación (Google Maps)</label>
          <input
            type="text"
            name="location"
            id="location"
            placeholder="https://maps.app.goo.gl/..."
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none text-base transition"
            onChange={handleChange}
            value={formData.location || ''}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="phoneNumber" className="font-semibold text-gray-700">Teléfono</label>
          <input
            type="tel"
            name="phoneNumber"
            id="phoneNumber"
            placeholder="Ej: 555-123-4567"
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none text-base transition"
            onChange={handleChange}
            value={formData.phoneNumber || ''}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="p" className="font-semibold text-gray-700">Porcentaje (%)</label>
          <input
            type="number"
            name="p"
            id="p"
            placeholder="%"
            step={0.001}
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none text-base transition"
            onChange={handleChange}
            value={formData.p || ''}
          />
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
          <div className="flex-1 flex flex-col gap-1">
            <label htmlFor="rentDay" className="font-semibold text-gray-700">Día de renta</label>
            <input
              type="text"
              name="rentDay"
              id="rentDay"
              placeholder="Ej: Lunes"
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none text-base transition"
              onChange={handleChange}
              value={formData.rentDay || ''}
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label htmlFor="rentAmount" className="font-semibold text-gray-700">Monto de renta</label>
            <input
              type="number"
              name="rentAmount"
              id="rentAmount"
              placeholder="Ej: 1000"
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none text-base transition"
              onChange={handleChange}
              value={formData.rentAmount || ''}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
          <div className="flex-1 flex flex-col gap-1">
            <label htmlFor="position" className="font-semibold text-gray-700">Posición</label>
            <input
              type="number"
              name="position"
              id="position"
              disabled
              className="border border-gray-300 p-3 rounded-lg bg-gray-100 text-gray-500 text-base"
              value={isEdit ? formData.position || '' : branchPosition}
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label htmlFor="zone" className="font-semibold text-gray-700">Zona</label>
            <select
              name="zone"
              id="zone"
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none text-base transition"
              onChange={handleChange}
              value={formData.zone || ''}
            >
              {zones && zones.length === 0 ? <option> No hay zonas registradas </option> : ''}
              {zones && zones.length > 0 && zones.map((zone) => (
                <option key={zone._id} value={zone._id}>{zone.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            disabled={loading}
            className="bg-blue-600 text-white p-3 rounded-lg uppercase font-semibold hover:bg-blue-700 transition disabled:opacity-70 flex-1 shadow-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2"><span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>Guardando...</span>
            ) : isEdit ? 'Actualizar' : 'Registrar'}
          </button>
          {isEdit && onClose && (
            <button
              type="button"
              className="bg-gray-200 text-gray-700 p-3 rounded-lg uppercase font-semibold hover:bg-gray-300 transition flex-1 border border-gray-300"
              onClick={onClose}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
      {error && <p className="text-red-500 mt-5 text-center font-medium animate-shake">{error}</p>}
    </main>
  )
}
