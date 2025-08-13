/* eslint-disable react/prop-types */
import './ShowBalance.css'
import { useSelector } from 'react-redux'
import { useRoles } from '../context/RolesContext'
import { currency } from '../helpers/Functions'
import { IoArrowDownCircleOutline, IoArrowUpCircleOutline } from 'react-icons/io5'

export default function ShowBalance({ balance }) {

  const { currentUser } = useSelector((state) => state.user)
  const { isManager } = useRoles()

  if ((!isManager(currentUser.role) && balance > 0) || !balance) return null

  const balanceClass = balance < 0 ? 'negative' : 'positive';

  return (
    <div className={`show-balance ${balanceClass} z-10`}>
      <div className="sb-wrapper">
        <div className="sb-label">
          {balance < 0 ? <IoArrowDownCircleOutline className="sb-icon" /> : <IoArrowUpCircleOutline className="sb-icon" />}
          <span>Balance</span>
        </div>
        <div className="sb-amount">{currency({ amount: balance })}</div>
      </div>
    </div>
  )
}
