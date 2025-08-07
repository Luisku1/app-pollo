import { useEffect, useState, useRef } from "react"
import { filterBranchesByName } from "../utils/branchFilter";
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { MdClear, MdEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import AddBranchButton from "../components/AddBranchButton";
import { useRoles } from "../context/RolesContext";
import { useExtraOutgoingsAvg } from "../hooks/ExtraOutgoings/useExtraOutgoingsAvg";
import BranchSaleAvg from "../components/BranchSaleAvg";
import BranchProviderInputsAvg from "../components/Sucursales/BranchProviderInputsAvg";
import BranchOutputsAvg from "../components/Sucursales/BranchOutputsAvg";
import BranchInputsAvg from "../components/Sucursales/BranchInputsAvg";

export default function Sucursales() {

  const { currentUser } = useSelector((state) => state.user)
  const { company } = useSelector((state) => state.user)
  const [branches, setBranches] = useState([])
  const { extraOutgoingsAvg } = useExtraOutgoingsAvg({ companyId: company._id })
  const [filteredBranches, setFilteredBranches] = useState([])
  const [filterString, setFilterString] = useState("");
  const searchBarRef = useRef(null);
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { isController } = useRoles()
  const [isOpen, setIsOpen] = useState(false)
  const [buttonId, setButtonId] = useState(null)

  const navigate = useNavigate()

  // Filtrado reutilizable y controlado
  useEffect(() => {
    setFilteredBranches(filterBranchesByName(branches, filterString));
  }, [branches, filterString]);

  const handleSearchBarChange = (e) => {
    setFilterString(e.target.value);
  };

  const clearSearchBar = () => {
    setFilterString("");
    if (searchBarRef.current) {
      searchBarRef.current.value = "";
      searchBarRef.current.focus();
    }
  };

  // Shortcut Ctrl+F para enfocar la barra de búsqueda
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (searchBarRef.current) {
          searchBarRef.current.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
        setFilteredBranches(data.branches)
        setError(null)

      } catch (error) {

        setError(error.message)
      }

    }

    fetchBranches()
  }, [company._id])

  useEffect(() => {
    document.title = 'Sucursales';
    if (searchBarRef.current) {
      searchBarRef.current.focus();
    }
  }, []);

  return (
    <main className="p-2 sm:p-4 w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center">
      {error && <div className="w-full max-w-2xl mb-4"><p className="bg-red-100 text-red-700 p-3 rounded-lg shadow text-center">{error}</p></div>}
      <div className="w-full max-w-2xl mb-4">
        <AddBranchButton onClick={() => navigate('/registro-sucursal')} loading={loading} />
      </div>
      {/* Sticky search bar, elegant and unified style */}
      <div className="sticky top-2 z-20 w-full max-w-2xl mb-6">
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 border-2 border-blue-400 rounded-xl px-3 py-2 shadow-lg focus-within:ring-2 focus-within:ring-blue-400 transition-all">
          <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            ref={searchBarRef}
            type="text"
            value={filterString}
            onChange={handleSearchBarChange}
            placeholder="Buscar sucursal... (Ctrl+F)"
            className="flex-1 h-10 px-2 text-lg bg-transparent outline-none text-blue-900 placeholder-blue-400 font-semibold"
            autoComplete="off"
            id="searchBarSucursales"
            style={{ letterSpacing: '0.5px' }}
          />
          {filterString && (
            <button
              type="button"
              className="h-8 w-8 text-blue-400 hover:text-blue-700 transition flex items-center justify-center rounded-full bg-white/70 border border-blue-200 shadow"
              onClick={clearSearchBar}
              tabIndex={-1}
              title="Limpiar búsqueda"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z" clipRule="evenodd" /></svg>
            </button>
          )}
        </div>
      </div>
      <div className="w-full max-w-2xl flex flex-col gap-6">
        {filteredBranches && filteredBranches.length > 0 ? filteredBranches.map((branch, index) => (
          <div key={branch._id} className="bg-white rounded-2xl shadow-lg border border-blue-100 p-5 flex flex-col sm:flex-row gap-4 hover:shadow-xl transition">
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="block w-3 h-3 rounded-full bg-blue-400"></span>
                <p className="text-xl sm:text-2xl font-bold text-blue-800 truncate">{branch.branch}</p>
              </div>
              {isController(currentUser.role) && (
                <div className="flex flex-wrap gap-2 mb-2">
                  <BranchSaleAvg branchId={branch._id} />
                  <BranchProviderInputsAvg branchId={branch._id} />
                  <BranchInputsAvg branchId={branch._id} />
                  <BranchOutputsAvg branchId={branch._id} />
                </div>
              )}
              <div className="flex flex-wrap gap-2 items-center text-sm">
                <span className="font-semibold text-gray-700">Promedio de gastos fuera de cuentas:</span>
                <span className="text-red-700 font-bold">{extraOutgoingsAvg.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-2 text-gray-700 text-base">
                <span>Día de renta: <span className="font-semibold">{branch.rentDay}</span></span>
                <span>Monto de renta: <span className="font-semibold">{parseFloat(branch.rentAmount).toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}</span></span>
                <span>% <span className="font-semibold">{branch.p}</span></span>
                {branch.phoneNumber && (
                  <span>Teléfono: <span className="font-semibold">{branch.phoneNumber.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3')}</span></span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 mt-3">
                <a className="text-blue-700 font-bold underline hover:text-blue-900 transition" target="_blank" rel="noopener noreferrer" href={'https://pioapp.onrender.com/precios-sucursal/' + branch._id}>Ver precios</a>
                <a href={branch.location} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-900 transition">Visítanos</a>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end justify-between min-w-[56px]">
              <button type="button" onClick={() => console.log('Edición de: ' + branch.branch + '/' + branch._id)} disabled={loading} className="bg-blue-50 border border-blue-200 shadow rounded-lg text-center h-10 w-10 flex items-center justify-center hover:bg-blue-100 transition">
                <MdEdit className="text-blue-700 text-xl" />
              </button>
              <button id={branch._id} onClick={() => { setIsOpen(isOpen ? false : true); setButtonId(branch._id); }} disabled={loading} className="bg-red-50 border border-red-200 shadow rounded-lg text-center h-10 w-10 flex items-center justify-center hover:bg-red-100 transition">
                <FaTrash className="text-red-700 text-xl" />
              </button>
              {isOpen && branch._id === buttonId && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center">
                  <div className="bg-white p-6 rounded-2xl flex flex-col justify-center items-center gap-6 shadow-xl border">
                    <p className="text-2xl font-semibold text-center">¿Estás seguro de borrar esta sucursal?</p>
                    <div className="flex gap-8">
                      <button className="rounded-lg bg-red-500 text-white shadow-lg w-24 h-10 font-bold text-lg hover:bg-red-600 transition" onClick={() => { deleteBranch(branch._id, index); setIsOpen(false); }}>Sí</button>
                      <button className="rounded-lg border shadow-lg w-24 h-10 font-bold text-lg" onClick={() => setIsOpen(false)}>No</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )) : (
          <div className="w-full text-center text-gray-500 py-10 text-lg">No hay sucursales registradas.</div>
        )}
      </div>
    </main>
  );
}