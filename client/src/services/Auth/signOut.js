export const signOutFetch = async () => {

    const res = await fetch('/api/auth/sign-out')
    const data = await res.json()

    if (data.success === false) {

      throw new Error(data.message)
    }


}