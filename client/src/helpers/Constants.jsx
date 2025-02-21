export const weekDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export const customSelectStyles = {
  container: (provided) => ({
    ...provided,
    width: 'fit', // Fija el ancho del select
    borderRadius: '0.5rem',
    border: 'black'
  }),
  control: (provided) => ({
    ...provided,
    minHeight: 'auto', // Ajusta la altura del control
    height: 'fit', // Altura fija
    overflow: 'hidden', // Evita expansión
    borderRadius: '0.5rem',
    border: '1px solid black',
    padding: '.25rem',
    fontWeight: 'bold',
    fontSize: '16px'
  }),
  singleValue: (provided) => ({
    ...provided,
    whiteSpace: 'nowrap', // Evita el salto de línea
    overflow: 'hidden', // Oculta el desbordamiento
    textOverflow: 'ellipsis', // Agrega puntos suspensivos
  }),
  clearIndicator: (provided) => ({
    ...provided,
    cursor: 'pointer', // Asegura que el botón sea clickeable
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    // display: 'none', // Oculta el Dropdown Indicator
  }),
  placeholder: (provided) => ({
    ...provided,
    fontSize: '16px',
    color:'black',
    fontWeight: 'bold',
  }),
}