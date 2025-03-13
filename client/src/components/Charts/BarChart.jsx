/* eslint-disable react/prop-types */
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useEffect, useState } from 'react';
import { currency } from '../../helpers/Functions';
import ShowListModal from '../Modals/ShowListModal';
import IncomesList from '../Incomes/IncomesList';
import ExtraOutgoingsList from '../Outgoings/ExtraOutgoingsList';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels, BarElement, CategoryScale, LinearScale);

export default function BarChart({ verifiedIncomes = null, netIncomes = null, chartInfo }) {

  const [showIncomes, setShowIncomes] = useState(false)
  const [showExtraOutgoings, setShowExtraOutgoings] = useState(false)
  const [listTitle, setListTitle] = useState('')
  const [list, setList] = useState([])
  const [data, setData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Ingresos',
        data: [],
        backgroundColor: [],
        hoverBackgroundColor: [],
      },
    ],
  })

  const handleChartClick = (index) => {

    const info = chartInfo[index]

    if (!info) return

    setList(info.data)

    switch (info.label) {
      case 'Efectivos netos verificados':
        setShowIncomes(true)
        setListTitle('Efectivos')
        break
      case 'Terminal':
        setShowIncomes(true)
        setListTitle('Ingresos con Terminal')
        break
      case 'Depósitos':
        setShowIncomes(true)
        setListTitle('Depósitos')
        break
      case 'Gastos fuera de cuentas':
        setShowExtraOutgoings(true)
        setListTitle('Gastos externos')
        break
      case 'Ingresos sin verificar':
        setListTitle('Ingresos registrados')
        setShowIncomes(true)
        break;
      default:
        break
    }
  }

  useEffect(() => {

    if (!chartInfo) return

    const sortedChartInfo = [...chartInfo].sort((a, b) => b.value - a.value);

    const updatedLabels = []
    const updatedData = []
    const updatedBackgroundColors = []
    const updatedHoverBackgroundColors = []
    const updatedBorderColors = []

    sortedChartInfo.forEach((chartNode) => {
      updatedLabels.push(chartNode.label || '') // Verifica que el label exista
      updatedData.push(chartNode.value || 0) // Asegúrate de tener valores de data
      updatedBackgroundColors.push(chartNode.bgColor || '#fff') // Colores de fondo por defecto
      updatedBorderColors.push(chartNode.borderColor || '#000') // Colores borde por defecto
      updatedHoverBackgroundColors.push(chartNode.hoverBgColor || '#ddd') // Colores hover por defecto
    });

    setData({
      labels: updatedLabels,
      datasets: [
        {
          label: 'Ingresos',
          data: updatedData,
          backgroundColor: updatedBackgroundColors,
          hoverBackgroundColor: updatedHoverBackgroundColors,
          borderColor: updatedBorderColors,
          borderWidth: 1, // Ancho de borde opcional
        },
      ],
    })

  }, [chartInfo])

  const renderStatistics = () => {
    return (
      <div className='w-full'>
        {(verifiedIncomes || verifiedIncomes === 0) && (netIncomes || netIncomes === 0) && (
          <div>
            <p className='text-lg'>Ingresos totales confirmados</p>
            <div className='flex gap-2'>
              <p className='text-lg'>
                <span className={`${verifiedIncomes < netIncomes ? 'text-red-600' : 'text-green-600'}`}>
                  {currency({ amount: verifiedIncomes })}
                </span>
                /
                <span className='text-green-600'>{currency({ amount: netIncomes })}</span>
              </p>
              {verifiedIncomes < netIncomes && (
                <p className='text-red-500'>{`(${currency({ amount: verifiedIncomes - netIncomes })})`}</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'top', // Posición de la leyenda
      },
      datalabels: {
        color: '#000', // Cambiar a un color que contraste bien
        formatter: (value, context) => {
          return !value ? '' : currency({ amount: value });
        },
        font: {
          weight: 'bold',
          size: 16, // Aumentar el tamaño de la fuente
        }
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const label = data.labels[tooltipItem.dataIndex] || '';
            const value = data.datasets[0].data[tooltipItem.dataIndex] || 0
            return `${label}: ${currency({ amount: value })}` // Muestra el label y el valor en el tooltip
          },
        },
      },

    },
    onClick: (event, elements) => {
      console.log(elements, elements[0].index)
      const index = elements[0].index
      handleChartClick(index)
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return (
    <div style={{ height: '33vh' }}>
      <Bar data={data} options={options}></Bar>
      {list.length > 0 && showIncomes && (
        <ShowListModal
          title={listTitle}
          modalIsOpen={showIncomes}
          ListComponentProps={{ incomes: list, incomesTotal: list.reduce((acc, curr) => acc + curr.amount, 0) }}
          ListComponent={IncomesList}
          extraInformation={renderStatistics}
          toggleComponent={() => setShowIncomes((prev) => !prev)}
        />
      )}
      {list.length > 0 && showExtraOutgoings && (
        <ShowListModal
          ListComponent={ExtraOutgoingsList}
          ListComponentProps={{ extraOutgoings: list, totalExtraOutgoings: list.reduce((acc, curr) => acc + curr.amount, 0) }}
          title={'Gastos'}
          modalIsOpen={showExtraOutgoings}
          toggleComponent={() => setShowExtraOutgoings((prev) => !prev)}
        />
      )}
    </div>
  )
}
