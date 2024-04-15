import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { MdEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";

export default function Sucursales() {

  const { company } = useSelector((state) => state.user)
  const [branches, setBranches] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [buttonId, setButtonId] = useState(null)

  const navigate = useNavigate()

  const deleteBranch = async (branchId, index) => {

    setLoading(true)

    try {

      const res = await fetch('/api/branch/delete/' + branchId, {

        method: 'DELETE'

      })
      const data = await res.json()

      if (data.success === false) {

        setError(data.message)
        setLoading(false)
        return
      }


      branches.splice(index, 1)
      setError(null)
      setLoading(false)

    } catch (error) {

      setError(error.message)
      setLoading(false)
    }
  }

  useEffect(() => {

    const fetchBranches = async () => {

      try {

        const res = await fetch('/api/branch/get-branches/' + company._id)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          return
        }

        setBranches(data.branches)
        setError(null)

      } catch (error) {

        setError(error.message)
      }

    }

    fetchBranches()
  }, [company._id])

  return (
    <main className="p-3 max-w-lg mx-auto">

      {error ? <p>{error}</p> : ''}

      <div className="w-full">

        <button className='w-full bg-slate-500 text-white p-3 rounded-lg uppercase ' onClick={() => navigate('/registro-sucursal')}>Registra una sucursal</button>

      </div>

      <div>

        {branches && branches.length > 0 && branches.map((branch, index) => (

          <div className="my-4 bg-white p-4 grid grid-cols-12" key={branch._id}>

            <div className="col-span-10">
              <p className="text-2xl font-bold">{branch.branch}</p>

              <div className="p-3">
                <p className="text-lg">{'Día de renta: ' + branch.rentDay}</p>
                <p className="text-lg">{'Monto de renta: ' + parseFloat(branch.rentAmount).toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</p>
                <p className="text-lg">{'% ' + branch.p}</p>
                {branch.phoneNumber ?
                  <p className="text-lg">Teléfono: {branch.phoneNumber ? branch.phoneNumber.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3') : ''}</p>
                  : ''}
                <div className="flex gap-1 text-lg mt-2">
                  <p className="">Visítanos</p>

                  <a href={branch.location} target="_blank" rel="noopener noreferrer" className='text-blue-700'>aquí</a>
                </div>
              </div>
            </div>

            <div className="col-span-2 my-auto">
              <button type="submit" onClick={() => console.log('Edición de: ' + branch.branch + '/' + branch._id)} disabled={loading} className='bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3 '>
                <span >
                  <MdEdit className='text-blue-700 m-auto' />
                </span>
              </button>

              <div>
                <button id={branch._id} onClick={() => { setIsOpen(isOpen ? false : true), setButtonId(branch._id) }} disabled={loading} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                  <span>
                    <FaTrash className='text-red-700 m-auto' />
                  </span>
                </button>

                {isOpen && branch._id == buttonId ?
                  <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                    <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5'>
                      <div>
                        <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
                      </div>
                      <div className='flex gap-10'>
                        <div>
                          <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteBranch(branch._id, index), setIsOpen(isOpen ? false : true) }}>Si</button>
                        </div>
                        <div>
                          <button className='rounded-lg border shadow-lg w-20 h-10' onClick={() => { setIsOpen(isOpen ? false : true) }}>No</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  : ''}

              </div>

            </div>
          </div>

        ))}

      </div>




    </main>
  )
}