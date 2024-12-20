/* eslint-disable react/prop-types */
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useEffect, useState } from 'react';
import { stringToCurrency } from '../../helpers/Functions';
import ShowIncomesModal from '../Incomes/ShowIncomesModal';
import ShowExtraOutgoingsModal from '../Outgoings/ShowExtraOutgoingsModal';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ verifiedIncomes = null, netIncomes = null, chartInfo }) {

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
        setShowIncomes(true)
        setListTitle('Ingresos registrados')
        break;
      default:
        break
    }
  }

  useEffect(() => {

    if (!chartInfo) return

    const updatedLabels = []
    const updatedData = []
    const updatedBackgroundColors = []
    const updatedHoverBackgroundColors = []
    const updatedBorderColors = []

    chartInfo.forEach((chartNode) => {
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
                  {stringToCurrency({ amount: verifiedIncomes })}
                </span>
                /
                <span className='text-green-600'>{stringToCurrency({ amount: netIncomes })}</span>
              </p>
              {verifiedIncomes < netIncomes && (
                <p className='text-red-500'>{`(${stringToCurrency({ amount: verifiedIncomes - netIncomes })})`}</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const options = {
    mantainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'top', // Posición de la leyenda
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const label = data.labels[tooltipItem.dataIndex] || '';
            const value = data.datasets[0].data[tooltipItem.dataIndex] || 0
            return `${label}: ${stringToCurrency({ amount: value })}` // Muestra el label y el valor en el tooltip
          },
        },
      },

    },
    onClick: (event, elements) => {
      const index = elements[0].index
      console.log(event)
      handleChartClick(index)
    },
  }

  return (
    <div>
      <Pie data={data} options={options}></Pie>
      {list.length > 0 && (
        <ShowIncomesModal
          incomes={list}
          title={listTitle}
          modalIsOpen={showIncomes}
          toggleComponent={() => setShowIncomes((prev) => !prev)}
          extraInformation={renderStatistics}
        />
      )}
      {list.length > 0 && (
        <ShowExtraOutgoingsModal
          data={list}
          title={listTitle}
          modalIsOpen={showExtraOutgoings}
          toggleComponent={() => setShowExtraOutgoings((prev) => !prev)}
        />
      )}
    </div>
  )
}
