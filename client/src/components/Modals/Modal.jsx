/* eslint-disable react/prop-types */
import { useEffect, useContext, useState, useRef } from "react";
import { MdCancel } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";
import SectionHeader from "../SectionHeader";
import { ModalContext } from "../../context/ModalContext";
import { v4 as uuidv4 } from "uuid";
import { AiOutlineCopy } from "react-icons/ai";
import { ToastSuccess } from "../../helpers/toastify";
import { toPng } from "html-to-image";

export default function Modal({
  content,
  title,
  closeModal,
  ableToClose = true,
  extraInformation,
  ableToCopy = false,
  closeOnEsc = true,
  closeOnClickOutside = true,
  closeOnClickInside = false,
  width = "11/12",
  fit = false,
  shape = "",
  loading = false,
  adjustForKeyboard = false,
  isShown = true,
  modalId, // Permite pasar un id opcional
}) {
  const { modals, addModal, removeLastModal, count, setCount } = useContext(ModalContext);

  const modalRef = useRef(null);
  const handleCopyModalImage = async () => {
    try {
      const node = modalRef?.current;
      if (!node) return;
      console.log("Copying modal image...");
      // Opcional: puedes clonar el nodo y ajustar el ancho si lo deseas
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);
      // Puedes mostrar un toast aquí si tienes uno
      ToastSuccess("Imagen copiada al portapapeles");
    } catch (error) {
      // ToastDanger("Hubo un error al copiar la imagen");
      console.error("Error copying modal image:", error);
    }
  };

  useEffect(() => {

    if (!isShown) return;
    addModal({ id: modalId });
    setCount((prevCount) => prevCount + 1);
    // Agrega la modal al stack al montar
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      // Solo la última modal debe cerrar con Escape
      if (
        ((event.key === "Escape" && ableToClose) || (closeOnEsc && event.key === "Escape")) &&
        (modals[modals.length - 1]?.id === modalId || modals.length === 1)
      ) {
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

    const handleResize = () => {
      if (adjustForKeyboard) {
        const viewportHeight = window.innerHeight;
        const modalElement = ref?.current;
        if (modalElement) {
          modalElement.style.top = `${(5 / 6) * viewportHeight}px`;
        }
      }
    };

    if (adjustForKeyboard) {
      window.addEventListener("resize", handleResize);
    }

    // Agregar eventos y estado falso al montar
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("popstate", handlePopState);
    history.pushState(null, "", window.location.href);

    // Limpiar eventos al desmontar
    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handlePopState);
      if (adjustForKeyboard) {
        window.removeEventListener("resize", handleResize);
      }
      setCount((prevCount) => prevCount - 1);
      // Quita la modal del stack al desmontar
      removeLastModal();
    };
  }, [ableToClose, closeModal, removeLastModal, isShown, modals.length, adjustForKeyboard]);

  if (!isShown) {
    return null;
  }
  const renderModal = () => {
    const zIndex = 1000 + count;
    return (
      <div
        className={`fixed transition-all 'backdrop-blur-xs' duration-200 inset-0 z-[10000] bg-opacity-10 bg-black overflow-y-auto  flex items-center justify-center pt-16`}
        style={adjustForKeyboard ? { alignItems: "flex-start" } : {}}
        onClick={(e) => {
          if (
            (closeOnClickOutside && e.target === e.currentTarget)
          ) {
            closeModal();
            removeLastModal();
          }
        }}
      >
        <div
          ref={modalRef}
          className={`bg-white shadow-lg h-auto max-h-[90vh] max-w-lg w-${width} overflow-y-auto relative overscroll-contain ${shape} rounded-lg border-2 border-gray-300'
          `}
          style={adjustForKeyboard ? { position: "absolute", top: "5/6" } : {}}
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
          {ableToCopy &&
            <div className="flex justify-end pr-4 pt-2">
              <button
                className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 text-sm"
                onClick={() => { handleCopyModalImage() }}
                title="Copiar modal como imagen"
              >
                <AiOutlineCopy className="w-5 h-5" />
                Copiar imagen
              </button>
            </div>
          }
          {ableToClose && (
            <button
              className="sticky top-0 right-0 text-gray-600 hover:text-gray-800 z-30"
              style={{ float: "right", margin: "10px" }}
              onClick={() => {
                closeModal();
                removeLastModal();
              }}
            >
              <MdCancel className="h-7 w-7" />
            </button>
          )}

          {extraInformation && extraInformation()}

          <div className={`${fit ? '' : 'px-1 mt-4 mb-4'}`}>
            {title && <SectionHeader label={title} />}
            <div>{content}</div>
          </div>
        </div>
      </div>
    );
  };

  return <div>{renderModal()}</div>;
}
