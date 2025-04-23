import { useProviderAvg } from '../hooks/Providers/useProviderAvg'

export default function ProviderAvg({ providerId }) {

  const { providerAvg, loading, error } = useProviderAvg({ providerId })

  return (
    <div>

      {!loading && !error ?
        <div className='flex gap-2'>
          <p className='font-bold text-lg'>{'Promedio de venta:'}</p>
          <p className='text-lg text-green-700 font-bold'>
            {providerAvg.toLocaleString('es-Mx', { style: 'currency', currency: 'MXN' })}
          </p>
        </div>
        :
        <p>{'$0.00'}</p>
      }
    </div>
  )
}