export const deleteOutputFetch = async (outputId) => {

  const res = await fetch(`/api/output/delete-output/${outputId}`, {

    method: 'DELETE'
  })
  const data = await res.json()


  if (data.success === false) {

    throw new Error(data.message);

  }
}