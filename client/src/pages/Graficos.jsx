/* eslint-disable react/prop-types */

import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart } from 'chart.js';
import { useEffect, useState, useRef } from 'react';
import { filterBranchesByName } from '../utils/branchFilter';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDate } from '../helpers/DatePickerFunctions';
import FechaDePagina from '../components/FechaDePagina';
import { useDateNavigation } from '../hooks/useDateNavigation';


// Registrar los plugins solo una vez
if (!Chart._zoomRegistered) {
  Chart.register(zoomPlugin);
  Chart.register(ChartDataLabels);
  Chart._zoomRegistered = true;
}

function BranchBarChart({ branchName, branchReports, showValues }) {
  const labels = branchReports.map(r => new Date(r.createdAt).toLocaleDateString());
  const incomes = branchReports.map(r => r.incomes);

  const data = {
    labels,
    datasets: [
      {
        label: 'Ingresos diarios',
        data: incomes,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 48,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `Ingresos: $${ctx.parsed.y.toFixed(2)}`
        }
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
        },
        limits: {
          x: { minRange: 2 },
        },
      },
      datalabels: showValues
        ? {
          anchor: 'end',
          align: 'top',
          color: '#1e293b',
          font: { weight: 'bold', size: 12 },
          formatter: value => `$${value.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`,
          display: true,
          clamp: true,
          clip: true,
        }
        : { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { weight: 'bold', size: 13 } }
      },
      y: {
        grid: { color: '#e5e7eb' },
        ticks: { color: '#64748b', font: { weight: 'bold', size: 13 } }
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg rounded-xl p-4 border border-blue-200 mb-6 w-full max-w-full min-h-[340px] flex flex-col">
      <h2 className="text-lg sm:text-xl font-bold text-blue-800 mb-2 text-center truncate">{branchName}</h2>
      <div className="flex-1 min-h-[220px] relative">
        <Bar data={data} options={options} plugins={[ChartDataLabels]} className="w-full h-full" style={{ height: '100%', width: '100%' }} />
      </div>
      <div className="text-xs text-gray-500 mt-2 text-center">Usa la rueda del ratón o pellizca para hacer zoom. Arrastra para desplazarte.</div>
    </div>
  );
}



export default function Graficos() {
  const { company } = useSelector((state) => state.user);
  const [branchesIncomes, setBranchesIncomes] = useState([]);
  const [showValues, setShowValues] = useState(false);
  const [filterString, setFilterString] = useState("");
  const searchBarRef = useRef(null);

  useEffect(() => {
    const getMonthBranchesIncomes = async () => {
      const date = (new Date()).toISOString();
      try {
        const res = await fetch('/api/branch/get-month-branches-incomes/' + company._id + '/' + date);
        const data = await res.json();
        if (data.success === false) {
          return;
        }
        setBranchesIncomes(data);
      } catch (error) {
        console.log(error);
      }
    };
    getMonthBranchesIncomes();
  }, [company]);



  const filteredBranches = filterBranchesByName(branchesIncomes, filterString);


  const clearSearchBar = () => {
    setFilterString("");
    if (searchBarRef.current) {
      searchBarRef.current.value = "";
      searchBarRef.current.focus();
    }
  };

  // Shortcut Ctrl+F para enfocar la barra de búsqueda
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (searchBarRef.current) {
          searchBarRef.current.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <main className="p-2 sm:p-4 w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-row items-center gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer select-none text-blue-900 font-medium">
          <span className="relative flex items-center">
            <input
              type="checkbox"
              checked={showValues}
              onChange={e => setShowValues(e.target.checked)}
              className="peer appearance-none w-5 h-5 border border-blue-400 rounded-md bg-white checked:bg-blue-600 checked:border-blue-600 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <svg className="absolute left-0 top-0 w-5 h-5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
          </span>
          <span>Mostrar valores sobre las barras</span>
        </label>
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 border-2 border-blue-400 rounded-xl px-3 py-2 shadow-lg focus-within:ring-2 focus-within:ring-blue-400 transition-all w-full max-w-md">
          <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            ref={searchBarRef}
            type="text"
            value={filterString}
            onChange={e => setFilterString(e.target.value)}
            placeholder="Buscar sucursal... (Ctrl+F)"
            className="flex-1 h-10 px-2 text-lg bg-transparent outline-none text-blue-900 placeholder-blue-400 font-semibold"
            autoComplete="off"
            id="searchBarGraficos"
            style={{ letterSpacing: '0.5px' }}
          />
          {filterString && (
            <button
              type="button"
              className="h-8 w-8 text-blue-400 hover:text-blue-700 transition flex items-center justify-center rounded-full bg-white/70 border border-blue-200 shadow"
              onClick={clearSearchBar}
              tabIndex={-1}
              title="Limpiar búsqueda"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z" clipRule="evenodd" /></svg>
            </button>
          )}
        </div>
      </div>
      <div id="chart" className="w-full max-w-4xl flex flex-col gap-6">
        {filteredBranches.length > 0 && filteredBranches.map((branch) => (
          <BranchBarChart key={branch._id} branchName={branch.branch} branchReports={branch.branchReports} showValues={showValues} />
        ))}
      </div>
    </main>
  );
}
