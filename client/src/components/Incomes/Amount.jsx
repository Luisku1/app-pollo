/* eslint-disable react/prop-types */
import { currency } from "../../helpers/Functions";
import { MoneyBag } from "../Reutilizable/Labels";

const Amount = ({ amount, className }) => {
  return <div className={`flex gap-1 items-center w-full ${className} ${amount > 0 ? '' : 'text-red-500 font-bold'}`}>
    <MoneyBag />
    <p>
      {currency(amount)}
    </p>
  </div>
};

export default Amount;