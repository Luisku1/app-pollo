/* eslint-disable react/prop-types */
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import SectionHeader from "../components/SectionHeader";
import { MdCancel } from "react-icons/md";
import { FaListAlt } from "react-icons/fa";
import { BsInfoSquare } from "react-icons/bs";
import Select from 'react-select'
import { customSelectStyles } from "../helpers/Constants";
import MenuSucursal from "../components/EntradasDeProveedor/MenuSucursal";
import { useProviderInputs } from "../hooks/ProviderInputs/useProviderInputs";
import { getArrayForSelects, getElementForSelect, stringToCurrency } from "../helpers/Functions";
import DeleteButton from "../components/Buttons/DeleteButton";
import Modal from "../components/Modals/Modal";
import ShowListModal from "../components/Modals/ShowListModal";
import ProviderInputsList from "../components/Proveedores/ProviderInputsList";

export default function EntradaInicial({ date, branchAndCustomerSelectOptions, products, roles }) {

  const { company, currentUser } = useSelector((state) => state.user)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const { providerInputs, providerInputsWeight, providerInputsPieces, providerInputsAmount, onAddProviderInput, onDeleteProviderInput } = useProviderInputs({ companyId: company._id, productId: selectedProduct == null ? products.length > 0 ? products[0]._id : null : selectedProduct._id, date })
  const [showProviderInputs, setShowProviderInputs] = useState(false)
  const [showProviderInputsStats, setShowProviderInputsStats] = useState(false)

  useEffect(() => {

    if (!products || products.length == 0) return

    setSelectedProduct({ name: `${products[0].name} de proveedor`, ...products[0] })

  }, [products])

  const toggleProviderInputs = async () => {

    setShowProviderInputs((prev) => !prev)
  }

  const handleProductSelectChange = (product) => {

    setSelectedProduct({ name: `${product.name} de proveedor`, ...product })
  }

  useEffect(() => {

    if (!products || products.length == 0) return

    handleProductSelectChange(products[0])

  }, [products])

  return (
    <main className="max-w-lg mx-auto">
      <div className='border bg-white p-3 mt-4'>
        <SectionHeader label={'Entradas de Proveedor'} />
        <div className="grid grid-rows-2">
          <div className="flex gap-3 justify-self-end items-center">
            <div className="flex gap-3">
              <ShowListModal
                title={'Entradas de proveedor'}
                ListComponent={ProviderInputsList}
                ListComponentProps={{ inputs: providerInputs, totalWeight: providerInputsWeight, totalAmount: providerInputsAmount, onDelete: onDeleteProviderInput }}
                clickableComponent={
                  <div className="w-10 h-10"><FaListAlt className="h-full w-full text-red-600" />
                  </div>
                }
                toggleComponent={toggleProviderInputs}
                modalIsOpen={showProviderInputs}
              />
              <button className="w-10 h-10 rounded-lg shadow-lg" onClick={() => setShowProviderInputsStats(true)}><BsInfoSquare className="h-full w-full text-red-600" />
              </button>
              {showProviderInputsStats && providerInputs && providerInputs.length > 0 ?
                <Modal
                  closeModal={() => setShowProviderInputsStats(false)}
                  title={'Datos de entradas de proveedores'}
                  content={
                    <div >
                      <div className="grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center">
                        <p className="font-bold text-lg">Kilos: </p>
                        <p>{providerInputsWeight.toFixed(2) + ' Kg'}</p>
                      </div>
                      <div className="grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center">
                        <p className="font-bold text-lg">Piezas: </p>
                        <p>{providerInputsPieces.toFixed(2) + ' u'}</p>
                      </div>
                      <div className="grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center">
                        <p className="font-bold text-lg">Promedio: </p>
                        <p>{(providerInputsWeight / providerInputsPieces).toFixed(2) + ' Kg/u'}</p>
                      </div>
                    </div>
                  }
                />
                : ''}
            </div>
            <p className='font-bold text-md'><span className=" text-red-700 text-center">{`${providerInputsWeight.toFixed(2)} Kg / ${providerInputsPieces}`}</span><sup className="text-red-700">u</sup><span>:</span><span className="text-green-700">{` ${stringToCurrency({ amount: providerInputsAmount })}`}</span></p>
          </div>
          <h2 className='text-2xl font-semibold mb-4 text-red-800'>
            <div className="">
              <div className="col-span-3">
                <Select
                  styles={customSelectStyles}
                  value={getElementForSelect(selectedProduct, (product) => { return product.name }) || null}
                  onChange={handleProductSelectChange}
                  options={getArrayForSelects(products, (product) => { return product.name })}
                  placeholder={'Producto de Proveedor'}
                  isSearchable={true}
                />
              </div>
            </div>
          </h2>
        </div>
        <MenuSucursal
          date={date}
          branchAndCustomerSelectOptions={branchAndCustomerSelectOptions}
          onAddProviderInput={onAddProviderInput}
          selectedProduct={selectedProduct}>
        </MenuSucursal>
      </div>
      {/* <div className="grid my-4 grid-cols-1 rounded-lg">
        {providerInputs && providerInputs.length > 0 && showProviderInputs ?
          <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center max-w-lg my-auto mx-auto z-10'>
            <div className=' bg-white p-5 rounded-lg justify-center items-center h-5/6 my-auto mx-auto w-11/12 overflow-y-scroll'>
              <button className="" onClick={hideProviderInputs}><MdCancel className="h-7 w-7" /></button>
              < div className='bg-white mt-4 mb-4'>
                <SectionHeader label={'Entradas de ' + selectedProduct.name} />
                <div>
                  {providerInputs && providerInputs.length > 0 ?
                    <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold sticky top-0 bg-white'>
                      <p className='col-span-3 text-center'>Sucursal</p>
                      <p className='col-span-3 text-center'>Encargado</p>
                      <p className='col-span-3 text-center'>Piezas</p>
                      <p className='col-span-1 text-center'>Kg</p>
                    </div>
                    : ''}
                  {providerInputs && providerInputs.length > 0 && providerInputs.map((providerInput, index) => (
                    <div key={providerInput._id} className={(currentUser._id == providerInput.employee || currentUser.role == roles.managerRole._id ? '' : 'py-3 ') + 'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2'}>
                      <div id='list-element' className='flex col-span-10 items-center justify-around'>
                        <p className='text-center text-xs  w-3/12'>{`${providerInput.branch?.branch || providerInput.branch?.label || (`${providerInput.customer?.name} ${providerInput.customer?.lastName}`)}`}</p>
                        <p className='text-center text-xs w-3/12'>{providerInput.employee.name + ' ' + providerInput.employee.lastName}</p>
                        <p className='text-center text-xs w-3/12'>{providerInput.pieces}</p>
                        <p className='text-center text-xs w-1/12'>{`${providerInput.weight.toFixed(2)}`}</p>
                      </div>
                      {providerInput.employee._id == currentUser._id || roles.managerRole._id == currentUser.role ?
                        <DeleteButton
                          deleteFunction={() => onDeleteProviderInput(providerInput, index)}
                          id={providerInput._id}
                        />
                        : ''}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          : ''}
      </div> */}
    </main>
  )
}
