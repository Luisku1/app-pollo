import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { fetchBasicDailyResume } from "../services/fetchBasicDailyResume";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { formatDateYYYYMMDD } from "../../../common/dateOps";
import Modal from "../components/Modals/Modal";
import IncomesList from "../components/Incomes/IncomesList";
import ExtraOutgoingsList from "../components/Outgoings/ExtraOutgoingsList";
import { formatInformationDate } from "../helpers/DatePickerFunctions";

const DailyResumePage = () => {
  const [page, setPage] = useState(1);
  const { company } = useSelector((state) => state.user);
  console.log(company)
  const companyId = company?._id;
  const [incomesToShow, setIncomesToShow] = useState(null);
  const [outgoingsToShow, setOutgoingsToShow] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dailyResume", companyId, page],
    queryFn: () => fetchBasicDailyResume(companyId, page),
    keepPreviousData: true,
  });
  const firstDate = data && data.length > 0 ? new Date(data[data.length - 1].date) : null;
  const lastDate = data && data.length > 0 ? new Date(data[0].date) : null;

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));

  useEffect(() => {
    if (data && data.length > 0) {
      const firstDate = new Date(data[data.length - 1].date);
      const lastDate = new Date(data[0].date);
      document.title = `Resumen ${firstDate.toLocaleDateString()} - ${lastDate.toLocaleDateString()}`;
    }
  }, [data]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading data</div>;

  const chartOptions = data ? [...data].reverse() : [];
  // Preparar datos para el gráfico
  const chartData = {
    labels: chartOptions?.map((resume) =>
      new Date(resume.date).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Ingresos - Gastos Extra",
        data: chartOptions?.map(
          (resume) => resume.totalIncomes - resume.totalExtraOutgoings
        ),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        onClick: (index) => {
          setIncomesToShow(chartOptions[index].incomesArray);
        }
      },
      {
        label: "Ingresos Verificados",
        data: chartOptions?.map((resume) => resume.totalVerifiedIncomes),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        onClick: (index) => {
          setIncomesToShow(chartOptions[index].incomesArray);
        }
      },
      {
        label: "Gastos Extra",
        data: chartOptions?.map((resume) => resume.totalExtraOutgoings),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        onClick: (index) => {
          setOutgoingsToShow(chartOptions[index].extraOutgoingsArray);
        }
      },
    ],
  };

  // Evento onClick para el gráfico
  const handleBarClick = (_, elements) => {
    if (elements && elements.length > 0) {
      const chart = elements[0];
      const index = chart.index;
      const datasetIndex = chart.datasetIndex;
      const dataset = chartData.datasets[datasetIndex];
      if (dataset && typeof dataset.onClick === 'function') {
        dataset.onClick(index);
      }
    }
  }

  return (
    <div className="daily-resume-page p-4">
      <h1 className="text-2xl font-bold mb-6">Resumen</h1>
      {firstDate && lastDate && (
        <div className="mb-6 text-gray-700 text-lg font-medium">
          Mostrando semana {" "}
          <span className="font-bold">
            {firstDate.toLocaleDateString()}
          </span>{" "}
          a{" "}
          <span className="font-bold">
            {lastDate.toLocaleDateString()}
          </span>
        </div>
      )}
      {incomesToShow && incomesToShow.length > 0 &&
        <Modal
          closeModal={() => setIncomesToShow(null)}
          closeOnClickOutside={true}
          closeOnClickInside={false}
          closeOnEsc={true}
          title={`Ingresos (${formatInformationDate(incomesToShow[0]?.createdAt)})`}
          content={<IncomesList incomes={incomesToShow} />}
          isOpen={incomesToShow !== null}
        />
      }
      {outgoingsToShow && outgoingsToShow.length > 0 &&
        <Modal
          closeModal={() => setOutgoingsToShow(null)}
          closeOnClickOutside={true}
          closeOnClickInside={false}
          title={`Gastos (${formatInformationDate(outgoingsToShow[0]?.createdAt)})`}
          closeOnEsc={true}
          content={<ExtraOutgoingsList extraOutgoings={outgoingsToShow} />}
          isOpen={outgoingsToShow !== null}
        />
      }
      {/* Gráfico */}
      <div className="chart-container mb-8">
        <Bar
          data={chartData}
          options={{
            responsive: true,
            onClick: handleBarClick,
            plugins: {
              legend: { position: 'top' },
              title: { display: false },
            },
          }}
        />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.map((resume, index) => {
          const url = `/reporte/${formatDateYYYYMMDD(new Date(resume.date))}`;
          return (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="card bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg rounded-lg p-6 border border-blue-200 cursor-pointer block hover:shadow-xl transition"
              style={{ textDecoration: "none" }}
            >
              <h2 className="text-xl font-bold text-blue-800 mb-4">
                {new Date(resume.date).toLocaleDateString('es-mx', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })}
              </h2>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Ingresos Totales:</span>
                  <span className="text-blue-700 font-semibold">
                    ${resume.totalIncomes.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Gastos Extra:</span>
                  <span className="text-red-700 font-semibold">
                    ${resume.totalExtraOutgoings.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Ingresos Netos:</span>
                  <span className="text-blue-800 font-semibold">
                    ${(resume.totalIncomes - resume.totalExtraOutgoings).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Ingresos Verificados:</span>
                  <span className="text-green-700 font-semibold">
                    ${resume.totalVerifiedIncomes.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Verificado %:</span>
                  <span className="text-purple-700 font-semibold">
                    {resume.verificationPercentage.toFixed(2)}%
                  </span>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Paginación */}
      <div className="pagination mt-8 flex justify-center">
        <button
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          onClick={handleNextPage}
        >
          Semana anterior
        </button>
        <button
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded mr-2"
          onClick={handlePrevPage}
          disabled={page === 1}
        >
          Siguiente semana
        </button>

      </div>
    </div>
  );
};

export default DailyResumePage;