import { createContext, useContext, useState } from "react";
import { formatDate } from "../helpers/DatePickerFunctions";

const DateContext = createContext();

export const DateProvider = ({ children }) => {
  const [currentDate, setCurrentDate] = useState(
    formatDate(new Date())
  );

  const handleDateChange = (date) => {

    if (!date) {
      setCurrentDate(formatDate(new Date()));
      return
    }
    setCurrentDate(formatDate(date));
  };

  return (
    <DateContext.Provider value={{ currentDate, setCurrentDate: handleDateChange }}>
      {children}
    </DateContext.Provider>
  );
};

export const useDate = () => useContext(DateContext);
