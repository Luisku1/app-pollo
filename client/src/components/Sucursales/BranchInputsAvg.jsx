/* eslint-disable react/prop-types */
import { useBranchInputsAvg } from "../../hooks/Inputs/useBranchInputsAvg"

export default function BranchInputsAvg({ branchId }) {

  const { branchInputsAvg, loading, error } = useBranchInputsAvg({ branchId })

  return (
    <div>
      {!loading && !error ?
        <div className='flex gap-2'>
          <p className='font-bold text-lg'>{'Promedio de entradas:'}</p>
          <p className='text-lg text-red-700 font-bold'>
            {branchInputsAvg.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}
          </p>
        </div>
        :
        <p>{'$0.00'}</p>
      }
    </div>
  )
}
