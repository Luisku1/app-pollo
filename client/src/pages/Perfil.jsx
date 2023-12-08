import { useDispatch, useSelector } from 'react-redux'
import { signOutFailiure, signOutStart, signOutSuccess } from '../redux/user/userSlice'

export default function Perfil() {

  const {error} = useSelector((state) => state.user)
  const dispatch = useDispatch()

 const handleSignOut = async () => {

    try {

      dispatch(signOutStart())

      const res = await fetch('/api/auth/sign-out')

      const data = await res.json()

      if(data.success === false) {

        dispatch(signOutFailiure(data.message))
        return
      }

      dispatch(signOutSuccess())

    } catch (error) {

      dispatch(signOutFailiure(error.message))
    }

  }


  return (

    <main>

      <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>Sign out</span>
      <span>{error ? ' Error al fetch': ''}</span>

    </main>

  )
}
