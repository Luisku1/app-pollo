import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLogin } from '../hooks/useLogin'
import { ToastInfo } from '../helpers/toastify'


export default function RegistroDueño() {
  const [formData, setFormData] = useState({})
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1); // 1: phone, 2: empleado existente, 3: registro completo
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const { login } = useLogin();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  // Paso 1: Verifica si el teléfono ya es empleado
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/employee/get-by-phone/' + formData.phoneNumber);
      const data = await res.json();
      setLoading(false);
      if (data.success && data.data) {
        setUserProfile(data.data);
        setStep(2);
      } else {
        setUserProfile(null);
        setStep(3);
      }
    } catch (err) {
      setLoading(false);
      setError('Error al verificar el número.');
    }
  };

  // Paso 2: Si es empleado, pide nombre de empresa y navega
  const handleEmpresaSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (userProfile) {
        const res = await fetch('/api/company/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.company, userRef: userProfile._id })
        });
        const data = await res.json();
        setLoading(false);
        if (data.success && data.data) {
          navigate('/inicio-sesion');
        } else {
          if (data.message.includes('duplicate key error')) {
            setError('Ya existe una empresa con ese nombre para este usuario.');
          } else {
            setError('Error al crear la empresa.');
          }
        }
      } else {
        setLoading(false);
        ToastInfo('Perfil nuevo, por favor completa el registro');
      }
    } catch (err) {
      setLoading(false);
      setError('Error al continuar.');
    }
  };

  // Paso 3: Registro completo y login
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/owner-sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success === false) {
        setError(data.message);
        setLoading(false);
        return;
      }
      setLoading(false);
      setError(null);
      // Login automático tras registro
      await login({ phoneNumber: formData.phoneNumber, password: formData.password });
    } catch (err) {
      setLoading(false);
      setError('Error al registrar.');
    }
  };

  useEffect(() => {

    document.title = 'Registro de Dueños'
  })

  console.log('userProfile', userProfile);

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className='text-3xl text-center font-semibold my-7'>Registro</h1>

      {step === 1 && (
        <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-2">
          <h2 className='font-semibold text-sm'>Número de teléfono</h2>
          <input type="tel" name="phoneNumber" id="phoneNumber" placeholder='Número de Teléfono' className='border p-3 rounded-lg' onChange={handleChange} required />
          <button disabled={loading} className="bg-button text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
            {loading ? 'Verificando...' : 'Continuar'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleEmpresaSubmit} className="flex flex-col gap-2">
          <h2 className='font-semibold text-sm'>
            {userProfile && (
              <span className="text-blue-700 font-bold">
                {userProfile.name}
                {userProfile.lastName ? ` ${userProfile.lastName}` : ''}
              </span>
            )}
            {", ya eres empleado de una empresa, tu perfil será sincronizado"}
          </h2>
          <h2 className='font-semibold text-sm'>Nombre de tu empresa</h2>
          <input type="text" name="company" id="company" placeholder='Nombre de tu empresa' className='border p-3 rounded-lg' onChange={handleChange} required />
          <button disabled={loading} className="bg-button text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
            {loading ? 'Cargando...' : 'Continuar'}
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-2">
          <h2 className='font-semibold text-sm'>Nombres</h2>
          <input type="text" name="name" id="name" placeholder="Nombres" className='border p-3 rounded-lg' onChange={handleChange} required />
          <h2 className='font-semibold text-sm'>Apellidos</h2>
          <input type="text" name="lastName" id="lastName" placeholder='Apellidos' className='border p-3 rounded-lg' onChange={handleChange} required />
          <h2 className='font-semibold text-sm'>Negocio o empresa</h2>
          <input type="text" name="company" id="company" placeholder='Nombre de tu empresa' className='border p-3 rounded-lg' onChange={handleChange} required />
          <h2 className='font-semibold text-sm'>Contraseña</h2>
          <input type="password" name="password" id="password" placeholder='Contraseña' className='border p-3 rounded-lg' onChange={handleChange} required />
          <button disabled={loading} className="bg-button text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
            {loading ? 'Cargando...' : 'Registrarse'}
          </button>
        </form>
      )}

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
