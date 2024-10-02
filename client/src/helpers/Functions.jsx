export const stringToCurrency = ({ amount }) => {

  return amount.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})
}