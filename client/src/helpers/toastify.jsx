import { ToastContainer, toast } from 'react-toastify';
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
    limit={1}
    position='top-center'

  ></ToastContainer>;
}

export { ToastInfo, ToastSuccess, ToastDanger, ToastWarning, ToastContainerComponent };
