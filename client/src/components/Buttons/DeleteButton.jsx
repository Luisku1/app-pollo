/* eslint-disable react/prop-types */
import { FaTrash } from "react-icons/fa"
import ConfirmationButton from "./ConfirmationButton";

export default function DeleteButton({deleteFunction }) {
  return (
    <ConfirmationButton
      onConfirm={() => deleteFunction()}
      confirmationMessage="¿Estás seguro de que deseas eliminar este elemento?"
    >
      <FaTrash className='text-red-700 m-auto' />
    </ConfirmationButton>
  );
}
