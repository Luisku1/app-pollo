/* eslint-disable react/prop-types */
import { GrNext, GrPrevious } from "react-icons/gr";
import { useDate } from "../context/DateContext";
import { formatDate } from "../helpers/DatePickerFunctions";
import { useEffect } from "react";

export default function FechaDePagina({ changeDatePickerValue, changeDay, higherZ = false }) {

  const { currentDate, setCurrentDate } = useDate();

  const prevDay = () => {
    const datePickerDate = new Date(currentDate);
    datePickerDate.setDate(datePickerDate.getDate() - 1);
    setCurrentDate(datePickerDate.toISOString());
    changeDay(datePickerDate.toISOString());
  };

  const nextDay = () => {
    const datePickerDate = new Date(currentDate);
    datePickerDate.setDate(datePickerDate.getDate() + 1);
    setCurrentDate(datePickerDate.toISOString());
    changeDay(datePickerDate.toISOString());
  };

  return (
    <div className={`sticky top-[4rem] w-fit mx-auto bg-opacity-60 bg-menu ${higherZ ? 'z-30' : 'z-20'}`}>
      <p className="font-bold text-center text-lg">
        {(new Date(currentDate)).toLocaleDateString('es-mx', { month: 'long' }) + ', ' + (new Date(currentDate)).toLocaleDateString('es-mx', { weekday: 'long' })}
      </p>
      <div className="flex justify-center gap-1">
        <button className="w-5" onClick={prevDay}><GrPrevious className="w-full" /></button>
        <input
          className="p-1"
          type="date"
          name="date"
          id="date"
          onChange={changeDatePickerValue}
          value={formatDate(currentDate).slice(0, 10)}
        />
        <button className="w-5" onClick={nextDay}><GrNext className="w-full" /></button>
      </div>
    </div>
  );
}