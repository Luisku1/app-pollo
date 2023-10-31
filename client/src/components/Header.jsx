import React from 'react'
import { GiChicken } from 'react-icons/gi'
import { Link } from 'react-router-dom'
import { CgProfile } from 'react-icons/cg'

export default function Header() {
  return (

    <header className='bg-slate-200 shadow-md'>
      <div className='flex justify-between items-center max-w-6xl mx-auto p-3'>
        <Link to='/'>
          <h1 className='font-bold text-sm sm:text-xl flex flex-wrap space-x-1 items-center'>
            <span className='text-red-400'>Maty</span>
            <span className='text-red-700'>Pollo</span>
            <GiChicken className='text-red-800 h-7 w-7'/>
          </h1>
        </Link>

        <ul className='flex gap-4 items-center'>
          <Link to='/inicio-sesion'>
            <li className='hidden sm:inline text-red-400 hover:underline'>Inicio de Sesión</li>
          </Link>
          <Link to='/registro'>
            <li className='hidden sm:inline text-red-400 hover:underline'>Registro</li>
          </Link>
          <Link to='/listado-de-cuentas'>
            <li className='text-red-400 hover:underline'>Cuentas diarias</li>
          </Link>
          <Link to='/perfil'>
            <li className='hidden sm:inline text-red-400 hover:underline'>
              <CgProfile className='text-black h-7 w-7'/>
            </li>
          </Link>
        </ul>
      </div>
    </header>

  )
}
