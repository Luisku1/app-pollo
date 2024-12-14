/* eslint-disable react/prop-types */
import { useState } from "react";
import Entradas from "./Entradas/Entradas";
import Salidas from "./Salidas/Salidas";

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
    <div>
      <Salidas selectedProduct={outputSelectedProduct} setSelectedProduct={selectProduct} setSelectedProductToNull={setOutputSelectedProductToNull} products={products} branchAndCustomerSelectOptions={branchAndCustomerSelectOptions} date={date}></Salidas>

      <Entradas selectedProduct={inputSelectedProduct} setSelectedProduct={selectProduct} setSelectedProductToNull={setInputSelectedProductToNull} products={products} branchAndCustomerSelectOptions={branchAndCustomerSelectOptions} date={date}></Entradas>
    </div>
  )
}
