/* eslint-disable react/prop-types */
import { useState } from "react";
import RegisterDateSwitch from "../RegisterDateSwitch";
import { useDateNavigation } from "../../hooks/useDateNavigation";
import Entradas from "./Entradas/Entradas";
import Salidas from "./Salidas/Salidas";
import EntradaInicial from "../../pages/EntradaInicial";

export default function EntradasYSalidas({ products, branchAndCustomerSelectOptions }) {
  const { dateFromYYYYMMDD, today } = useDateNavigation();
  const [useToday, setUseToday] = useState(false);
  const [activeTab, setActiveTab] = useState('entradas_salidas');
  const [inputSelectedProduct, setInputSelectedProduct] = useState(null);
  const [outputSelectedProduct, setOutputSelectedProduct] = useState(null);

  const setInputSelectedProductToNull = () => setInputSelectedProduct(null);
  const setOutputSelectedProductToNull = () => setOutputSelectedProduct(null);
  const selectProduct = (option) => {
    setInputSelectedProduct(option);
    setOutputSelectedProduct(option);
  };

  // Determinar la fecha a usar
  const fechaRegistro = !today ? (useToday ? new Date().toISOString() : dateFromYYYYMMDD.toISOString()) : new Date().toISOString();

  return (
    <div className="p-1 rounded-2xl bg-white shadow-lg max-w-2xl mx-auto animate-fade-in">
      <div className="border bg-white p-1 mt-4 rounded-xl shadow-sm">
        {/* Tab Selector */}
        <div className="flex gap-2 mb-6 w-full">
          <button
            className={`flex-1 py-2 rounded-lg font-semibold transition text-base border ${activeTab === 'entradas_salidas' ? 'bg-blue-600 text-white shadow border-blue-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'}`}
            onClick={() => setActiveTab('entradas_salidas')}
            type="button"
            aria-selected={activeTab === 'entradas_salidas'}
          >
            Entradas y Salidas
          </button>
          <button
            className={`flex-1 py-2 rounded-lg font-semibold transition text-base border ${activeTab === 'proveedores' ? 'bg-blue-600 text-white shadow border-blue-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'}`}
            onClick={() => setActiveTab('proveedores')}
            type="button"
            aria-selected={activeTab === 'proveedores'}
          >
            Proveedores
          </button>
        </div>
        {/* Switch de fecha como en IncomesAndOutgoings */}
        {!today && (
          <div className="ml-4 mt-4">
            <RegisterDateSwitch multiswitch={true} useToday={useToday} setUseToday={setUseToday} />
          </div>
        )}
        {/* Tab Content */}
        {activeTab === 'entradas_salidas' && (
          <div>
            <div className="bg-outputs border rounded-lg border-black mb-4">
              <Salidas
                selectedProduct={outputSelectedProduct}
                setSelectedProduct={selectProduct}
                setSelectedProductToNull={setOutputSelectedProductToNull}
                products={products}
                branchAndCustomerSelectOptions={branchAndCustomerSelectOptions}
                date={fechaRegistro}
              />
            </div>
            <div className="bg-inputs border rounded-lg border-black">
              <Entradas
                selectedProduct={inputSelectedProduct}
                setSelectedProduct={selectProduct}
                setSelectedProductToNull={setInputSelectedProductToNull}
                products={products}
                branchAndCustomerSelectOptions={branchAndCustomerSelectOptions}
                date={fechaRegistro}
              />
            </div>
          </div>
        )}
        {activeTab === 'proveedores' && (
          <div className="mt-4">
            <EntradaInicial />
          </div>
        )}
      </div>
    </div>
  );
}
