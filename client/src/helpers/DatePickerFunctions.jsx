export const formatDate = (date) => {

  const actualLocaleDate = new Date(date)

  return (actualLocaleDate.getFullYear() + '-' + (actualLocaleDate.getMonth() < 9 ? '0' + ((actualLocaleDate.getMonth()) + 1) : ((actualLocaleDate.getMonth()))) + '-' + ((actualLocaleDate.getDate() < 10 ? '0' : '') + actualLocaleDate.getDate()) + 'T06:00:00.000Z')

}

export const today = (date) => {

  return formatDate(date) == formatDate((new Date())) ? true : false
}