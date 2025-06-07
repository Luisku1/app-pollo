/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import EntradasYSalidas from '../EntradasYSalidas/EntradasYSalidas'
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from 'react-icons/md'
import EntradaInicial from '../../pages/EntradaInicial'
import { useRoles } from '../../context/RolesContext'

export default function InputsAndOutputs({ companyId, date, currentUser, products, branchAndCustomerSelectOptions }) {

  const [netDifference, setNetDifference] = useState({})
  const { roles, isManager } = useRoles()
  const [totalNetDifference, setTotalNetDifference] = useState(0.0)
  const [differencesIsOpen, setDifferencesIsOpen] = useState(false)

  const SectionHeader = (props) => {

    return (

      <h2 className='flex text-2xl text-center font-semibold mb-4 text-red-800' onClick={props.onClick}>{props.label}</h2>
    )
  }

  useEffect(() => {

    setTotalNetDifference(0.0)
    setNetDifference([])


    const fetchNetDifference = async () => {

      const fetchDate = new Date(date).toISOString()

      setTotalNetDifference(0.0)

      try {

        const res = await fetch('/api/input/get-net-difference/' + companyId + '/' + fetchDate)
        const data = await res.json()

        if (data.success === false) {

          return
        }

        Object.values(data.netDifference).map(productDifference => {

          setTotalNetDifference((prev) => prev + productDifference.totalDifference)
        })

        setNetDifference(data.netDifference)

      } catch (error) {

        console.log(error)
      }
    }

    fetchNetDifference()

  }, [companyId, date])

  return (
    <div>
      <div>
        <EntradasYSalidas
          products={products || []}
          branchAndCustomerSelectOptions={branchAndCustomerSelectOptions}
          date={date}
          roles={roles}
        />
        <div className='bg-providers border border-black rounded-lg mt-4'>
          <EntradaInicial
            date={date}
            branchAndCustomerSelectOptions={branchAndCustomerSelectOptions}
            products={products || []}
            roles={roles}
          />
        </div>
      </div>
      <div className='border bg-white shadow-lg p-3 mt-4'>
        <div className='flex gap-4 display-flex justify-between' onClick={() => setDifferencesIsOpen(!differencesIsOpen)} >
          <SectionHeader label={'Diferencia neta'} />
          {differencesIsOpen ? <MdKeyboardArrowDown className='text-5xl' /> : <MdKeyboardArrowRight className='text-5xl' />}
        </div>
        {Object.values(netDifference) && Object.values(netDifference).length > 0 ?
          <div className={differencesIsOpen ? '' : 'hidden'} >
            {Object.values(netDifference) && Object.values(netDifference).length > 0 && Object.values(netDifference).map((employeeDifferences) => (
              <div key={employeeDifferences.employee._id}>
                {roles && roles.manager && (isManager(currentUser.role) || currentUser._id == employeeDifferences.employee._id) ?
                  < div className='border border-black mt-5'>
                    <div>
                      <p className='font-bold text-xl p-3'>{employeeDifferences.employee.name + ' ' + employeeDifferences.employee.lastName}</p>
                    </div>
                    {Object.values(employeeDifferences.netDifference) && Object.values(employeeDifferences.netDifference).length > 0 ?
                      < div id='header' className='grid grid-cols-12 gap-4 items-center justify-around font-semibold mt-4'>
                        <p className='p-3 rounded-lg col-span-6 text-center'>Producto</p>
                        <p className='p-3 rounded-lg col-span-6 text-center'>Diferencia</p>
                      </div>
                      : ''}
                    {Object.values(employeeDifferences.netDifference) && Object.values(employeeDifferences.netDifference).length > 0 && Object.values(employeeDifferences.netDifference).map((productDifference) => (
                      <div key={productDifference.name} className={'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2 p-3'}>
                        <div id='list-element' className='flex col-span-12 items-center justify-around p-1'>
                          <p className='text-center text-sm w-6/12'>{productDifference.name}</p>
                          <p className={'text-center text-sm w-6/12 ' + (productDifference.difference < 0 ? 'text-red-500' : '')}>{Math.abs(productDifference.difference).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    <div className='p-3'>
                      <div className='flex mt-4 border-black border border-opacity-30 shadow-lg rounded-lg p-3'>
                        <p className='w-6/12 text-center'>Total:</p>
                        <p className={'w-6/12 text-center ' + (employeeDifferences.totalDifference < 0 ? 'text-red-500' : '')}>{Math.abs(employeeDifferences.totalDifference)}</p>
                      </div>
                    </div>
                  </div>
                  : ''}
              </div>
            ))}
          </div>
          : ''
        }
        {roles && isManager(currentUser.role) ?
          <div className='flex mt-4 border-black border border-opacity-30 shadow-lg rounded-lg p-3'>
            <p className='w-6/12 text-center'>Total:</p>
            <p className={'w-6/12 text-center ' + (totalNetDifference < 0 ? 'text-red-500' : '')}>{Math.abs(totalNetDifference)}</p>
          </div>
          : ''}
      </div>
    </div>
  )
}
