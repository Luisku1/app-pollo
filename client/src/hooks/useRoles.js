import { useEffect, useState } from "react"
import { getRoles } from "../services/Roles/getRoles"

export const useRoles = () => {

  const [roles, setRoles] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {

    setLoading(true)

    getRoles().then((response) => {

      console.log(response)
      setRoles(response)

    }).catch((error) =>  {

      setError(error)
    })

    setLoading(false)

  }, [])

  return { roles, loading, error }
}