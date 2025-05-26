/* eslint-disable react/prop-types */
import { useEffect, useContext } from "react";
import { MdCancel } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";
import SectionHeader from "../SectionHeader";
import { ModalContext } from "../../context/ModalContext";

export default function Modal({
  content,
  title,
  closeModal,
  ref,
  ableToClose = true,
  extraInformation,
  closeOnEsc = true,
  closeOnClickOutside = true,
  closeOnClickInside = false,
  width = "11/12",
  fit = false,
  shape = "",
  loading = false,
  adjustForKeyboard = false,
  isShown = true,
}) {
  const { modals, removeLastModal, count, setCount } = useContext(ModalContext);

  useEffect(() => {

    if (!isShown) return;
    setCount((prevCount) => prevCount + 1);

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if ((event.key === "Escape" && ableToClose) || (closeOnEsc && event.key === "Escape")) {
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
            (e.target === e.currentTarget && ableToClose) ||
            (closeOnClickOutside && e.target === e.currentTarget)
          ) {
            closeModal();
            removeLastModal();
          }
        }}
      >
        <div
          ref={ref}
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
