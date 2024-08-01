export const formatDate = (date) => {

  const actualLocaleDate = date

  return (actualLocaleDate.getFullYear() + '-' + (actualLocaleDate.getMonth() < 9 ? '0' + ((actualLocaleDate.getMonth()) + 1) : ((actualLocaleDate.getMonth()))) + '-' + ((actualLocaleDate.getDate() < 10 ? '0' : '') + actualLocaleDate.getDate()) + 'T06:00:00.000Z')
}

export const convertTZ = (date) => {

  return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", { timeZone: 'America/Mexico_City' }));
}

export const localTimeZone = () => {

  return Intl.DateTimeFormat().resolvedOptions().timeZone

}

export const getDayRange = (date) => {

  const principalDate = convertTZ(date)
  const datePlusOne = new Date(principalDate)
  datePlusOne.setDate(datePlusOne.getDate() + 1)

  principalDate.setHours(6,0,0)
  datePlusOne.setHours(6,0,0)

  return {bottomDate: principalDate.toISOString(), topDate: datePlusOne.toISOString()}
}

export const getMonthRange = (date) => {

  const principalDate = convertTZ(date)
  const bottomDate = new Date(principalDate.getFullYear(), principalDate.getMonth(), 1)
  const topDate = new Date(principalDate.getFullYear(), principalDate.getMonth() + 1, 1)

  console.log(bottomDate, topDate)

  return {bottomDate: bottomDate.toISOString(), topDate: topDate.toISOString()}
}