import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Función para mostrar una notificación de éxito
function ToastSuccess(message) {
  toast.success(message, { toastId: message }); // Reemplazar notificaciones anteriores
}

// Función para mostrar una notificación de peligro (danger)
function ToastDanger(message) {
  toast.error(message, { toastId: message }); // Reemplazar notificaciones anteriores
}

// Función para mostrar una notificación de advertencia (warning)
function ToastWarning(message) {
  toast.warning(message, { toastId: message }); // Reemplazar notificaciones anteriores
}

function ToastInfo(message) {
  toast.info(message, { toastId: message }); // Reemplazar notificaciones anteriores
}

// Componente que muestra el contenedor de notificaciones
function ToastContainerComponent() {
  return <ToastContainer
    draggable
    position='bottom-center' // Cambiar a bottom-center
    limit={2}
    newestOnTop={false} // Eliminar la primera notificación cuando se exceda el límite
    closeOnClick
    autoClose={2500}
    transition={Bounce}
    style={{ zIndex: 11000, opacity: 0.9 }} // Añadir transparencia
  ></ToastContainer>;
}

export { ToastInfo, ToastSuccess, ToastDanger, ToastWarning, ToastContainerComponent };
