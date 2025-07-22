
import { useState, useRef, useEffect } from 'react';
import NetDifferenceCard from './statistics/NetDifferenceCard';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function MobileHeaderMenu() {
  const navigate = useNavigate();

  const { currentUser } = useSelector((state) => state.user);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef(null);

  // Helper for mobile company switch
  function CompanySwitcher() {
    if (!currentUser.companies || currentUser.companies.length < 2) return null;
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-500 font-semibold px-2">Cambiar de empresa</span>
        {currentUser.companies.map((comp) => (
          <button
            key={comp._id}
            className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${comp._id === company._id ? 'font-bold text-orange-600' : ''}`}
            onClick={() => dispatch(addCompany(comp))}
          >
            {comp.name}
          </button>
        ))}
      </div>
    );
  }

  // Cierra el menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMobileMenu(false);
      }
    }
    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileMenu]);

  // Cierra el menú al seleccionar una opción
  const handleOptionClick = () => setShowMobileMenu(false);

  return (
    <div className="xl:hidden w-full flex justify-end pr-2">
      <div className="relative" ref={menuRef}>
        <button
          className="bg-white border border-gray-300 rounded-full px-3 py-2 shadow flex items-center gap-2"
          onClick={() => setShowMobileMenu((v) => !v)}
          title="Menú rápido"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        {showMobileMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex flex-col py-2">
            <button
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-left w-full"
              onClick={() => { handleOptionClick(); navigate(`/perfil/${currentUser._id}`); }}
            >
              Perfil
            </button>
            <CompanySwitcher onSelect={handleOptionClick} />
            <div className="border-t my-2" />
            <div>
              <NetDifferenceCard inHeader />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

