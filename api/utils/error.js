export const errorHandler = (statusCode, message) => {
  const error = new Error()

  error.statusCode = statusCode
  error.message = message

  return error
}

export const runTransactionWithRetry = async (txnFunction) => {
console.log('Se queida aquí ')
  while (true) {
    try {
      txnFunction();
      break; // Si la transacción tiene éxito, salimos del bucle.
    } catch (error) {
      if (isWriteConflict(error)) {
        continue; // Reintentamos la transacción.
      } else {
        throw error; // Si es otro error, lo lanzamos.
      }
    }
  }
}
function isWriteConflict(error) {
  console.log(error)
  return error.hasErrorLabel('WriteConflict') || error.message.includes("Write conflict");

}