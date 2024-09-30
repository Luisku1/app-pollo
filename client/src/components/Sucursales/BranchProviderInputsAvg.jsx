/* eslint-disable react/prop-types */
import { useBranchProviderInputsAvg } from '../../hooks/ProviderInputs/useBranchProviderInputsAvg'

export default function BranchProviderInputsAvg({branchId}) {

  const {branchProviderInputsAvg, loading, error} = useBranchProviderInputsAvg({branchId})

  return (
    <div>
      {!loading && !error ?
        <div className='flex gap-2'>
          <p className='font-bold text-lg'>{'Promedio de compra a proveedor:'}</p>
          <p className='text-lg text-red-700 font-bold'>
            {branchProviderInputsAvg.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}
          </p>
        </div>
        :
        <p>{'$0.00'}</p>
      }
    </div>
  )
}
