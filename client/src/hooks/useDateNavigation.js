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
function extractParamsFromPath(pathname) {
  const parts = pathname.split('/').filter(Boolean); // limpia los slashes vacíos
  const last = parts.at(-1);
  const secondLast = parts.at(-2);

  const isDate = /^\d{4}-\d{2}-\d{2}$/.test(last); // simple validación yyyy-mm-dd
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
  const { date: urlDate, branchId } = extractParamsFromPath(location.pathname);

  const [currentDate, setCurrentDate] = useState(() =>
    urlDate ? formatDateYYYYMMDD(new Date(urlDate)) : formatDateYYYYMMDD(new Date())
  );

  useEffect(() => {
    if (urlDate) {
      const formatted = formatDateYYYYMMDD(dateFromYYYYMMDD(urlDate));
      if (formatted !== currentDate) {
        setCurrentDate(formatted);
      }
    }
  }, [urlDate]);

  const setDate = (newDate) => {
    if (!isDateAware) return;
    const newPath = getDateAwareLink(newDate);
    if (newDate !== currentDate) {
      setCurrentDate(newDate);
      navigate(newPath);
    }
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
  const [registerDateMode, setRegisterDateMode] = useState(); // 'current' | 'today'
  const dateFromYYYYMMDDFormat = dateFromYYYYMMDD(currentDate);
  // Fecha efectiva para registro
  const registerDate = registerDateMode === 'today' ? new Date().toISOString() : dateFromYYYYMMDDFormat.toISOString();

  console.log(registerDate, registerDateMode);

  return {
    isDateAware,
    currentDate,
    dateFromYYYYMMDD: dateFromYYYYMMDDFormat,
    today: today(currentDate),
    setDate,
    registerDate,
    registerDateMode,
    setRegisterDateMode,
    getDateAwareLink,
    branchId,
  };
}