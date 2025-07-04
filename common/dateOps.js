export const isSameWeekDay = (d1, d2) => {

  const date1 = new Date(d1);
  const date2 = new Date(d2);

  return date1.getDay() === date2.getDay();
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

export const getWeekRange = (date, startWeekDay, shiftWeeks = 0) => {

  const formatedDate = formatDate(new Date(date || new Date()).toUTCString());
  const principalDate = new Date(formatedDate)
  const currentDayOfWeek = principalDate.getDay()

  const difference = (currentDayOfWeek >= startWeekDay)
    ? currentDayOfWeek - startWeekDay
    : 7 - (startWeekDay - currentDayOfWeek)

  if (!principalDate || isNaN(principalDate.getTime())) {
    throw new Error('Invalid date provided');
  }

  principalDate.setDate(principalDate.getDate() - difference)
  principalDate.setDate(principalDate.getDate() + shiftWeeks * 7)

  const topDate = new Date(principalDate.toISOString())
  topDate.setDate(topDate.getDate() + 7)

  if (principalDate.getUTCHours() == 0) {

    principalDate.setHours(6, 0, 0)
    topDate.setHours(6, 0, 0)
  }

  return {
    weekStart: principalDate.toISOString(),
    weekEnd: topDate.toISOString()
  }
}

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