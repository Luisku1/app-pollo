/* eslint-disable react/prop-types */
import './ShowBalance.css'
import { useSelector } from 'react-redux'
import { useRoles } from '../context/RolesContext'
import { currency } from '../helpers/Functions'

export default function ShowBalance({ balance }) {

  const { currentUser } = useSelector((state) => state.user)
  const { isManager } = useRoles()

  if ((!isManager(currentUser.role) && balance > 0) || !balance) return null

  const balanceClass = balance < 0 ? 'negative' : 'positive';

  return (
    <div className={`show-balance ${balanceClass} z-10`}>
      <h2><span className="balance">{currency({ amount: balance })}</span></h2>
    </div>
  )
}
