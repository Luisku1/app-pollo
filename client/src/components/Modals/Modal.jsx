/* eslint-disable react/prop-types */
import { MdCancel } from 'react-icons/md'
import SectionHeader from '../SectionHeader'

export default function Modal({ content, title, closeModal, ref, ableToClose = true, extraInformation, lowerZIndex = false }) {

  const renderModal = () => {

    return (
      <div className={`fixed inset-0 ${lowerZIndex ? 'z-[40]' : 'z-[9000]'} ${lowerZIndex ? '' : 'bg-black bg-opacity-30 backdrop-blur-sm'} flex items-center justify-center pt-16`}>
        <div
          ref={ref}
          className={`bg-white p-5 rounded-lg shadow-lg w-full max-w-lg h-auto max-h-[calc(100vh-4rem)] overflow-y-auto relative`}
        >
          {/* Botón para cerrar */}
          {ableToClose && (
            <button
              className="sticky top-0 right-0 text-gray-600 hover:text-gray-800 z-30"
              style={{ float: 'right', margin: '10px' }}
              onClick={closeModal}
            >
              <MdCancel className="h-7 w-7" />
            </button>
          )}

          {extraInformation && extraInformation()}

          {/* Título y contenido */}
          <div className="mt-4 mb-4">
            {title && <SectionHeader label={title} />}
            <div>{content}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {renderModal()}
    </div>
  );
}