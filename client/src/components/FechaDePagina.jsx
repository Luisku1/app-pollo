/* eslint-disable react/prop-types */
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { formatDate } from "../helpers/DatePickerFunctions";
import { useDateNavigation } from "../hooks/useDateNavigation";



export default function FechaDePagina() {
  const { currentDate, setDate, isDateAware } = useDateNavigation();

  const prevDay = () => {
    const datePickerDate = new Date(currentDate);
    datePickerDate.setDate(datePickerDate.getDate() - 1);
    setDate(datePickerDate);
  };

  const nextDay = () => {
    const datePickerDate = new Date(currentDate);
    datePickerDate.setDate(datePickerDate.getDate() + 1);
    setDate(datePickerDate);
  };

  console.log(currentDate)

  if (!isDateAware) return null;

  return (
    <div className={`w-fit mx-auto`}>
      <div className="flex items-center gap-2 bg-white bg-opacity-80 rounded-xl shadow-sm px-2">
        <button className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-black transition" onClick={prevDay} title="Día anterior">
          <MdChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-1">
            <input
              className="p-1 text-center text-lg font-bold bg-transparent outline-none border-none"
              type="date"
              name="date"
              id="date"
              onChange={setDate}
              value={formatDate(currentDate).slice(0, 10)}
              style={{ minWidth: 0 }}
            />
          </div>
          <span className="text-xs text-gray-500 font-semibold leading-none mt-0.5">
            {(new Date(currentDate)).toLocaleDateString('es-mx', { weekday: 'long' })}
          </span>
        </div>
        <button className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-black transition" onClick={nextDay} title="Día siguiente">
          <MdChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}