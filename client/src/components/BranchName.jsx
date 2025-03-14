/* eslint-disable react/prop-types */
import { MdStorefront } from "react-icons/md";

export default function BranchName({ branchName }) {
  return (
    <p className="text-md font-bold flex gap-1 items-center">
      <MdStorefront />
      {branchName}
    </p>
  )
}
