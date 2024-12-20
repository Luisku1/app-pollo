import { ToastWarning } from "./toastify"

export const stringToCurrency = ({ amount }) => {

  return amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

export const priceShouldNotBeZero = () => {

  ToastWarning('El precio de los productos no debería de ser $0.00.')
}

export const getEmployeeFullName = (employee) => {
  const name = employee.name || ''
  const lastName = employee.lastName || ''
  return `${name} ${lastName}`.trim()
}

export const getElementForSelect = (element, getLabel) => {

  if(!element || !getLabel) return null

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