import { useNavigate, useLocation } from 'react-router-dom';
import { dateFromYYYYMMDD, formatDate, formatDateYYYYMMDD } from '../helpers/DatePickerFunctions';
import { useState, useEffect } from 'react';

// Lista de rutas que aceptan navegación por fecha. Puedes expandirla según tus páginas.
const dateAwareRoutes = [
  '/reporte/:date',
  '/formato/:date',
  '/nomina/:date',
  '/graficos/:date',
  '/supervision-diaria/:date',
  // Agrega aquí más rutas que acepten fecha
];

// Utilidad para saber si la ruta actual es date-aware
export default function matchDateAwareRoute(pathname) {
  // Simple: verifica si alguna ruta base está incluida en el pathname
  return dateAwareRoutes.some(route => {
    const base = route.replace('/:date', '');
    return pathname.startsWith(base);
  });
}

function extractDateFromPath(pathname) {
  const match = pathname.match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

export function useDateNavigation({ branchId } = {}) {
  const navigate = useNavigate();
  const location = useLocation();

  const isDateAware = matchDateAwareRoute(location.pathname);
  const extractedDate = extractDateFromPath(location.pathname);
  const [currentDate, setCurrentDate] = useState(formatDateYYYYMMDD(new Date()));

  useEffect(() => {
    if (extractedDate) {
      const normalizedParamDate = formatDateYYYYMMDD(dateFromYYYYMMDD(extractedDate));
      if (formatDate(currentDate) !== normalizedParamDate) {
        setCurrentDate(normalizedParamDate);
      }
    }
  }, [extractedDate]);

  const setDate = (newDate) => {
    const dateStr = formatDateYYYYMMDD(newDate);
    if (!isDateAware) return;
    const newPath = getDateAwareLink(dateStr);
    setCurrentDate(dateStr);
    navigate(newPath);
  };

  const getDateAwareLink = (newDate) => {
    if (isDateAware && extractedDate) {
      console.log(branchId)
      if (branchId) {
        console.log('Llego aquí')
        return location.pathname.replace(extractedDate, `${branchId}/${newDate}`);
      }
      return location.pathname.replace(extractedDate, newDate);
    } else {
      const match = dateAwareRoutes.find(route => {
        let base = route.replace('/:date', '');
        return location.pathname.startsWith(base);
      });
      if (match) {
        const base = match.replace('/:date', '');
        if (branchId) {
          return `${base}/${branchId}/${newDate}`;
        }
        return `${base}/${newDate}`;
      }
      return location.pathname;
    }
  };

  return {
    isDateAware,
    currentDate,
    setDate,
    getDateAwareLink,
  };
}