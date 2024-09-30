/* eslint-disable react/prop-types */
import { useBranchOutputsAvg } from "../../hooks/Outputs/useBranchOutputsAvg"

export default function BranchOutputsAvg({branchId}) {

  const {branchOutputsAvg, loading, error} = useBranchOutputsAvg({branchId})

  return (
    <div>
      {!loading && !error ?
        <div className='flex gap-2'>
          <p className='font-bold text-lg'>{'Promedio de salidas:'}</p>
          <p className='text-lg text-red-700 font-bold'>
            {branchOutputsAvg.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}
          </p>
        </div>
        :
        <p>{'$0.00'}</p>
      }
    </div>
  )
}
