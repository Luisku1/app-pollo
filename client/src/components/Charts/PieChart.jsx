/* eslint-disable react/prop-types */
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useEffect, useState } from 'react';
import { stringToCurrency } from '../../helpers/Functions';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ chartInfo }) {

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

  useEffect(() => {

    if (!chartInfo) return

    const updatedLabels = [];
    const updatedData = [];
    const updatedBackgroundColors = [];
    const updatedHoverBackgroundColors = [];
    const updatedBorderColors = [];

    chartInfo.forEach((chartNode) => {
      updatedLabels.push(chartNode.label || ''); // Verifica que el label exista
      updatedData.push(chartNode.value || 0); // Asegúrate de tener valores de data
      updatedBackgroundColors.push(chartNode.bgColor || '#fff'); // Colores de fondo por defecto
      updatedBorderColors.push(chartNode.borderColor || '#000'); // Colores borde por defecto
      updatedHoverBackgroundColors.push(chartNode.hoverBgColor || '#ddd'); // Colores hover por defecto
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

  const options = {
    plugins: {
      legend: {
        position: 'top', // Posición de la leyenda
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const label = data.labels[tooltipItem.dataIndex] || '';
            const value = data.datasets[0].data[tooltipItem.dataIndex] || 0;
            return `${label}: ${stringToCurrency({ amount: value })}`; // Muestra el label y el valor en el tooltip
          },
        },
      },
      onClick: (event, elements) => {
        if (elements.length > 0) {
          const { index } = elements[0];
          console.log(elements, index)
        }
      },
    },
  };

  return (
    <div>
      <Pie data={data} options={options}></Pie>
    </div>
  )
}
