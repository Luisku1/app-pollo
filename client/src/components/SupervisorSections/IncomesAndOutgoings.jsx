/* eslint-disable react/prop-types */
import { useState } from "react";
import Incomes from "../Incomes/Incomes";
import ExtraOutgoings from "../Outgoings/ExtraOutgoings";
import RegisterDateSwitch from "../RegisterDateSwitch";
import { useDateNavigation } from "../../hooks/useDateNavigation";

export default function IncomesAndOutgoings() {

  const { currentDate, today } = useDateNavigation();
  const [useToday, setUseToday] = useState(false);

  return (
    <div>
      {!today && (
        <div className="ml-4 mt-4">
          <RegisterDateSwitch multiswitch={true} useToday={useToday} setUseToday={setUseToday} />
        </div>
      )}
      <Incomes showDateSwitch={false} useToday={useToday} />
      <ExtraOutgoings showDateSwitch={false} useToday={useToday} />
    </div>
  )
}
