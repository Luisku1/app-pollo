import { ToastWarning } from "./toastify"

export const stringToCurrency = ({ amount }) => {

  return amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

export const priceShouldNotBeZero = () => {

  ToastWarning('El precio de los productos no debería de ser $0.00.')
}