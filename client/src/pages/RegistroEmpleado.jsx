/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { weekDays } from '../helpers/Constants'
import { ToastSuccess } from '../helpers/toastify'
import { useRoles } from '../context/RolesContext'

export default function RegistroEmpleadoNuevo({ employee, setEmployee }) {

  const [formData, setFormData] = useState({ ...employee })
  const { company } = useSelector((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isEditing] = useState(employee ? true : false)
  const { roles } = useRoles()
  const day = new Date().getDay()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }

  const registerEmployee = async (employee) => {

    try {

      const res = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(employee)
      })

      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        return
      }

      setError(null)
      ToastSuccess('Empleado registrado correctamente')

    } catch (error) {

      setError(error.message)
    }
  }

  const updateEmployee = async (employee) => {

    if (formData == employee) return

    try {

      const res = await fetch('/api/employee/' + employee._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(employee)
      })

      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        return
      }

      setEmployee({...data.employee})
      setError(null)
      ToastSuccess('Empleado actualizado correctamente')

    } catch (error) {

      setError(error.message)
    }
  }

  const handleSubmit = async (e) => {

    const role = document.getElementById('role')
    const payDay = document.getElementById('payDay')

    e.preventDefault()
    setLoading(true)

    const data = {
      ...formData,
      role: role.value,
      payDay: payDay.value,
      company: company._id
    }

    if (isEditing) {
      data._id = employee._id
      if (data.password === '') delete data.password
      await updateEmployee(data)

    } else {

      await registerEmployee(data)
    }
  }

  useEffect(() => {

    if (!isEditing)
      document.title = 'Registro de Empleado'

  }, [employee, isEditing])

  return (

    <div className="p-3 max-w-lg mx-auto">

      <h1 className="text-3xl text-center font-semibold my-7 w-full">
        {isEditing ? (
          <span className="w-full">
            Actualización de cuenta
            <br />
            {`[${employee.name}]`}
          </span>
        ) : (
          'Registro de Empleado'
        )}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-base"> {/* Mantener el tamaño de la fuente */}
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name || ''}
          placeholder="Nombres"
          className="border p-2 rounded-lg text-sm" // Controlar padding y tamaño de fuente
          onChange={handleChange}
        />
        <input
          type="text"
          name="lastName"
          id="lastName"
          value={formData.lastName || ''}
          placeholder="Apellidos"
          className="border p-2 rounded-lg text-sm" // Controlar padding y tamaño de fuente
          onChange={handleChange}
        />
        <input
          type="tel"
          name="phoneNumber"
          id="phoneNumber"
          placeholder="Número de teléfono"
          className="border p-2 rounded-lg text-sm" // Controlar padding y tamaño de fuente
          onChange={handleChange}
          value={(formData.phoneNumber) || ''}
        />

        <div className="flex items-center justify-between">
          <p>Rol del empleado:</p>
          <select
            name="role"
            id="role"
            className="border p-2 rounded-lg text-sm"
          >
            {roles &&
              Object.values(roles).length > 0 &&
              Object.values(roles).map((role) => (
                <option
                  selected={isEditing && role._id == employee.role._id ? "selected" : role.name == 'Vendedor' ? 'selected' : ''}
                  key={role._id}
                  value={role._id}
                >
                  {role.name}
                </option>
              ))}
          </select>
        </div>

        <div className="flex items-center justify-between">
          <p>Salario:</p>
          <input
            type="number"
            step={100}
            placeholder="$0.00"
            name="salary"
            id="salary"
            className="border p-2 rounded-lg text-sm"
            onChange={handleChange}
            value={formData.salary || ''}
          />
        </div>

        <div className="flex items-center justify-between">
          <p>Día de pago:</p>
          <select
            name="payDay"
            id="payDay"
            className="border p-2 rounded-lg text-sm"
          >
            {weekDays &&
              weekDays.length > 0 &&
              weekDays.map((element, index) => (
                <option
                  key={index}
                  value={index}
                  selected={isEditing && index == employee?.payDay ? 'selected' : index == day ? 'selected' : ''}
                >
                  {element}
                </option>
              ))}
          </select>
        </div>

        <div className="flex items-center justify-between">
          <p>Saldo {'(Deuda)'}:</p>
          <input
            type="number"
            step={0.01}
            defaultValue={0.0}
            name="balance"
            id="balance"
            className="border p-2 rounded-lg text-sm"
            onChange={handleChange}
            value={formData.balance || 0}
          />
        </div>

        <input
          type="password"
          name="password"
          id="password"
          placeholder="Contraseña"
          className="border p-2 rounded-lg text-sm"
          onChange={handleChange}
        />

        <button
          disabled={loading}
          className="bg-button text-white p-2 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? 'Cargando...' : !employee ? 'Registrar' : 'Actualizar Información'}
        </button>
      </form>

      {error && <p className="text-red-500 mt-5 text-base">{error}</p>}
    </div>
  )
}
