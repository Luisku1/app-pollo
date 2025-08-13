/* eslint-disable react/prop-types */
import EntradasYSalidas from '../Movimientos/EntradasYSalidas'
import NetDifferenceCard from '../statistics/NetDifferenceCard'

export default function InputsAndOutputs() {

  return (
    <div>
      <div>
        <EntradasYSalidas
        />
        <div className='items-center justify-center flex flex-col gap-2 mt-4'>
          <NetDifferenceCard />
        </div>
      </div>
    </div>
  )
}
