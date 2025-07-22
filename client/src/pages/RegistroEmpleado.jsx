/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { weekDays } from '../helpers/Constants'
import { ToastSuccess } from '../helpers/toastify'
import { useRoles } from '../context/RolesContext'
import Select from 'react-select'
import { useUpdateEmployee } from '../hooks/Employees/useUpdateEmployee'
import { getArrayForSelects, getElementForSelect } from '../helpers/Functions'

export default function RegistroEmpleadoNuevo({ employee, setEmployee }) {

  const [formData, setFormData] = useState({ ...employee })
  const { company } = useSelector((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isEditing] = useState(employee ? true : false)
  const { roles } = useRoles()
  const day = new Date().getDay()
  const { updateEmployee: updateEmployeeFetch } = useUpdateEmployee()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const registerEmployee = async (employee) => {
    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employee),
      });

      const data = await res.json();

      if (data.success === false) {
        setError(data.message);
        return;
      }

      setError(null);
      ToastSuccess("Empleado registrado correctamente");
    } catch (error) {
      console.log(error);
      setError(error.message);
    }
  };

  const updateEmployee = async (updatedFields) => {
    // Solo enviar los campos modificados
    const changes = {};
    Object.keys(updatedFields).forEach((key) => {
      if (employee[key] !== updatedFields[key]) {
        changes[key] = updatedFields[key];
      }
    });
    if (Object.keys(changes).length === 0) return;
    // Optimistic update: actualiza el estado antes de la petición
    const prevEmployee = { ...employee };
    const role = Object.keys(roles).find(role => roles[role]._id == changes.role ? roles[role] : employee.role)
    const newEmployee = { ...employee, ...changes, role: roles[role] };

    setEmployee(newEmployee);

    try {

      await updateEmployeeFetch({ ...changes, _id: employee._id })
      setError(null)
    } catch (error) {
      setEmployee(prevEmployee); // Revertir si falla
      setError(error.message)
    }
  };

  const handleSubmit = async (e) => {

    const role = formData.role || employee?.role;
    const payDay = document.getElementById("payDay");

    console.log(role)

    e.preventDefault();
    setLoading(true);


    const data = {
      ...formData,
      role: role.value,
      payDay: payDay.value,
      company: company._id,
    };

    if (isEditing) {
      data._id = employee._id
      if (data.password === '') delete data.password
      setEmployee(prev => ({ ...prev, ...data }))
      await updateEmployee(data)

    } else {

      await registerEmployee(data)
    }

    setLoading(false);

  }

  useEffect(() => {
    if (!isEditing) document.title = "Registro de Empleado";
  }, [employee, isEditing]);

  return (
    <main className="p-4 sm:p-8 max-w-xl mx-auto bg-white rounded-2xl shadow-lg border text-base border-gray-200 animate-fade-in">
      <h1 className="text-3xl text-center font-bold my-6 text-blue-800 tracking-tight">
        {isEditing ? (
          <span className="w-full">
            Actualización de cuenta
            <br />
            <span className="text-employee-name">{`[${employee.name} ${employee.lastName}]`}</span>
          </span>
        ) : (
          "Registro de Empleado"
        )}
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="font-semibold text-gray-700">Nombres</label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name || ""}
            placeholder="Nombres"
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none text-base transition"
            onChange={handleChange}
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="lastName" className="font-semibold text-gray-700">Apellidos</label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            value={formData.lastName || ""}
            placeholder="Apellidos"
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none text-base transition"
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="phoneNumber" className="font-semibold text-gray-700">Número de teléfono</label>
          <input
            type="tel"
            name="phoneNumber"
            id="phoneNumber"
            placeholder="Ej: 55-1243-4567"
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none text-base transition"
            onChange={handleChange}
            value={formData.phoneNumber || ""}
          />
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
          <div className="flex-1 flex flex-col gap-1">
            <label htmlFor="role" className="font-semibold text-gray-700">Rol del empleado</label>
            <Select
              options={getArrayForSelects(Object.values(roles), (role) => role.name)}
              value={getElementForSelect(formData.role || employee?.role, (role) => role.name)}
              onChange={(selectedOption) => setFormData({ ...formData, role: selectedOption })}
              id='role'
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label htmlFor="salary" className="font-semibold text-gray-700">Salario</label>
            <input
              type="number"
              step={100}
              placeholder="$0.00"
              name="salary"
              id="salary"
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none text-base transition"
              onChange={handleChange}
              value={formData.salary || ""}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
          <div className="flex-1 flex flex-col gap-1">
            <label htmlFor="payDay" className="font-semibold text-gray-700">Día de pago</label>
            <select
              name="payDay"
              id="payDay"
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none text-base transition"
              value={formData.payDay || (isEditing ? employee?.payDay : day)}
              onChange={handleChange}
            >
              {weekDays &&
                weekDays.length > 0 &&
                weekDays.map((element, index) => (
                  <option key={index} value={index}>{element}</option>
                ))}
            </select>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label htmlFor="balance" className="font-semibold text-gray-700">Saldo (Deuda)</label>
            <input
              type="number"
              step={0.01}
              name="balance"
              id="balance"
              className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none text-base transition"
              onChange={handleChange}
              value={formData.balance || 0}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="font-semibold text-gray-700">Contraseña</label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Contraseña"
            className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none text-base transition"
            onChange={handleChange}
          />
        </div>
        <button
          disabled={loading}
          className="bg-blue-600 text-white p-3 rounded-lg uppercase font-semibold hover:bg-blue-700 transition disabled:opacity-70 mt-2 shadow-sm"
        >
          {loading
            ? <span className="flex items-center justify-center gap-2"><span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>Cargando...</span>
            : !employee
              ? "Registrar"
              : "Actualizar Información"}
        </button>
      </form>
      {error && <p className="text-red-500 mt-5 text-center font-medium animate-shake">{error}</p>}
    </main>
  );
}
