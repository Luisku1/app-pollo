import { useEffect, useState } from "react"
import { useSelector } from 'react-redux'

export default function Nomina() {

  const { company } = useSelector((state) => state.user)
  const [employeesPayroll, setEmployeesPayroll] = useState([])

  useEffect(() => {

    const fetchEmployeesPayroll = async () => {

      try {

        const res = await fetch('/api/employee/get-employees-payroll/' + company._id)
        const data = await res.json()

        if (data.success === false) {

          return
        }

        data.employeesPayroll.forEach((employeePayroll) => {

          employeePayroll.totalDebt = 0.0
          employeePayroll.totalAccountBalance = 0.0
          employeePayroll.totalLoan = 0.0
          employeePayroll.totalFoodDiscount = 0.0
          employeePayroll.totalDayDiscount = 0.0
          employeePayroll.didEmployeeRest = 'No'

          employeePayroll.dailyBalances.forEach((dailyBalance) => {

            employeePayroll.totalAccountBalance += dailyBalance.accountBalance
            employeePayroll.totalLoan += dailyBalance.loan

            if (dailyBalance.dayDiscount) {

              employeePayroll.totalDayDiscount -= employeePayroll.salary / 7
            }

            if (dailyBalance.foodDiscount) {

              employeePayroll.totalFoodDiscount -= 60
            }

            if (dailyBalance.restDay) {

              employeePayroll.didEmployeeRest = 'Si'
            }

          })

          employeePayroll.totalDebt = employeePayroll.totalAccountBalance + employeePayroll.totalLoan + employeePayroll.totalFoodDiscount + employeePayroll.totalDayDiscount
        })

        setEmployeesPayroll(data.employeesPayroll)

      } catch (error) {

        console.log(error)
      }
    }

    fetchEmployeesPayroll()

  }, [company._id])

  return (

    <main className="p-3 max-w-lg mx-auto">

      <h1 className='text-3xl text-center font-semibold mt-7'>
        Nómina
      </h1>

      <div className='border bg-white p-3 mt-4'>

        {employeesPayroll && employeesPayroll.length > 0 && employeesPayroll.map((employeePayroll) => (

          <div key={employeePayroll._id} className='grid grid-cols-1 items-center border border-black rounded-lg shadow-sm my-2'>
            <div id='list-element' className='grid grid-cols-12 py-3 my-2'>
              <div id="header" className="col-span-12 mt-1 mb-4 border-b border-black shadow-sm text-center">
                <div className="grid grid-cols-1">
                  <div className="grid grid-cols-12 col-span-12">
                    <p className='text-lg col-span-5 pb-3 pl-3 text-left font-bold my-auto'>{employeePayroll.name + ' ' + employeePayroll.lastName}</p>

                    <div className="grid grid-cols-7 col-span-7 grid-rows-2">
                      <div className="col-span-7 row-span-1 mb-3">
                        <div className="flex gap-2">
                          <p>Salario: </p>
                          <p className={(employeePayroll.salary < 0 ? 'text-red-500 ' : ' ') + 'text-xs my-auto'}>{employeePayroll.salary.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}</p>
                        </div>
                        <div className="flex gap-2">
                          <p>Balance anterior: </p>
                          <p className={(employeePayroll.balance < 0 ? 'text-red-500 ' : ' ') + 'text-xs my-auto'}>{employeePayroll.balance.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}</p>
                        </div>
                        <div className="flex gap-2">
                          <p>Deuda total: </p>
                          <p className={(employeePayroll.totalDebt < 0 ? 'text-red-500' : '') + ' text-xs my-auto'}>{employeePayroll.totalDebt.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}</p>
                        </div>
                      </div>

                      <div className="grid col-span-7 grid-cols-7 row-span-1 mt-3">
                        <div className="col-span-2">
                          <p>Cuenta</p>
                          <p className={(employeePayroll.totalAccountBalance < 0 ? 'text-red-500' : '') + ' text-xs my-auto'}>{employeePayroll.totalAccountBalance.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}</p>
                        </div>
                        <div className="col-span-2">
                          <p>Préstamo</p>
                          <p className={(employeePayroll.totalLoan < 0 ? 'text-red-500' : '') + ' text-xs my-auto'}>{employeePayroll.totalLoan.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}</p>
                        </div>
                        <div className="col-span-1">
                          <p>R</p>
                          <p className={(employeePayroll.totalFoodDiscount < 0 ? 'text-red-500 ' : ' ') + 'text-xs my-auto'}>{employeePayroll.totalFoodDiscount.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}</p>
                        </div>
                        <div className="col-span-1">
                          <p>D</p>
                          <p className="text-xs">{employeePayroll.didEmployeeRest}</p>
                        </div>
                        <div className="col-span-1">
                          <p>F</p>
                          <p className={(employeePayroll.totalDayDiscount < 0 ? 'text-red-500' : '') + ' text-xs my-auto'}>{employeePayroll.totalDayDiscount.toLocaleString('es-MX', {style: 'currency', currency: 'MXN'})}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {employeePayroll.dailyBalances && employeePayroll.dailyBalances.length > 0 && employeePayroll.dailyBalances.map((dailyBalance) => (

                <div className="grid col-span-12 grid-cols-12 p-1" key={dailyBalance._id}>

                  <p className="text-sm col-span-5 truncate">{(new Date(dailyBalance.createdAt)).toLocaleDateString('es-mx', { weekday: 'long', month: '2-digit', day: '2-digit' })}</p>

                  <input className="border border-black text-center col-span-2" type="number" name="" id="" defaultValue={dailyBalance.accountBalance} />
                  <input className="col-span-2 border border-black text-center" type="number" name="" id="" defaultValue={dailyBalance.loan} />
                  <input className='col-span-1' type="checkbox" name="foodDiscount" id="foodDiscount" defaultChecked={dailyBalance.foodDiscount} />
                  <input className='col-span-1' type="checkbox" name="restDay" id="restDay" defaultChecked={dailyBalance.restDay} />
                  <input className='col-span-1' type="checkbox" name="dayDiscount" id="dayDiscount" defaultChecked={dailyBalance.dayDiscount} />
                </div>

              ))}

              <div className="col-span-12 mt-4 p-2 bg-slate-600 text-white rounded-lg mx-2">
                <button className="w-full">Liberar nómina</button>
              </div>
            </div>
          </div>

        ))}

      </div>

    </main>
  )
}
