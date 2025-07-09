/* eslint-disable react/prop-types */
import { useState } from "react";
import Entradas from "./Entradas/Entradas";
import Salidas from "./Salidas/Salidas";
import { useBranches } from "../../hooks/Branches/useBranches";
import { useCustomers } from "../../hooks/Customers/useCustomers";

export default function EntradasYSalidas({ products, branchAndCustomerSelectOptions, date }) {

  const [inputSelectedProduct, setInputSelectedProduct] = useState(null)
  const [outputSelectedProduct, setOutputSelectedProduct] = useState(null)

  const setInputSelectedProductToNull = () => {

    setInputSelectedProduct(null)
  }

  const setOutputSelectedProductToNull = () => {

    setOutputSelectedProduct(null)
  }

  const selectProduct = (option) => {

    setInputSelectedProduct(option)
    setOutputSelectedProduct(option)
  }

  return (
    <div className="">
      <div className="bg-outputs border rounded-lg border-black mb-4">
        <Salidas selectedProduct={outputSelectedProduct} setSelectedProduct={selectProduct} setSelectedProductToNull={setOutputSelectedProductToNull} products={products} branchAndCustomerSelectOptions={branchAndCustomerSelectOptions} date={date}></Salidas>
      </div>
      <div className="bg-inputs border rounded-lg border-black">
        <Entradas selectedProduct={inputSelectedProduct} setSelectedProduct={selectProduct} setSelectedProductToNull={setInputSelectedProductToNull} products={products} branchAndCustomerSelectOptions={branchAndCustomerSelectOptions} date={date}></Entradas>
      </div>
    </div>
  )
}
