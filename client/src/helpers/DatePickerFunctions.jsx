export const formatDate = (date) => {

  const actualLocaleDate = new Date(date)

  return (actualLocaleDate.getFullYear() + '-' + (actualLocaleDate.getMonth() < 9 ? '0' + ((actualLocaleDate.getMonth()) + 1) : ((actualLocaleDate.getMonth()) + 1)) + '-' + ((actualLocaleDate.getDate() < 10 ? '0' : '') + actualLocaleDate.getDate()) + 'T06:00:00.000Z')

}

export const formatInformationDate = (date) => {

  const pivotDate = new Date(date)

  return `${(isToday(pivotDate) ? 'Hoy. ' : '') + pivotDate.toLocaleDateString('es-mx', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })}`
}

export const formatSimpleDate = (date) => {

  const pivotDate = new Date(date)

  return pivotDate.toLocaleDateString('es-mx', {year: 'numeric', month: '2-digit', day: '2-digit'})
}

export const formatTime = (date) => {

  const pivotDate = new Date(date)

  return pivotDate.toLocaleTimeString('es-Mx')
}

export const formatDateAndTime = (date) => {

  const pivotDate = new Date(date)

  return `${pivotDate.toLocaleDateString('es-mx', {dateStyle: 'short'})} ${pivotDate.toLocaleTimeString('es-mx')}`
}

export const isToday = (date) => {

  return formatDate(date) == formatDate((new Date())) ? true : false
}