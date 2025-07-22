import { createContext, useContext, useState } from "react";
import { formatDate } from "../helpers/DatePickerFunctions";
import { formatDateYYYYMMDD } from "../../../common/dateOps";

const DateContext = createContext();

export const DateProvider = ({ children }) => {
  const [currentDate, setCurrentDate] = useState(
    formatDateYYYYMMDD(new Date())
  );

  const handleDateChange = (date) => {

    if (!date) {
      setCurrentDate(formatDateYYYYMMDD(new Date()));
      return
    }
    setCurrentDate((date));
  };

  return (
    <DateContext.Provider value={{ currentDate, setDate: handleDateChange }}>
      {children}
    </DateContext.Provider>
  );
};

export const useDate = () => useContext(DateContext);
