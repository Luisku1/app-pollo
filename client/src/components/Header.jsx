import { GiChicken } from 'react-icons/gi'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useEffect, useRef, useState } from 'react'
import DropdownItem from './DropdownItem'
import { MdOutlineMenu } from "react-icons/md";
import '../assets/dropdown.css'

export default function Header() {

  const [error, setError] = useState(null)
  const [roles, setRoles] = useState([])
  const { currentUser, company} = useSelector((state) => state.user)
  const [open, setOpen] = useState(false);
  let menuRef = useRef();
  let supervisorRole
  let managerRole

  useEffect(() => {

    const fetchRoles = async () => {

      try {

        const res = await fetch('/api/role/get')
        const data = await res.json()

        if (data.success === false) {
          setError(data.message)
          return
        }

        setRoles(data.roles)
        setError(null)

      } catch (error) {

        setError(error.message)

      }
    }

    if(currentUser) {

      fetchRoles()

    }

    let handler = (e)=>{
      if(!menuRef.current.contains(e.target)){
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);


    return() =>{
      document.removeEventListener("mousedown", handler);
    }

  }, [currentUser])


  if(roles && error == null)
  {
    supervisorRole = roles.find((role) => ( role.name == "Supervisor" ))
    managerRole = roles.find((role) => (role.name == "Gerente"))

  }

  return (

    <header className='bg-slate-200 shadow-md'>
      <div className='flex justify-between items-center mx-auto p-3'>
        <Link to='/'>
          <h1 className='font-bold text-sm sm:text-xl flex flex-wrap space-x-1 items-center'>
            <span className='text-red-700'>{company ? company.name : 'Pio App'}</span>
            <GiChicken className='text-red-400 h-7 w-7'/>
          </h1>
        </Link>

        <div className='menu-container' ref={menuRef}>

          <div className="menu-trigger" onClick={()=>{setOpen(!open)}}>
            <MdOutlineMenu className='w-5 h-5 mdoutline'/>
          </div>

          <div className={`dropdown-menu ${open ? 'active' : 'inactive'}`} >

            <ul>

              {currentUser ? (

                <div>

                  <DropdownItem text={'Perfil'} link={'/perfil/' + currentUser._id} onClick={()=>{setOpen(!open)}} />

                  <DropdownItem text={"Crear formato"} link={'/formato'} onClick={()=>{setOpen(!open)}}/>

                  {supervisorRole && managerRole && (currentUser.role == supervisorRole._id || currentUser.role == managerRole._id) ? (

                    <div>


                      <DropdownItem text={'Supervisión'} link={'/supervision-diaria'} onClick={()=>{setOpen(!open)}}/>

                    </div>

                  ): (

                    <p></p>

                  )}


                  {managerRole && (currentUser.role == managerRole._id) ? (

                    <div>

                      <DropdownItem text={"Reporte"} link={'/reporte'} onClick={()=>{setOpen(!open)}}/>

                      <DropdownItem text={"Cuentas"} link={'/listado-de-cuentas'} onClick={()=>{setOpen(!open)}}/>

                      <DropdownItem text={'Empleados'} link={'/empleados'} onClick={()=>{setOpen(!open)}}/>

                      <DropdownItem text={'Sucursales'} link={'/sucursales'} onClick={()=>{setOpen(!open)}}/>

                      <DropdownItem text={'Productos'} link={'/productos'} onClick={()=>{setOpen(!open)}}/>

                      <DropdownItem text={'Precios'} link={'/precios'} onClick={()=>{setOpen(!open)}}/>

                      <DropdownItem text={'Empresa'} link={'/empresas'} onClick={()=>{setOpen(!open)}}/>

                    </div>

                  ): (

                    <p></p>

                  )}

                </div>

              ): (

                <DropdownItem text={'Inicio de Sesión'} link={'/inicio-sesion'} onClick={()=>{setOpen(!open)}}/>

              )}

            </ul>

          </div>
        </div>

      </div>
    </header>

  )
}
