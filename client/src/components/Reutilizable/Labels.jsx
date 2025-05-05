/* eslint-disable react/prop-types */
import { Store } from "lucide-react"
import { CgProfile } from "react-icons/cg"
import { TbMoneybag } from "react-icons/tb"

export const BranchName = ({ branchName }) => {
  return (
    <p className="text-md font-bold flex gap-1 items-center">
      <Store />
      {branchName}
    </p>
  )
}

export const MoneyBag = () => {
  return <TbMoneybag className="text-orange-800" />
}

export const EmployeeName = ({ employeeName, onClick }) => {

  return <button onClick={onClick} className="font-bold text-md flex gap-1 truncate items-center"><span><CgProfile /></span>{employeeName}</button>
}