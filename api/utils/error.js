export const errorHandler = (statusCode, message) => {
    const error = new Error()

    error.statusCode = statusCode
    error.message = message

    return error
}

export const runWithRetry = async (operation, session, retries = 3) => {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            await operation(session);
            return;  // Salir si la operación es exitosa
        } catch (error) {
            if (attempt === retries - 1) throw error;  // Lanzar error después de último intento
            console.log(`Retry ${attempt + 1} due to error: ${error.message}`);
            await session.abortTransaction();
            await session.startTransaction();  // Reiniciar la transacción
        }
    }
}