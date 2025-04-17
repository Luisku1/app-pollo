//Componente que recibirá un objeto con inputs, amount, weight, pieces, price, avgPrice y name (Del producto) y _id (Del producto también).
//El componente debede mostrar los datos de la siguiente manera:
//ProductName: nombre del producto (encabezado)
//<RowItem>pieces, avgPrice, weigth, amount </RowItem>

import { useState } from "react"
import Amount from "../Incomes/Amount"
import Modal from "../Modals/Modal"
import ProviderInputsList from "../Proveedores/ProviderInputsList"
import RowItem from "../RowItem"
import { useRoles } from "../../context/RolesContext"
import { useSelector } from "react-redux"

//el componente muestra una lista de productos, que al darle clic muestre los inputs correspondientes a dicho producto

export const ProductsListsMenu = ({ inputs, onDelete = null }) => {

  const { currentUser } = useSelector((state) => state.user)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const isEmpty = inputs.length === 0 || inputs === undefined || inputs === null
  const { isManager } = useRoles()

  const onDeleteListElement = (input) => {
    if (onDelete && selectedProduct) {
      onDelete({ ...input, externalIndex: selectedProduct.index })
    }
  }

  const renderOption = (input, index) => {

    const { amount, weight, pieces, avgPrice, _id, name, inputs } = input
    const avgWeight = (weight / pieces)

    return (
      <div key={_id} className="mb-2">
        <button className="p-2 shadow-sm rounded-md w-full hover:bg-slate-100 active:bg-gray-300 border border-black" onClick={() => { setSelectedProduct({ inputs, index, name }) }}>
          <div className="flex flex-col">
            <p className="font-semibold">{name}</p>
            <RowItem>
              <p className="text-center">{pieces} pz</p>
              {isManager(currentUser.role) && (
                Amount({ amount: avgPrice, className: 'text-red-800 font-semibold' })
              )}
              <p>{`${weight.toFixed(2)} Kg`}</p>
              {isManager(currentUser.role) && (
                Amount({ amount, className: 'items-center text-red-800 font-semibold' })
              )}
            </RowItem>
            {!(avgWeight == 'Infinity') && (
              <RowItem>
                <p className="text-center">{avgWeight.toFixed(2)} kg/pz</p>
              </RowItem>
            )}
          </div>
        </button>
      </div>
    )
  }

  const renderOptions = () => {
    return (
      <div className='px-1'>
        {inputs.map((data, index) => {
          return renderOption(data, index)
        })}
      </div>
    )
  }

  return (
    <div className="bg-white p-2">
      {!isEmpty ? (
        renderOptions()
      ) : (
        <div className="flex justify-center items-center h-full">
          <p className="text-gray-500">No hay entradas que listar</p>
        </div>
      )}
      {selectedProduct && (
        <Modal
          isOpen={selectedProduct}
          closeModal={() => setSelectedProduct(null)}
          title={`Entradas de ${selectedProduct.name}`}
          content={
            <ProviderInputsList
              inputs={inputs[selectedProduct.index].inputs ?? []}
              totalAmount={inputs[selectedProduct.index].amount}
              totalWeight={inputs[selectedProduct.index].weight}
              onDelete={onDeleteListElement}
            />
          }
        />
      )}
    </div>
  )
}