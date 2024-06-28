import { useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

export default function Empresas() {

  const {company} = useSelector((state) => state.user)
  const navigate = useNavigate()


  useEffect(() => {

    document.title = 'Empresas'
  })

  return (
    <main className="p-3 max-w-lg mx-auto">

      {!company ?

        <div className="w-full">

          <button className='w-full bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80 ' onClick={() => navigate('/registro-empresa')}>Registra tu empresa</button>

        </div>

        :

        <div className="bg-white rounded-lg p-3 shadow-lg text-lg">

          <h2 className="text-red-700">{company.name}</h2>
          <h3>{company.owner.name + ' ' + company.owner.lastName}</h3>
          <h3>{company.owner.phoneNumber.replace(/(\d{2})(\d{4})(\d{4})/,'$1-$2-$3')}</h3>

        </div>
      }

    </main>
  )
}
