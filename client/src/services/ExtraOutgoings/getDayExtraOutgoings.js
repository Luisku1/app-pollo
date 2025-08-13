export const getDayExtraOutgoingsFetch = async ({ companyId, date }) => {

  try {

    const res = await fetch('/api/outgoing/get-extra-outgoings/' + companyId + '/' + date)
    const data = await res.json()

    if (data.success === false) {

      return { extraOutgoings: [], totalExtraOutgoings: 0 }

    }

    return { extraOutgoings: data.extraOutgoings, totalExtraOutgoings: data.totalExtraOutgoings }

  } catch (error) {

    throw new Error('Error fetching extra outgoings')
  }
}