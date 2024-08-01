/* eslint-disable react/prop-types */
import { createChart } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDate } from '../helpers/DatePickerFunctions';
import FechaDePagina from '../components/FechaDePagina';

export const ChartComponent = ({ branchName, incomes }) => {

  const chartContainerRef = useRef()

  useEffect(() => {

    const chart = createChart(chartContainerRef.current, { width: chartContainerRef.current.clientWidth, height: 400 })
    const lineSeries = chart.addLineSeries();
    const data = []

    incomes.forEach(income => {

      if(data.length > 0 && (income.createdAt.slice(0, 10) == data[data.length - 1].time)) {

        data[data.length - 1].value += income.amount

      } else {

        data.push({time: income.createdAt.slice(0, 10), value: income.amount})
      }
    });

    lineSeries.setData(data);

    return () => chart.remove()

  }, [incomes])



  return (

    < div >
      <h2 className='font-bold text-lg text-center mb-4'>{branchName}</h2>

      <div id='chartContainer' ref={chartContainerRef} className='flex justify-center' />
    </div >
  )
}

export default function Graficos() {

  const { company } = useSelector((state) => state.user)
  const navigate = useNavigate()
  const paramsDate = useParams().date
  let datePickerValue = (paramsDate ? new Date(paramsDate) : new Date())
  let stringDatePickerValue = formatDate(datePickerValue)
  const [branchesIncomes, setBranchesIncomes] = useState([])

  const changeDatePickerValue = (e) => {

    stringDatePickerValue = (e.target.value + 'T06:00:00.000Z')

    navigate('/graficos/' + stringDatePickerValue)

  }

  const changeDay = (date) => {

    navigate('/graficos/' + date)

  }
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

    <main className="p-3 mx-auto justify-items-center">


      <FechaDePagina changeDay={changeDay} stringDatePickerValue={stringDatePickerValue} changeDatePickerValue={changeDatePickerValue} ></FechaDePagina>

      <div id='chart'>
        {branchesIncomes.length > 0 && branchesIncomes.map((branch) => (

          <div key={branch._id} className='mb-4'>
            <ChartComponent branchName={branch.branch} incomes={branch.incomes}></ChartComponent>
          </div>
        ))}

      </div>


    </main>
  )
}
