/* eslint-disable react/prop-types */
import { createChart } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDate } from '../helpers/DatePickerFunctions';
import FechaDePagina from '../components/FechaDePagina';
import { useDate } from '../context/DateContext';

export const ChartComponent = ({ branchName, branchReports }) => {

  const chartContainerRef = useRef()

  useEffect(() => {

    const chart = createChart(chartContainerRef.current, { width: chartContainerRef.current.clientWidth, height: 400 })
    const lineSeries = chart.addLineSeries();
    const data = []

    branchReports.forEach(branchReport => {

      if (!(data.length > 0 && (branchReport.createdAt.slice(0, 10) == data[data.length - 1].time))) {

        data.push({ time: branchReport.createdAt.slice(0, 10), value: branchReport.incomes })
      }
    });

    lineSeries.setData(data);

    return () => chart.remove()

  }, [branchReports])

  return (
    <div className='p-3'>
      <h2 className='font-bold text-lg text-center mb-4'>{branchName}</h2>
      <div id='chartContainer' ref={chartContainerRef} className='flex justify-center w-full' />
    </div>
  )
}

export default function Graficos() {

  const { company } = useSelector((state) => state.user)
  const navigate = useNavigate()
  const paramsDate = useParams().date
  let datePickerValue = (paramsDate ? new Date(paramsDate) : new Date())
  let stringDatePickerValue = formatDate(datePickerValue)
  const [branchesIncomes, setBranchesIncomes] = useState([])
  const { currentDate, setCurrentDate } = useDate()

  const changeDatePickerValue = (e) => {

    const newDate = e.target.value + 'T06:00:00.000Z';
    setCurrentDate(newDate);
    navigate('/graficos/' + newDate)

  }

  const changeDay = (date) => {
    setCurrentDate(date)
    navigate('/graficos/' + date)
  }

  useEffect(() => {
    if (stringDatePickerValue) {
      setCurrentDate(stringDatePickerValue)
    }
  }, [stringDatePickerValue])

  useEffect(() => {

    const getMonthBranchesIncomes = async () => {

      const date = (new Date()).toISOString()

      try {

        const res = await fetch('/api/branch/get-month-branches-incomes/' + company._id + '/' + date)
        const data = await res.json()

        if (data.success === false) {

          return
        }

        setBranchesIncomes(data)

      } catch (error) {

        console.log(error)
      }
    }

    getMonthBranchesIncomes()

  }, [company])

  return (

    <main className="p-3 max-w-lg mx-auto justify-items-center">


      <FechaDePagina changeDay={changeDay} stringDatePickerValue={currentDate} changeDatePickerValue={changeDatePickerValue} ></FechaDePagina>

      <div id='chart' className='max-w-lg mx-auto'>
        {branchesIncomes.length > 0 && branchesIncomes.map((branch) => (

          <div key={branch._id} className='mb-4'>
            <ChartComponent branchName={branch.branch} branchReports={branch.branchReports}></ChartComponent>
          </div>
        ))}

      </div>


    </main>
  )
}
