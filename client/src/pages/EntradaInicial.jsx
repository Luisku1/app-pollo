/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import SectionHeader from "../components/SectionHeader";
import { MdCancel } from "react-icons/md";
import { FaListAlt, FaTrash } from "react-icons/fa";
import { BsInfoSquare } from "react-icons/bs";
import Select from 'react-select'
import { customSelectStyles } from "../helpers/Constants";
import MenuSucursal from "../components/EntradasDeProveedor/MenuSucursal";
import { useProviderInputs } from "../hooks/ProviderInputs/useProviderInputs";
import { useDeleteProviderInput } from "../hooks/ProviderInputs/useDeleteProviderInput";

export default function EntradaInicial({ date, branchAndCustomerSelectOptions, products, roles }) {

  const { company, currentUser } = useSelector((state) => state.user)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const { deleteProviderInput, loading: deletingLoading } = useDeleteProviderInput()
  const { providerInputs, providerInputsWeight, providerInputsPieces, pushProviderInput, spliceProviderInput } = useProviderInputs({ companyId: company._id, productId: selectedProduct == null ? products.length > 0 ? products[0].value : null : selectedProduct.value, date })
  const [showProviderInputs, setShowProviderInputs] = useState(false)
  const [showProviderInputsStats, setShowProviderInputsStats] = useState(false)
  const [buttonId, setButtonId] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const listRef = useRef(null);

  useEffect(() => {

    const list = listRef.current;

    if (list) {

      const handleScroll = () => {

        sessionStorage.setItem('scrollPosition', list.scrollTop);

      };

      list.addEventListener('scroll', handleScroll);

      // Restaurar la posición del scroll
      const scrollPosition = sessionStorage.getItem('scrollPosition');

      if (scrollPosition) {

        list.scrollTop = scrollPosition;
      }

      return () => {
        list.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  useEffect(() => {

    if (products.length < 1) return

    setSelectedProduct({ value: products[0].value, label: `${products[0].label} de proveedor` })

  }, [products])

  const showProviderInputsFunction = async () => {

    setShowProviderInputs(true)

  }

  const hideProviderInputs = async () => {

    setShowProviderInputs(false)
  }

  const handleProductSelectChange = (product) => {

    setSelectedProduct({ value: product.value, label: `${product.label} de proveedor` })
  }

  useEffect(() => {

    if (products && products.length == 0) return

    handleProductSelectChange(products[0])

  }, [products])

  return (

    <main className="max-w-lg mx-auto">

      <div className='border bg-white p-3 mt-4'>
        <SectionHeader label={(selectedProduct ? selectedProduct.label : 'Producto')} />

        <div className="grid grid-rows-2">
          <div className="flex gap-3 justify-self-end items-center">

            <div className="flex gap-3">

              <button className="w-10 h-10" onClick={showProviderInputsFunction}><FaListAlt className="h-full w-full text-red-600" />
              </button>
              <button className="w-10 h-10 rounded-lg shadow-lg" onClick={() => setShowProviderInputsStats(true)}><BsInfoSquare className="h-full w-full text-red-600" />
              </button>
            </div>
            <p className='font-bold text-lg text-red-700 text-center'>{providerInputsWeight.toFixed(2) + ' Kg'}</p>
          </div>
          <h2 className='text-2xl font-semibold mb-4 text-red-800'>
            <div className="">
              <div className="col-span-3">
                <Select
                  styles={customSelectStyles}
                  value={selectedProduct}
                  onChange={handleProductSelectChange}
                  options={products}
                  placeholder={'Producto de Proveedor'}
                  isSearchable={true}
                />
              </div>
            </div>
          </h2>

        </div>

        <MenuSucursal date={date} branchAndCustomerSelectOptions={branchAndCustomerSelectOptions} spliceProviderInput={spliceProviderInput} pushProviderInput={pushProviderInput} selectedProduct={selectedProduct}></MenuSucursal>

      </div>

      <div className="grid my-4 grid-cols-1 rounded-lg">

        {providerInputs && providerInputs.length > 0 && showProviderInputs ?

          <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center max-w-lg my-auto mx-auto z-10'>
            <div className=' bg-white p-5 rounded-lg justify-center items-center h-5/6 my-auto mx-auto w-11/12 overflow-y-scroll'>
              <button className="" onClick={hideProviderInputs}><MdCancel className="h-7 w-7" /></button>
              < div className='bg-white mt-4 mb-4'>



                <SectionHeader label={'Entradas de proveedor'} />


                <div>

                  {providerInputs && providerInputs.length > 0 ?
                    <div id='header' className='grid grid-cols-12 items-center justify-around font-semibold sticky top-0 bg-white'>
                      <p className='col-span-3 text-center'>Sucursal</p>
                      <p className='col-span-3 text-center'>Encargado</p>
                      <p className='col-span-3 text-center'>Piezas</p>
                      <p className='col-span-1 text-center'>Kg</p>
                    </div>
                    : ''}



                  {providerInputs && providerInputs.length > 0 && providerInputs.map((providerInput) => (


                    <div key={providerInput._id} className={(currentUser._id == providerInput.employee || currentUser.role == roles.managerRole._id ? '' : 'py-3 ') + 'grid grid-cols-12 items-center rounded-lg border border-black border-opacity-30 shadow-sm mt-2'}>

                      <div id='list-element' className='flex col-span-10 items-center justify-around'>
                        <p className='text-center text-xs  w-3/12'>{providerInput.branch.branch ? providerInput.branch.branch : providerInput.branch}</p>
                        <p className='text-center text-xs w-3/12'>{providerInput.employee != null ? providerInput.employee.name + ' ' + providerInput.employee.lastName : ''}</p>
                        <p className='text-center text-xs w-3/12'>{providerInputsPieces}</p>
                        <p className='text-center text-xs w-1/12'>{`${providerInput.weight.toFixed(2)}`}</p>
                      </div>

                      {providerInput.employee._id == currentUser._id || roles.managerRole._id == currentUser.role ?

                        <div>
                          <button id={providerInput._id} onClick={() => { setIsOpen(!isOpen), setButtonId(providerInput._id) }} disabled={deletingLoading} className=' col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3'>
                            <span>
                              <FaTrash className='text-red-700 m-auto' />
                            </span>
                          </button>

                          {isOpen && providerInput._id == buttonId ?
                            <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center'>
                              <div className='bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5'>
                                <div>
                                  <p className='text-3xl font-semibold'>¿Estás seguro de borrar este registro?</p>
                                </div>
                                <div className='flex gap-10'>
                                  <div>
                                    <button className='rounded-lg bg-red-500 text-white shadow-lg w-20 h-10' onClick={() => { deleteProviderInput({ providerInput: providerInput, spliceProviderInput, pushProviderInput }), setIsOpen(!isOpen) }}>Si</button>
                                  </div>
                                  <div>
                                    <button className='rounded-lg border shadow-lg w-20 h-10' onClick={() => { setIsOpen(!isOpen) }}>No</button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            : ''}

                        </div>

                        : ''}

                    </div>

                  ))}

                </div>
              </div>
            </div>
          </div>
          : ''}

        {showProviderInputsStats && providerInputs && providerInputs.length > 0 ?

          < div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center max-w-lg my-auto mx-auto z-10'>
            <div className=' bg-white p-5 rounded-lg justify-center items-center h-5/6 my-auto mx-auto w-11/12 overflow-y-scroll'>
              <button className="" onClick={() => setShowProviderInputsStats(false)}><MdCancel className="h-7 w-7" /></button>
              < div className='bg-white mt-4 mb-4'>

                <SectionHeader label={'Datos de entradas de proveedores'}></SectionHeader>

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

              </div>
            </div>
          </div>

          : ''}
      </div>

    </main >
  )
}
