import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { formatDate } from '../helpers/DatePickerFunctions';
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

export function useDateNavigation({ fallbackToToday = true, branchId } = {}) {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  console.log('useDateNavigation', location.pathname, params);

  const isDateAware = matchDateAwareRoute(location.pathname);
  const paramDate = params.date;
  const [currentDate, setCurrentDate] = useState(new Date());

  // Sincroniza currentDate con paramDate (URL)
  useEffect(() => {
    if (paramDate && currentDate !== formatDate(paramDate)) {
      setCurrentDate(formatDate(paramDate));
    }
    if (!paramDate && fallbackToToday && currentDate !== formatDate(new Date())) {
      setCurrentDate(formatDate(new Date()));
    }
  }, [paramDate]);

  // Sobrescribe setDate para forzar string
  const setDate = (newDate) => {
    const dateStr = formatDate(newDate);
    if (!isDateAware && !dateAwareRoutes.some(route => location.pathname.startsWith(route.replace('/:date', '')))) return;
    const newPath = getDateAwareLink(dateStr);
    setCurrentDate(dateStr);
    navigate(newPath);
  };

  // Construye el link correcto con fecha
  const getDateAwareLink = (newDate) => {
    if (isDateAware && paramDate) {
      // Reemplaza solo el segmento de la fecha en el path
      if (branchId) {
        return location.pathname.replace(paramDate, `${branchId}/${newDate}`);
      }
      return location.pathname.replace(paramDate, newDate);
    } else {
      // Busca si la ruta base está en dateAwareRoutes
      const match = dateAwareRoutes.find(route => {
        let base = route.replace('/:date', '');
        base = base.replace('/:branchId', '');
        return location.pathname.startsWith(base);
      });
      if (match) {
        const base = match.replace('/:date', '');
        if (branchId) {
          return `${base}/${branchId}/${newDate}`;
        }
        return `${base}/${newDate}`;
      }
      // Si no es date-aware, regresa la ruta actual
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
