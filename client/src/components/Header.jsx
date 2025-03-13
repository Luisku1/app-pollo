import { GiChicken } from 'react-icons/gi'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useRef, useState } from 'react'
import DropdownItem from './DropdownItem'
import { MdOutlineMenu } from "react-icons/md";
import '../assets/dropdown.css'
import { useRoles } from '../context/RolesContext'
import ControlSupervisor from '../pages/ControlSupervisor'
import Modal from './Modals/Modal'
import Reporte from '../pages/Reporte'
import { signInSuccess } from '../redux/user/userSlice'
import { getSignedUser } from '../services/employees/getEmployeeUser'


export default function Header() {

  const { currentUser, company } = useSelector((state) => state.user)
  const [open, setOpen] = useState(false);
  const { roles, isSupervisor, isManager } = useRoles()
  let menuRef = useRef()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const toggleModal = () => setIsModalOpen((prev) => !prev)
  const toggleReportModal = () => setIsReportModalOpen((prev) => !prev)

  const dispatch = useDispatch()



  useEffect(() => {
    const getUserActualInfo = async () => {
      try {
        const user = await getSignedUser(currentUser._id);
        if (user?.role !== currentUser.role) {
          dispatch(signInSuccess({ ...user, fetched: true }));
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (currentUser && !currentUser.fetched) {
      getUserActualInfo();
    }
  }, [currentUser, dispatch])

  useEffect(() => {

    let handler = (e) => {
      if (!menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    }

  }, [currentUser, company])

  return (
    <>
      <header className='bg-header shadow-md sticky top-0 z-[9999]'>
        <div className='flex justify-between items-center mx-auto p-3 max-w-full'>
          <Link to='/'>
            <h1 className='font-bold text-sm sm:text-xl flex flex-wrap space-x-1 items-center'>
              <span className='text-orange-700'>{company ? company.name : 'Pio App'}</span>
              <GiChicken className='text-orange-400 h-7 w-7' />
            </h1>
          </Link>
          {roles && currentUser && isSupervisor(currentUser.role) &&
            <button onClick={toggleModal} className='flex-grow h-10 mx-4 bg-supervisor-button rounded transition-colors duration-300 font-semibold'>
              Supervisión
            </button>
          }
          {roles && currentUser && isManager(currentUser.role) &&
            <button onClick={toggleReportModal} className='flex-grow h-10 bg-supervisor-button mx-4 bg-report-button rounded transition-colors duration-300 font-semibold'>
              Reporte
            </button>
          }
          <div className='menu-container z-[10000]' ref={menuRef}>
            <div className="menu-trigger" onClick={() => { setOpen(!open) }}>
              <MdOutlineMenu className='w-5 h-5 mdoutline text-menu' />
            </div>
            <div className={`dropdown-menu z-[10000] ${open ? 'active' : 'inactive'}`} >
              <ul>
                {currentUser && roles ? (
                  <div>
                    <DropdownItem text={'Perfil'} link={'/perfil/' + currentUser._id} onClick={() => { setOpen(!open) }} />
                    <DropdownItem text={"Crear formato"} link={'/formato'} onClick={() => { setOpen(!open) }} />
                    {isSupervisor(currentUser.role) && (
                      <div>
                        <DropdownItem text={'Supervisión'} link={'/supervision-diaria'} onClick={() => { setOpen(!open) }} />
                        <DropdownItem text={'Registro Empleado'} link={'/registro-empleado'} onClick={() => { setOpen(!open) }} />
                        <DropdownItem text={'Registro Cliente'} link={'/registro-cliente'} onClick={() => { setOpen(!open) }} />
                        <DropdownItem text={'Registro Proveedor'} link={'/registro-proveedor'} onClick={() => { setOpen(!open) }} />
                        <DropdownItem text={'Sucursales'} link={'/sucursales'} onClick={() => { setOpen(!open) }} />
                        <DropdownItem text={"Reporte"} link={'/reporte'} onClick={() => { setOpen(!open) }} />
                      </div>
                    )}

                    {isManager(currentUser.role) && (
                      <div>
                        <DropdownItem text={"Nomina"} link={'/nomina'} onClick={() => { setOpen(!open) }} />
                        <DropdownItem text={"Cuentas"} link={'/listado-de-cuentas'} onClick={() => { setOpen(!open) }} />
                        <DropdownItem text={'Empleados'} link={'/empleados'} onClick={() => { setOpen(!open) }} />
                        <DropdownItem text={'Productos'} link={'/productos'} onClick={() => { setOpen(!open) }} />
                        <DropdownItem text={'Precios'} link={'/precios'} onClick={() => { setOpen(!open) }} />
                        <DropdownItem text={'Empresa'} link={'/empresas'} onClick={() => { setOpen(!open) }} />
                      </div>

                    )}
                  </div>
                ) : (
                  <DropdownItem text={'Inicio de Sesión'} link={'/inicio-sesion'} onClick={() => { setOpen(!open) }} />
                )}
              </ul>
            </div>
          </div>
        </div >
      </header >

      {isModalOpen && (
        <Modal
          content={<ControlSupervisor hideFechaDePagina={true} />}
          closeModal={toggleModal}
          ableToClose={true}
          lowerZIndex={true}
        />
      )}

      {isReportModalOpen && (
        <Modal
          content={<Reporte untitled={true} />}
          closeModal={toggleReportModal}
          ableToClose={true}
          lowerZIndex={true}
        />
      )}
    </>
  )
}
