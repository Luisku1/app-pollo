import { ToastWarning } from "./toastify"

export const currency = (amount) => {

  const value = typeof amount === 'object' && amount !== null ? amount.amount : amount;
  if (typeof value !== 'number' || isNaN(value))
    return '$0.00';

  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
};

export const getId = (ref) => (typeof ref === 'object' && ref !== null ? ref._id : ref);

export const priceShouldNotBeZero = () => {

  ToastWarning('El precio de los productos no debería de ser $0.00.')
}

export const normalizeText = (text) => {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export const getEmployeeName = (employee) => {
  return employee?.name ?? ''
}

export const getEmployeeFullName = (employee) => {
  const name = employee?.name ?? ''
  const lastName = employee?.lastName ?? ''
  return `${name} ${lastName}`.trim()
}

export const getElementForSelect = (element, getLabel) => {

  if (!element || !getLabel) return null

  const value = element._id
  const label = getLabel(element)
  return { value, label, ...element }
}

export const getArrayForSelects = (array, getLabel) => {
  if (!array || !getLabel) return null
  return array.map((element) => {
    return getElementForSelect(element, getLabel)
  })
}

export const isNumeric = (value) => {
  return typeof value === 'number' && !isNaN(value);
};

