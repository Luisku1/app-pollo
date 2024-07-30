import { createChart } from 'lightweight-charts';
import { useEffect, useRef } from 'react';

export default function Graficos() {

  const chartContainerRef = useRef()

  useEffect(() => {

    const chart = createChart(chartContainerRef.current, {width: chartContainerRef.current.clientWidth, height: 300} )
    const lineSeries = chart.addLineSeries();

    lineSeries.setData([
      { time: '2019-04-11', value: 80.01 },
      { time: '2019-04-12', value: 96.63 },
      { time: '2019-04-13', value: 76.64 },
      { time: '2019-04-14', value: 81.89 },
      { time: '2019-04-15', value: 74.43 },
      { time: '2019-04-16', value: 80.01 },
      { time: '2019-04-17', value: 96.63 },
      { time: '2019-04-18', value: 76.64 },
      { time: '2019-04-19', value: 81.89 },
      { time: '2019-04-20', value: 74.43 },
    ]);

  }, [])

  return (

    <main className="p-3 max-w-lg mx-auto justify-items-center">

      <div id='chart'>

        <div id='chartContainer' ref={chartContainerRef} className='flex justify-center' />
      </div>


    </main>
  )
}
