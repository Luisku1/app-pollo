export const formatDate = (date) => {

  const actualLocaleDate = date

  return (actualLocaleDate.getFullYear() + '-' + (actualLocaleDate.getMonth() < 9 ? '0' + ((actualLocaleDate.getMonth()) + 1) : ((actualLocaleDate.getMonth()))) + '-' + ((actualLocaleDate.getDate() < 10 ? '0' : '') + actualLocaleDate.getDate()) + 'T06:00:00.000Z')
}

export const convertTZ = (date) => {

  const tZDate = new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", { timeZone: 'America/Mexico_City' }));

  return tZDate.toISOString()
}

export const localTimeZone = () => {

  return Intl.DateTimeFormat().resolvedOptions().timeZone

}

export const getDayRange = (date) => {

  const principalDate = convertTZ(date ? date : new Date())
  const datePlusOne = new Date(principalDate)
  datePlusOne.setDate(datePlusOne.getDate() + 1)


  console.log(principalDate, datePlusOne.toISOString())

  return {bottomDate: principalDate, topDate: datePlusOne.toISOString()}
}

export const getMonthRange = (date) => {

  const principalDate = convertTZ(date ? date : new Date())
  const bottomDate = new Date(principalDate.getFullYear(), principalDate.getMonth(), 1)
  const topDate = new Date(principalDate.getFullYear(), principalDate.getMonth() + 1, 1)

  return {bottomDate: bottomDate.toISOString(), topDate: topDate.toISOString()}
}