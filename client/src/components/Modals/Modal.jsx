/* eslint-disable react/prop-types */
import { MdCancel } from 'react-icons/md'
import SectionHeader from '../SectionHeader'

export default function Modal({ content, title, closeModal, ref, ableToClose = true, extraInformation }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-10 max-w-lg mx-auto">
      <div
        ref={ref}
        className="bg-white p-5 rounded-lg shadow-lg w-11/12 h-auto max-h-[90vh] overflow-y-auto relative"
      >
        {/* Botón para cerrar */}
        {ableToClose && (
          <button
            className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
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
  );
}