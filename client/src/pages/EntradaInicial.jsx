/* eslint-disable react/prop-types */
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import SectionHeader from "../components/SectionHeader";
import { FaListAlt } from "react-icons/fa";
import { BsInfoSquare } from "react-icons/bs";
import Select from 'react-select'
import { customSelectStyles } from "../helpers/Constants";
import MenuSucursal from "../components/EntradasDeProveedor/MenuSucursal";
import { useProviderInputs } from "../hooks/ProviderInputs/useProviderInputs";
import { getArrayForSelects, getElementForSelect, currency } from "../helpers/Functions";
import Modal from "../components/Modals/Modal";
import ShowListModal from "../components/Modals/ShowListModal";
import { ProductsListsMenu } from "../components/EntradasDeProveedor/ProductsListsMenu";
import { useRoles } from "../context/RolesContext";
import { useProducts } from "../hooks/Products/useProducts";
import { useCustomers } from "../hooks/Customers/useCustomers";
import { useBranches } from "../hooks/Branches/useBranches";
import { useDate } from "../context/DateContext";

export default function EntradaInicial() {

  const { company, currentUser } = useSelector((state) => state.user)
  const { currentDate: date } = useDate();
  const { isManager } = useRoles()
  const [selectedProduct, setSelectedProduct] = useState(null)
  const {
    products
  } = useProducts({ companyId: company._id })
  const { providerInputs, providerInputsWeight, providerInputsPieces, providerInputsAmount, onAddProviderInput, onDeleteProviderInput } = useProviderInputs({ companyId: company._id, productId: selectedProduct == null ? products?.length > 0 ? products[0]._id : null : selectedProduct._id, date })
  const [showProviderInputs, setShowProviderInputs] = useState(false)
  const [showProviderInputsStats, setShowProviderInputsStats] = useState(false)

  const {
    branches
  } = useBranches({ companyId: company._id })
  const {
    customers
  } = useCustomers({ companyId: company._id })

  const branchAndCustomerSelectOptions = [
    {
      label: 'Sucursales',
      options: getArrayForSelects(branches, (branch) => branch.branch)
    },
    {
      label: 'Clientes',
      options: getArrayForSelects(customers, (customer) => customer.name)
    }
  ]

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
      <div className='rounded-md p-3'>
        <SectionHeader label={'Entradas de Proveedor'} />
        <div className="grid grid-rows-2">
          <div className="flex gap-3 justify-self-end items-center">
            <div className="flex gap-3">
              <ShowListModal
                title={'Entradas de proveedor'}
                ListComponent={ProductsListsMenu}
                ListComponentProps={{ inputs: providerInputs, onDelete: onDeleteProviderInput }}
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
            <p className='font-bold text-md'>
              {/* Primera Parte: Siempre visible */}
              <span className="text-red-700 text-center">{`${providerInputsWeight.toFixed(2)} Kg / ${providerInputsPieces}`}</span>
              <sup className="text-red-700">u</sup>

              {/* Segunda Parte: Condicional */}
              {isManager(currentUser.role) && (
                <>
                  <span>:</span>
                  <span className="text-green-700">{` ${currency({ amount: providerInputsAmount })}`}</span>
                </>
              )}
            </p>
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
    </main>
  )
}
