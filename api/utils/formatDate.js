export const formatDate = (date) => {

  const actualLocaleDate = convertTZ(new Date(date))

  return (actualLocaleDate.getFullYear() + '-' + (actualLocaleDate.getMonth() < 9 ? '0' + ((actualLocaleDate.getMonth()) + 1) : ((actualLocaleDate.getMonth()) + 1)) + '-' + ((actualLocaleDate.getDate() < 10 ? '0' : '') + actualLocaleDate.getDate()) + 'T06:00:00.000Z')
}

export const convertTZ = (date) => {

  return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", { timeZone: 'America/Mexico_City' }));
}

export const localTimeZone = () => {

  return Intl.DateTimeFormat().resolvedOptions().timeZone

}

export const today = (date) => {

  return formatDate(date) == formatDate((new Date())) ? true : false
}

export const getDayRange = (date) => {

  const formatedDate = formatDate(date ? (new Date((typeof date === "string" ? new Date(date) : date).toUTCString())) : (new Date()).toUTCString())
  const principalDate = convertTZ(new Date(formatedDate))
  const datePlusOne = new Date(principalDate.toISOString())
  datePlusOne.setDate(datePlusOne.getDate() + 1)

  if (principalDate.getUTCHours() == 0) {

    principalDate.setHours(6, 0, 0)
    datePlusOne.setHours(6, 0, 0)
  }

  console.log(principalDate.toISOString(), datePlusOne.toISOString())

  return { bottomDate: principalDate.toISOString(), topDate: datePlusOne.toISOString() }
}

export const getMonthRange = (date) => {

  const principalDate = convertTZ(date ? date : new Date())
  const bottomDate = new Date(principalDate.getFullYear(), principalDate.getMonth(), 1)
  const topDate = new Date(principalDate.getFullYear(), principalDate.getMonth() + 1, 1)

  return { bottomDate: bottomDate.toISOString(), topDate: topDate.toISOString() }
}