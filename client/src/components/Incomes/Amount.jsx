/* eslint-disable react/prop-types */
import { currency } from "../../helpers/Functions";
import MoneyBag from "../Icons/MoneyBag";

const Amount = ({ amount, className }) => {
  return <div className={`flex gap-1 items-center w-full ${className}`}>
    <MoneyBag />
    <p>
      {currency(amount)}
    </p>
  </div>
};

export default Amount;