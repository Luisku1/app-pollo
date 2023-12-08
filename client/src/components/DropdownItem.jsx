/* eslint-disable react/prop-types */
import { Link } from "react-router-dom"

export default function DropdownItem(props) {
  return (

    <Link to={props.link}>
      <li className="dropdown-item text-red-700 hover:underline">
        {props.text}
      </li>
    </Link>
  )
}
