/* eslint-disable react/prop-types */

import { CgProfile } from "react-icons/cg"
import { MdStorefront } from "react-icons/md"
import { TbMoneybag } from "react-icons/tb"

export const BranchName = ({ branchName }) => {
  return (
    <span className="text-md font-bold flex gap-1 items-center">
      <MdStorefront />
      <span>{branchName}</span>
    </span>
  )
}

export const MoneyBag = () => {
  return <TbMoneybag className="text-orange-800" />
}

export const EmployeeName = ({ employeeName, onClick }) => {

  return <button onClick={onClick} className="font-bold text-md flex gap-1 text-employee-name items-center"><span><CgProfile /></span>{employeeName}</button>
}