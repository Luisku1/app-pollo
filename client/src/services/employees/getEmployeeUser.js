export const getSignedUser = async (employeeId) => {
  try {
    const res = await fetch.get(`/api/employeee/${employeeId}`)
    const data = await res.json()
    return data.data
  } catch (error) {
    console.log(error)
  }
}