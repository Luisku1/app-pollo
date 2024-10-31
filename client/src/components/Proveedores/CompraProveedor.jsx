/* eslint-disable react/prop-types */
import Select from 'react-select'
import ShowListButton from '../Buttons/ShowListButton'
import EmployeePaymentsList from '../EmployeePaymentsList'
import { customSelectStyles } from '../../helpers/Constants'
import { useState } from 'react'

export default function CompraProveedor({roles, providers}) {

  const [selectedProvider, setSelectedProvider] = useState(null)

  return (
    <div>

      <ShowListButton
        ListComponent={
          <EmployeePaymentsList
            spliceEmployeePayment={spliceEmployeePayment}
            deleteEmployeePayment={deleteEmployeePayment}
            employeePayments={payments}
            roles={roles}
          />
        }
      />

      <form onSubmit={addInputSubmit} className="flex flex-col space-y-2">

        <div>

          <Select defaultLabel={'Sucursal o Cliente'} options={providers} styles={customSelectStyles} selectedOption={selectedProvider} handleSelectChange={handleBranchCustomerSelectChange}></Select>
        </div>

        <div>
          <Select
            styles={customSelectStyles}
            value={selectedProduct}
            onChange={handleProductSelectChange}
            options={products}
            placeholder={'Producto'}
            isSearchable={true}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">

          <div className='relative'>
            <input type="number" name="pieces" id="input-pieces" placeholder='0.00' step={0.01} className='w-full border border-black p-3 rounded-lg' required onInput={inputButtonControl} onChange={handleInputInputsChange} />
            <label htmlFor="compact-input" className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
              Piezas <span>*</span>
            </label>
          </div>

          <div className='relative'>
            <input type="number" name="weight" id="input-weight" placeholder='0.000 kg' step={0.001} className='w-full border border-black p-3 rounded-lg' required onInput={inputButtonControl} onChange={handleInputInputsChange} />
            <label htmlFor="compact-input" className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
              Kilos <span>*</span>
            </label>
          </div>

          <div className='relative items-center'>
            <span className="absolute text-red-700 font-semibold left-3 top-3">$</span>
            <input className='pl-6 w-full rounded-lg p-3 text-red-700 font-semibold border border-red-600' name='price' id='input-price' step={0.01} placeholder={price.toFixed(2)} type="number" onChange={(e) => { handleInputInputsChange(e), generarMonto() }} />
            <label htmlFor="compact-input" className="-translate-y-full px-1 absolute top-1/4 left-2 transform rounded-sm bg-white text-black text-sm font-semibold">
              Precio <span>*</span>
            </label>
          </div>

        </div>

        <div className='grid grid-cols-4 gap-1'>

          <input className='col-span-3 text-sm border border-black rounded-lg p-3' name="comment" id="input-comment" placeholder='Comentario del producto (Opcional)' onChange={handleInputInputsChange}></input>

          <div className='relative'>
            <p type="text" name="amount" id="input-amount" className='text-green-700 w-full border border-black rounded-md p-3' >{amount}</p>
            <label htmlFor="compact-input" className=" -translate-y-full px-1 absolute top-1/4 left-2 rounded-sm bg-white text-green-700 text-sm font-bold">
              Total
            </label>
          </div>
        </div>

        <button type='submit' id='input-button' disabled className='bg-slate-500 text-white p-3 rounded-lg col-span-12 mt-8'>Agregar</button>

      </form>
    </div>
  )
}
