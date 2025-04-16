import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Función para mostrar una notificación de éxito
function ToastSuccess(message) {
  toast.success(message);
}

// Función para mostrar una notificación de peligro (danger)
function ToastDanger(message) {
  toast.error(message);
}

// Función para mostrar una notificación de advertencia (warning)
function ToastWarning(message) {
  toast.warning(message);
}

function ToastInfo(message) {
  toast.info(message)
}

// Componente que muestra el contenedor de notificaciones
function ToastContainerComponent() {
  return <ToastContainer
    draggable
    position='top-center' // Cambiar a bottom-center
    limit={2}
    closeOnClick
    autoClose={3000}
    transition={Bounce}
    style={{ zIndex: 11000, top: '4rem' }} // Añadir z-index alto
  ></ToastContainer>;
}

export { ToastInfo, ToastSuccess, ToastDanger, ToastWarning, ToastContainerComponent };
