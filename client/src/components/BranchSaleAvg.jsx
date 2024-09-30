/* eslint-disable react/prop-types */
import { useBranchAvg } from '../hooks/Branches/useBranchAvg'

export default function BranchSaleAvg({ branchId }) {

  const { branchAvg, loading, error } = useBranchAvg({ branchId })

  return (
    <div>

      {!loading && !error ?
        <div className='flex gap-2'>
          <p className='font-bold text-lg'>{'Promedio de venta:'}</p>
          <p className='text-lg text-green-700 font-bold'>
            {branchAvg.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}
          </p>
        </div>
        :
        <p>{'$0.00'}</p>
      }
    </div>
  )
}
