import { ToastDanger } from "../../helpers/toastify"
import { signOutFetch } from "../../services/Auth/signOut"

export const useSignOut = () => {

  const signOut = () => {

    signOutFetch().catch((error) => {
      ToastDanger(error)
    })
  }

  return {signOut}
}