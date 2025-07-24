import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { dateFromYYYYMMDD, formatDateYYYYMMDD, today } from '../../../common/dateOps';

const dateAwareRoutes = [
  '/formato/:date',
  '/formato/:branchId/:date',
  '/reporte/:date',
  '/nomina/:date',
  '/graficos/:date',
  '/supervision-diaria/:date',
];

const dateAwareBases = ['reporte', 'nomina', 'formato', 'graficos', 'supervision-diaria'];

// Extrae branchId y date desde pathname
function extractParamsFromPath(pathname, isDateAware) {
  const parts = pathname.split('/').filter(Boolean); // limpia los slashes vacíos
  const last = parts.at(-1);
  const secondLast = parts.at(-2);

  const isDate = /^\d{4}-\d{2}-\d{2}$/.test(last); // simple validación yyyy-mm-dd

  if (!isDate && isDateAware) return { date: formatDateYYYYMMDD(new Date()), branchId: null };
  const customCurrentDate = window.localStorage.getItem('customCurrentDate');
  if (!isDateAware) {
    return { date: customCurrentDate ? customCurrentDate : formatDateYYYYMMDD(new Date()), branchId: null };
  }

  if (!isDate) return { date: null, branchId: null };

  const date = last;
  const branchId = secondLast && !dateAwareBases.includes(secondLast) && secondLast?.length >= 6 ? secondLast : null;

  return { date, branchId };
}

function matchDateAwareRoute(pathname) {
  return dateAwareRoutes.some(route => {
    const base = route.replace('/:branchId', '').replace('/:date', '');
    return pathname.startsWith(base);
  });
}

function extractBase(pathname) {
  const match = dateAwareRoutes.find(route => {
    const base = route.replace('/:branchId', '').replace('/:date', '');
    return pathname.startsWith(base);
  });
  return match ? match.replace('/:branchId', '').replace('/:date', '') : '';
}

export function useDateNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const isDateAware = matchDateAwareRoute(location.pathname);
  const { date: urlDate, branchId } = extractParamsFromPath(location.pathname, isDateAware);

  const [isToday, setIsToday] = useState(false);
  // Si no es date-aware, inicializa con la fecha del datePicker (si existe en localStorage), si no, con hoy
  const getInitialDate = () => {
    if (urlDate) return urlDate;

    // En caso de !isdateAware, intenta recuperar la fecha persistida para no date-aware
    // Si hay una fecha persistida, úsala
    // Si no hay nada, regresa el día de hoy
    if (!isDateAware) {
      const persisted = window.localStorage.getItem('customCurrentDate');
      if (persisted) return persisted;
    }

    // Si no hay nada, regresa el día de hoy
    return formatDateYYYYMMDD(new Date());
  };

  const [currentDate, setCurrentDate] = useState(getInitialDate);

  useEffect(() => {
    if (currentDate) {
      const todayDate = formatDateYYYYMMDD(new Date());
      setIsToday(currentDate === todayDate);
    }
  }, [currentDate]);

  useEffect(() => {
    if (urlDate) {
      console.log('URL date:', urlDate);
      const formatted = formatDateYYYYMMDD(dateFromYYYYMMDD(urlDate));
      if (formatted !== currentDate) {
        setCurrentDate(formatted);
      }
    }
  }, [urlDate]);

  const setDate = (newDate) => {
    if (!isDateAware) {
      setCurrentDate(newDate);
      window.localStorage.setItem('fromNoDateAware', 'true');
      window.localStorage.setItem('customCurrentDate', newDate);
      return;
    }

    const newPath = getDateAwareLink(newDate);
    if (newDate !== currentDate && isDateAware) {

      window.localStorage.removeItem('customCurrentDate');
      window.localStorage.removeItem('fromNoDateAware');
      window.localStorage.setItem('fromDateAware', 'true');
      navigate(newPath);
    }
  };

  const prevDay = () => {
    const datePickerDate = dateFromYYYYMMDD(currentDate);
    datePickerDate.setDate(datePickerDate.getDate() - 1);
    setDate(formatDateYYYYMMDD(new Date(datePickerDate)));
  };

  const nextDay = () => {
    const datePickerDate = dateFromYYYYMMDD(currentDate);
    datePickerDate.setDate(datePickerDate.getDate() + 1);
    setDate(formatDateYYYYMMDD(new Date(datePickerDate)));
  };


  const getDateAwareLink = (newDate) => {
    const base = extractBase(location.pathname);
    if (!base) return location.pathname;

    if (branchId) {
      return `${base}/${branchId}/${newDate}`;
    } else {
      return `${base}/${newDate}`;
    }
  };
  // Estado para controlar si se registra para hoy o para la fecha seleccionada
  const dateFromYYYYMMDDFormat = currentDate ? dateFromYYYYMMDD(currentDate) : null;

  return {
    isDateAware,
    currentDate,
    dateFromYYYYMMDD: dateFromYYYYMMDDFormat,
    today: isToday,
    prevDay,
    nextDay,
    setDate,
    getDateAwareLink,
    branchId,
  };
}