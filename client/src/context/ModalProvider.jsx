/* eslint-disable react/prop-types */
import { useState, useCallback } from 'react';
import { ModalContext } from './ModalContext';

const ModalProvider = ({ children }) => {
  const [modals, setModals] = useState([]);
  const [count, setCount] = useState(0);

  const addModal = useCallback((modal) => {
    setModals((prevModals) => [...prevModals, modal]);
  }, []);

  const removeLastModal = useCallback(() => {
    setModals((prevModals) => prevModals.slice(0, -1));
  }, []);

  return (
    <ModalContext.Provider value={{ modals, addModal, removeLastModal, count, setCount }}>
      {children}
    </ModalContext.Provider>
  );
};

export default ModalProvider;