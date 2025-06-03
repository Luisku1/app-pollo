import { MdOutlineAccessTimeFilled, MdCalendarMonth } from "react-icons/md";

export const formatDate = (date) => {

  const actualLocaleDate = new Date(date)

  return (actualLocaleDate.getFullYear() + '-' + (actualLocaleDate.getMonth() < 9 ? '0' + ((actualLocaleDate.getMonth()) + 1) : ((actualLocaleDate.getMonth()) + 1)) + '-' + ((actualLocaleDate.getDate() < 10 ? '0' : '') + actualLocaleDate.getDate()) + 'T06:00:00.000Z')
}

export const formatInformationDate = (date) => {

  const pivotDate = new Date(formatDate(date))

  return `${(isToday(pivotDate) ? 'Hoy. ' : '') + pivotDate.toLocaleDateString('es-mx', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })}`
}

export const formatReviewDate = (date) => {

  const pivotDate = new Date(formatDate(date))

  return <p className="flex items-center"><MdCalendarMonth />{(isToday(pivotDate) ? 'Hoy. ' : '') + pivotDate.toLocaleDateString('es-mx', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
}

export const formatSimpleDate = (date) => {

  const pivotDate = new Date(date)

  return pivotDate.toLocaleDateString('es-mx', {year: 'numeric', month: '2-digit', day: '2-digit'})
}

export const formatTime = (date) => {

  const pivotDate = new Date(date)

  return <p className="flex items-center">{<MdOutlineAccessTimeFilled />} {pivotDate.toLocaleTimeString('es-MX', { hour12: false })}</p>
}

export const formatDateAndTime = (date) => {

  const pivotDate = new Date(date)

  return `${pivotDate.toLocaleDateString('es-mx', {dateStyle: 'short'})} ${pivotDate.toLocaleTimeString('es-mx')}`
}

export const isToday = (date) => {

  return formatDate(date) == formatDate((new Date())) ? true : false
}

export const getDayRange = (date, shiftDays = 0) => {

  const formatedDate = formatDate(new Date(date || new Date()).toUTCString());
  const principalDate = new Date(formatedDate)
  principalDate.setDate(principalDate.getDate() + shiftDays)
  const datePlusOne = new Date(principalDate.toISOString())
  datePlusOne.setDate(datePlusOne.getDate() + 1)

  if (principalDate.getUTCHours() == 0) {

    principalDate.setHours(6, 0, 0)
    datePlusOne.setHours(6, 0, 0)
  }

  return { bottomDate: principalDate.toISOString(), topDate: datePlusOne.toISOString() }
}