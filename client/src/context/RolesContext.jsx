/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from "react";
import { getRoles } from "../services/Roles/getRoles";

// Crear el contexto
const RolesContext = createContext();

// Crear el proveedor
export const RolesProvider = ({ children }) => {
  const [roles, setRoles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getRoles()
      .then((response) => {
        setRoles(response);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);

  return (
    <RolesContext.Provider value={{ roles, loading, error }}>
      {children}
    </RolesContext.Provider>
  );
};

// Hook para usar el contexto en otros componentes
export const useRoles = () => {
  const context = useContext(RolesContext);
  if (!context) {
    throw new Error("useRoles debe ser usado dentro de RolesProvider");
  }
  return context;
};