/* eslint-disable react/prop-types */
import MoneyBag from "../Icons/MoneyBag";
import { currency } from "../helpers/Functions";

const Amount = ({ amount, className }) => {
  return (
    <p className={`${className}`}>
      <MoneyBag /> {currency(amount)}
    </p>
  );
};

export default Amount;