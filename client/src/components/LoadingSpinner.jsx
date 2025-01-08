import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner">
      <i className="fas fa-spinner fa-spin"></i>
      <p>Cargando...</p>
    </div>
  );
};

export default LoadingSpinner;
