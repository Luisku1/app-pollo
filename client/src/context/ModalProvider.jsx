/* eslint-disable react/prop-types */
import { useState, useCallback } from 'react';
import { ModalContext } from './ModalContext';

const ModalProvider = ({ children }) => {
  const [modals, setModals] = useState([]);

  const addModal = useCallback((modal) => {
    setModals((prevModals) => [...prevModals, modal]);
  }, []);

  const removeLastModal = useCallback(() => {
    setModals((prevModals) => prevModals.slice(0, -1));
  }, []);

  return (
    <ModalContext.Provider value={{ modals, addModal, removeLastModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export default ModalProvider;