/* eslint-disable react/prop-types */
import { GrNext, GrPrevious } from "react-icons/gr";

export default function FechaDePagina({ changeDatePickerValue, stringDatePickerValue, changeDay }) {

  const prevDay = () => {

    const datePicker = document.getElementById('date')
    const datePickerDate = new Date(datePicker.value + 'T06:00:00.000Z')
    datePickerDate.setDate(datePickerDate.getDate() - 1)

    const newDate = (datePickerDate.toISOString().slice(0, 10))

    datePicker.value = newDate

    changeDay(datePickerDate.toISOString())

  }

  const nextDay = () => {

    const datePicker = document.getElementById('date')
    const datePickerDate = new Date(datePicker.value + 'T06:00:00.000Z')
    datePickerDate.setDate(datePickerDate.getDate() + 1)

    const newDate = (datePickerDate.toISOString().slice(0, 10))

    datePicker.value = newDate

    changeDay(datePickerDate.toISOString())
  }

  return (

    <div className="gap-2">

      <p className="font-bold text-center text-lg">{
        (new Date(stringDatePickerValue)).toLocaleDateString('es-mx', { weekday: 'long' })
      }</p>

      <div className="flex justify-center gap-1">
        <button className="w-5" onClick={prevDay}><GrPrevious className="w-full" /></button>
        <input className="p-1" type="date" name="date" id="date" onChange={changeDatePickerValue} defaultValue={stringDatePickerValue.slice(0, 10)} />
        <button className="w-5" onClick={nextDay}><GrNext className="w-full" /></button>
      </div>

    </div>
  )
}