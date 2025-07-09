import { useState } from "react";
import CustomerInfo from "../CustomerInfo";


export default function CustomerName({ customer, handleCustomerUpdate }) {
  const [showInfo, setShowInfo] = useState(false);

  if (!customer) return null;

  return (
    <div>
      <CustomerInfo customer={customer} toggleInfo={() => setShowInfo((prev) => !prev)} isShown={showInfo} handleCustomerUpdate={handleCustomerUpdate} />
      <button onClick={() => setShowInfo(true)}>
        <span className="font-bold text-md flex gap-1 text-green-700 items-center hover:underline">
          {customer.name} {customer.lastName}
        </span>
      </button>
    </div>
  );
}
