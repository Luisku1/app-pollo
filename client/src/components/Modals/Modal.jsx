/* eslint-disable react/prop-types */
import { useEffect, useContext } from 'react';
import { MdCancel } from 'react-icons/md';
import SectionHeader from '../SectionHeader';
import { ModalContext } from '../../context/ModalContext';

export default function Modal({ content, title, closeModal, ref, ableToClose = true, extraInformation }) {
  const { modals, removeLastModal } = useContext(ModalContext);
  const zIndex = 10000 + modals.length * 10;

  useEffect(() => {
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
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [ableToClose, closeModal, removeLastModal]);

  const renderModal = () => {
    return (
      <div className={`fixed transition-all duration-200 inset-0 z-[${zIndex}] bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center pt-16`}>
        <div
          ref={ref}
          className={`bg-white p-5 rounded-lg shadow-lg max-w-lg w-11/12 h-auto max-h-[calc(100vh-4rem)] overflow-y-auto relative`}
        >
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