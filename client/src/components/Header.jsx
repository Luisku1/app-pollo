import { GiChicken } from 'react-icons/gi'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useEffect, useRef, useState } from 'react'
import DropdownItem from './DropdownItem'
import { MdOutlineMenu } from "react-icons/md";
import { MdKeyboardArrowRight, MdKeyboardArrowDown } from "react-icons/md";

import '../assets/dropdown.css'

export default function Header() {

  const [error, setError] = useState(null)
  const [roles, setRoles] = useState([])
  const [products, setProducts] = useState([])
  const { currentUser, company } = useSelector((state) => state.user)
  const [open, setOpen] = useState(false);
  const [providerIsOpen, setProviderIsOpen] = useState(false)
  const [reportIsOpen, setReportIsOpen] = useState(false)
  let menuRef = useRef();
  let supervisorRole
  let managerRole

  useEffect(() => {

    const fetchProducts = async () => {

      try {

        const res = await fetch('/api/product/get-products/' + company._id)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          return
        }

        setProducts(data.products)

      } catch (error) {

        setError(error.message)
      }
    }

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

    if (currentUser) {

      fetchRoles()
      fetchProducts()

    }

    let handler = (e) => {
      if (!menuRef.current.contains(e.target)) {
        setOpen(false);
        setProviderIsOpen(false)
      }
    };

    document.addEventListener("mousedown", handler);


    return () => {
      document.removeEventListener("mousedown", handler);
    }

  }, [currentUser, company])


  if (roles && error == null) {
    supervisorRole = roles.find((role) => (role.name == "Supervisor"))
    managerRole = roles.find((role) => (role.name == "Gerente"))

  }

  return (

    <header className='bg-slate-200 shadow-md'>
      <div className='flex justify-between items-center mx-auto p-3'>
        <Link to='/'>
          <h1 className='font-bold text-sm sm:text-xl flex flex-wrap space-x-1 items-center'>
            <span className='text-red-700'>{company ? company.name : 'Pio App'}</span>
            <GiChicken className='text-red-400 h-7 w-7' />
          </h1>
        </Link>

        <div className='menu-container z-10' ref={menuRef}>

          <div className="menu-trigger" onClick={() => { setProviderIsOpen(false), setReportIsOpen(false), setOpen(!open) }}>
            <MdOutlineMenu className='w-5 h-5 mdoutline' />
          </div>

          <div className={`dropdown-menu ${open ? 'active' : 'inactive'}`} >

            <ul>

              {currentUser ? (

                <div>

                  <DropdownItem text={'Perfil'} link={'/perfil/' + currentUser._id} onClick={() => { setOpen(!open) }} />

                  <DropdownItem text={"Crear formato"} link={'/formato'} onClick={() => { setOpen(!open) }} />

                  {supervisorRole && managerRole && (currentUser.role == supervisorRole._id || currentUser.role == managerRole._id) ? (

                    <div>

                      <DropdownItem text={'Supervisión'} link={'/supervision-diaria'} onClick={() => { setOpen(!open) }} />
                      <DropdownItem text={'Registro Empleado'} link={'/registro-empleado'} onClick={() => { setOpen(!open) }}/>

                        < div >
                        <div className='menu-trigger flex items-center justify-between' onClick={() => { setProviderIsOpen(!providerIsOpen) }}>
                          <DropdownItem text={'Entradas Proveedores'} link={'#'} />

                          {providerIsOpen ? <MdKeyboardArrowDown className='text-3xl' /> : <MdKeyboardArrowRight className='text-3xl' />}
                        </div>

                        <div className={`${providerIsOpen ? '' : 'hidden'} pl-2 text-m`}>
                          <ul className='border-l pl-5 border-gray-400'>
                            {products && products.length > 0 && products.map((product) => (


                              <DropdownItem key={product._id} text={product.name} link={'/entrada-inicial/' + product._id + '/' + product.name} onClick={() => { setProviderIsOpen(!providerIsOpen), setOpen(!open) }} />


                            ))}
                          </ul>
                        </div>
                      </div>

                    </div>

              ) : (

                <p></p>

              )}


              {managerRole && (currentUser.role == managerRole._id) ? (

                <div>

                  <div>
                    <div className='menu-trigger flex items-center justify-between' onClick={() => { setReportIsOpen(!reportIsOpen) }}>
                      <DropdownItem text={'Reporte'} link={'#'} />

                      {reportIsOpen ? <MdKeyboardArrowDown className='text-3xl' /> : <MdKeyboardArrowRight className='text-3xl' />}
                    </div>

                    <div className={`${reportIsOpen ? '' : 'hidden'} pl-2 text-m`}>
                      <ul className='border-l pl-5 border-gray-400'>
                        <DropdownItem text={"Gastos en cuentas"} link={'/gastos'} onClick={() => { setOpen(!open) }} />
                        <DropdownItem text={"Sobrante"} link={'/sobrante'} onClick={() => { setOpen(!open) }} />
                        <DropdownItem text={"Concentrado"} link={'/reporte'} onClick={() => { setOpen(!open) }} />
                      </ul>
                    </div>
                  </div>

                  <DropdownItem text={"Nomina"} link={'/nomina'} onClick={() => { setOpen(!open) }} />

                  <DropdownItem text={"Cuentas"} link={'/listado-de-cuentas'} onClick={() => { setOpen(!open) }} />

                  <DropdownItem text={'Empleados'} link={'/empleados'} onClick={() => { setOpen(!open) }} />

                  <DropdownItem text={'Sucursales'} link={'/sucursales'} onClick={() => { setOpen(!open) }} />

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
