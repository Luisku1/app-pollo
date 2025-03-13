export const getSignedUser = async (employeeId) => {
  try {
    const res = await fetch(`/api/employee/${employeeId}`)
    const data = await res.json()
    return data.data
  } catch (error) {
    console.log(error)
  }
}