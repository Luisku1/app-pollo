export const formatDate = (date) => {

  const actualLocaleDate = date

  return (actualLocaleDate.getFullYear() + '-' + (actualLocaleDate.getMonth() < 9 ? '0' + ((actualLocaleDate.getMonth()) + 1) : ((actualLocaleDate.getMonth()))) + '-' + ((actualLocaleDate.getDate() < 10 ? '0' : '') + actualLocaleDate.getDate()) + 'T06:00:00.000Z')
}

export const convertTZ = (date, tzString) => {

  return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", { timeZone: tzString }));
}

export const localTimeZone = () => {

  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export const getDayRange = (date) => {

  const principalDate = convertTZ(date, localTimeZone())

  console.log(localTimeZone())

  principalDate.setHours(0, 0, 0)

  const datePlusOne = new Date(principalDate)
  datePlusOne.setDate(datePlusOne.getDate() + 1)

  return {bottomDate: principalDate, topDate: datePlusOne}
}