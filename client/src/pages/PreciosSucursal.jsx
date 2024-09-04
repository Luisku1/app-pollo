import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function PreciosSucursal() {

  const branchId = useParams().branchId
  const [branch, setBranch] = useState()
  const [branchPrices, setBranchPrices] = useState()

  useEffect(() => {

    if (!branchId) return

    const getBranchInfo = async () => {

      try {

        const res = await fetch('/api/branch/get-branch/' + branchId)
        const data = await res.json()

        if (data.success === false) {

          return
        }

        setBranch(data)

      } catch (error) {

        console.log(error)
      }

    }

    const getBranchPrices = async () => {

      const date = new Date()

      try {

        const res = await fetch('/api/product/price/get-branch-prices/' + branchId + '/' + date.toISOString() + '/' + 0)
        const data = await res.json()

        if (data.success === false) {

          return
        }

        setBranchPrices(data.data)

      } catch (error) {

        console.log(error)
      }
    }

    getBranchPrices()
    getBranchInfo()

  }, [branchId])

  useEffect(() => {

    if (!branch) return

    document.title = 'Precios de ' + branch.branch

  }, [branch])

  return (
    <div className='mx-auto max-w-lg'>

      {branch ?
        <p className='my-4 text-center'>{branch.branch}</p>
        : ''}

      {branchPrices && branchPrices.prices.length > 0 && branchPrices.prices.map((price) => (
        <div key={price.productId} className="shadow-lg bg-gray-100 rounded-lg">
          <div className="grid grid-cols-12 p-1 border ">

            <p className="col-span-8">{price.product}:</p>
            <p className='col-span-4'>{price.latestPrice}</p>

          </div>
        </div>
      ))}
    </div>
  )
}
