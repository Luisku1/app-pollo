export const deleteInputFetch = async (inputId) => {

  const res = await fetch(`/api/input/delete-input/${inputId}`, {

    method: 'DELETE'
  })

  const data = await res.json()


  if (data.success === false) {

    throw new Error(data.message);

  }
}