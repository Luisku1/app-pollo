/* eslint-disable react/prop-types */
import { useEffect, useContext } from 'react';
import { MdCancel } from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';
import SectionHeader from '../SectionHeader';
import { ModalContext } from '../../context/ModalContext';

export default function Modal({
  content,
  title,
  closeModal,
  ref,
  ableToClose = true,
  extraInformation,
  closeOnClickOutside = true,
  closeOnClickInside = false,
  width = '11/12',
  shape = '',
  loading = false,
}) {
  const { modals, removeLastModal, count, setCount } = useContext(ModalContext);

  console.log(count)

  useEffect(() => {

    setCount((prevCount) => prevCount + 1);

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && ableToClose) {
        closeModal();
        removeLastModal();
      }
    };

    const handlePopState = () => {
      if (ableToClose) {
        closeModal();
        removeLastModal();
      } else {
        history.pushState(null, "", window.location.href); // Evita que regrese a la página anterior
      }
    };

    // Agregar eventos y estado falso al montar
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);
    history.pushState(null, "", window.location.href);

    // Limpiar eventos al desmontar
    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
      setCount((prevCount) => prevCount - 1);
    };
  }, [ableToClose, closeModal, removeLastModal, modals.length]);

  const renderModal = () => {
    const zIndex = 1000 + count;
    return (
      <div
        className={`fixed transition-all duration-200 inset-0 z-[10000] bg-black bg-opacity-30 overflow-y-auto backdrop-blur-sm flex items-center justify-center pt-16`}
        onClick={(e) => {
          if (closeOnClickOutside && e.target === e.currentTarget && ableToClose) {
            closeModal();
            removeLastModal();
          }
        }}
      >
        <div
          ref={ref}
          className={`bg-white p-5 shadow-lg h-auto max-h-[90vh] max-w-lg w-${width} overflow-y-auto relative overscroll-contain ${shape} '
          `}
          onClick={(e) => {
            if (closeOnClickInside && ableToClose) {
              closeModal();
              removeLastModal();
            } else {
              e.stopPropagation();
            }
          }}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50 h-full">
              <FaSpinner className="text-4xl animate-spin" />
            </div>
          )}

          {ableToClose && (
            <button
              className="sticky top-0 right-0 text-gray-600 hover:text-gray-800 z-30"
              style={{ float: 'right', margin: '10px' }}
              onClick={() => {
                closeModal();
                removeLastModal();
              }}
            >
              <MdCancel className="h-7 w-7" />
            </button>
          )}

          {extraInformation && extraInformation()}

          <div className="mt-4 mb-4">
            {title && <SectionHeader label={title} />}
            <div>{content}</div>
          </div>
        </div>
      </div>
    );
  };

  return <div>{renderModal()}</div>;
}