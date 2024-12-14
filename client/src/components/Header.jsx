import { GiChicken } from 'react-icons/gi'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useEffect, useRef, useState } from 'react'
import DropdownItem from './DropdownItem'
import { MdOutlineMenu } from "react-icons/md";
import '../assets/dropdown.css'
import { useRoles } from '../context/RolesContext'

export default function Header() {

  const { currentUser, company } = useSelector((state) => state.user)
  const [open, setOpen] = useState(false);
  const { roles } = useRoles()
  let menuRef = useRef();

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

    <header className='bg-slate-200 shadow-md sticky top-0 z-10'>
      <div className='flex justify-between items-center mx-auto p-3'>
        <Link to='/'>
          <h1 className='font-bold text-sm sm:text-xl flex flex-wrap space-x-1 items-center'>
            <span className='text-red-700'>{company ? company.name : 'Pio App'}</span>
            <GiChicken className='text-red-400 h-7 w-7' />
          </h1>
        </Link>

        <div className='menu-container z-30' ref={menuRef}>

          <div className="menu-trigger" onClick={() => { setOpen(!open) }}>
            <MdOutlineMenu className='w-5 h-5 mdoutline' />
          </div>

          <div className={`dropdown-menu ${open ? 'active' : 'inactive'}`} >

            <ul>

              {currentUser && roles ? (

                <div>

                  <DropdownItem text={'Perfil'} link={'/perfil/' + currentUser._id} onClick={() => { setOpen(!open) }} />

                  <DropdownItem text={"Crear formato"} link={'/formato'} onClick={() => { setOpen(!open) }} />

                  {(currentUser.role == roles.supervisorRole._id || currentUser.role == roles.managerRole._id) ? (

                    <div>

                      <DropdownItem text={'Supervisión'} link={'/supervision-diaria'} onClick={() => { setOpen(!open) }} />
                      <DropdownItem text={'Registro Empleado'} link={'/registro-empleado'} onClick={() => { setOpen(!open) }} />
                      <DropdownItem text={'Registro Cliente'} link={'/registro-cliente'} onClick={() => { setOpen(!open) }} />
                      <DropdownItem text={'Registro Proveedor'} link={'/registro-proveedor'} onClick={() => { setOpen(!open) }} />
                      <DropdownItem text={'Sucursales'} link={'/sucursales'} onClick={() => { setOpen(!open) }} />
                      <DropdownItem text={"Reporte"} link={'/reporte'} onClick={() => { setOpen(!open) }} />

                    </div>

                  ) : (

                    <p></p>

                  )}


                  {(currentUser.role == roles.managerRole._id) ? (

                    <div>


                      <DropdownItem text={"Nomina"} link={'/nomina'} onClick={() => { setOpen(!open) }} />

                      <DropdownItem text={"Cuentas"} link={'/listado-de-cuentas'} onClick={() => { setOpen(!open) }} />

                      <DropdownItem text={'Empleados'} link={'/empleados'} onClick={() => { setOpen(!open) }} />


                      <DropdownItem text={'Productos'} link={'/productos'} onClick={() => { setOpen(!open) }} />

                      <DropdownItem text={'Precios'} link={'/precios'} onClick={() => { setOpen(!open) }} />

                      <DropdownItem text={'Empresa'} link={'/empresas'} onClick={() => { setOpen(!open) }} />

                    </div>

                  ) : (

                    <p></p>

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

  )
}
