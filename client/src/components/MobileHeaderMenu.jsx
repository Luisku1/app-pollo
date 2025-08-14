import { useState, useRef, useEffect } from 'react';

import { FiMenu, FiLayers } from 'react-icons/fi';
import NetDifferenceCard from './statistics/NetDifferenceCard';
import Modal from './Modals/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signOutStart, signOutSuccess, signOutFailiure } from '../redux/user/userSlice';
import { useSignOut } from '../hooks/Auth/useSignOut';
import { useChangeCompany } from '../hooks/Auth/useChangeCompany';

export default function MobileHeaderMenu() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { signOut } = useSignOut();
  const { changeCompany } = useChangeCompany();

  const { currentUser, company } = useSelector((state) => state.user);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  // Modo comando local: Ctrl+. activa, Escape desactiva, Tab abre menú
  const [commandMode, setCommandMode] = useState(false);
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === '.' && e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
        if (!commandMode) setCommandMode(true);
      } else if (e.key === 'Escape') {
        setCommandMode(false);
        if (showMobileMenu) setShowMobileMenu(false);
      } else if (commandMode) {
        if (e.key === 'Tab') {
          e.preventDefault();
          setShowMobileMenu(true);
          setCommandMode(false);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandMode, showMobileMenu]);

  const menuRef = useRef(null);
  // Cerrar sesión
  const handleSignOut = async () => {
    try {
      dispatch(signOutStart());
      await signOut();
      dispatch(signOutSuccess());
      setShowMobileMenu(false);
      navigate('/inicio-sesion');
    } catch (error) {
      dispatch(signOutFailiure());
    }
  };


  // Nuevo: CompanySwitcher como toggle con Modal moderno
  function CompanySwitcher() {

    const [showCompanyModal, setShowCompanyModal] = useState(false);
    if (!currentUser.companies || currentUser.companies.length < 1) return null;
    const selectedCompany = currentUser.companies.find(c => c?._id === company?._id);

    const handleCompanyChange = (comp) => () => {
      changeCompany(comp._id, currentUser._id);
      setShowCompanyModal(false);
    };

    return (
      <>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-sm font-semibold w-full justify-between"
          onClick={() => setShowCompanyModal(true)}
        >
          <span className="truncate text-left">
            {selectedCompany ? selectedCompany.name : 'Selecciona empresa'}
          </span>
          <FiLayers size={20} className="text-blue-700" title="Elegir compañía" />
        </button>
        <Modal
          isShown={showCompanyModal}
          closeModal={() => setShowCompanyModal(false)}
          title="Empresas"
          width="96"
          fit
          content={
            <div className="flex flex-col gap-1 p-2">
              <div className="border-b my-1" />
              {currentUser.companies.map((comp) => (
                <button
                  key={comp._id}
                  className={`flex items-center gap-3 w-full px-3 py-3 rounded-lg text-left transition font-semibold border ${comp._id === company?._id ? 'bg-blue-600 text-white shadow border-blue-600' : 'bg-gray-50 text-gray-800 hover:bg-blue-100 border-gray-200'}`}
                  onClick={handleCompanyChange(comp)}
                >
                  {/* Avatar con iniciales de la empresa */}
                  <span className={`flex items-center justify-center w-9 h-9 rounded-full font-bold text-base ${comp._id === company?._id ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-700'}`}>
                    {comp.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                  <span className="flex flex-col text-left flex-1">
                    <span className={`font-semibold text-base ${comp._id === company?._id ? 'text-white' : 'text-blue-900'}`}>{comp.name}</span>
                    {comp._id === company?._id && <span className="text-xs text-blue-100 font-bold">Empresa actual</span>}
                  </span>
                </button>
              ))}
            </div>
          }
        />
      </>
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

  // Cambiar clases para que el menú esté disponible en todas las pantallas y se alinee correctamente
  return (
    <div className="w-full flex justify-end pr-2 xl:pr-0 xl:w-auto xl:static xl:justify-end">
      <div className="relative" ref={menuRef}>
        <button
          className="bg-white border border-gray-300 rounded-full px-3 py-2 shadow flex items-center gap-2"
          onClick={() => setShowMobileMenu((v) => !v)}
          title="Menú rápido"
        >
          <FiMenu size={22} />
          {commandMode && (
            <span className="absolute -top-3 -right-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg animate-pulse z-50">Tab</span>
          )}
        </button>
        {showMobileMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex flex-col py-2">
            <button
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 text-left w-full"
              onClick={() => { handleOptionClick(); navigate(`/perfil/${currentUser._id}`); }}
            >
              {/* Avatar con iniciales */}
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-base">
                {`${(currentUser.name?.[0] || '').toUpperCase()}${(currentUser.lastName?.[0] || '')?.toUpperCase()}`}
              </span>
              <span className="flex flex-col text-left">
                <span className="font-semibold text-sm">
                  {currentUser.name}{currentUser.lastName ? ` ${currentUser.lastName}` : ''}
                </span>
                <span className="text-xs text-gray-500">Ver perfil</span>
              </span>
            </button>
            <CompanySwitcher />
            <div className="border-t my-2" />
            <button
              className="block px-4 py-2 text-red-700 hover:bg-red-100 text-left w-full font-semibold"
              onClick={handleSignOut}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

