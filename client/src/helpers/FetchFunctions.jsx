export const fetchPrices = async (branchId, date) => {

  try {

    const res = await fetch('/api/product/price/get-branch-prices/' + branchId + '/' + date)
    const data = await res.json()

    console.log(data.data)

    if (data.success === false) {

      return { error: data.message, data: null }
    }

    if (data.data) {

      return { error: null, data: data.data }

    } else {

      return { error: 'No hay precios registrados', data: null }
    }

  } catch (error) {

    return { error: error.message, data: null }

  }
}

export const fetchEmployees = async (companyId) => {

  try {

    const res = await fetch('/api/employee/get/' + companyId)
    const data = await res.json()

    if (data.success === false) {

      return { error: data.message, data: null }
    }

    if (!data.employees.length == 0) {

      return { error: null, data: data.employees }

    } else {

      return { error: 'No hay empleados registrados', data: null }
    }

  } catch (error) {

    return { error: error.message, data: null }

  }
}

export const fetchBranches = async (companyId) => {

  try {

    const res = await fetch('/api/branch/get-branches/' + companyId)
    const data = await res.json()

    if (data.success === false) {

      return { error: data.message, data: null }
    }

    if (!data.branches.length == 0) {

      return { error: null, data: data.branches }

    } else {

      return { error: 'No hay sucursales registradas', data: null }
    }

  } catch (error) {

    return { error: error.message, data: null }
  }
}

export const fetchProducts = async (companyId) => {

  try {

    const res = await fetch('/api/product/get-products/' + companyId)
    const data = await res.json()

    if (data.success === false) {


      return { error: data.message, data: null }
    }

    if (!data.products.length == 0) {

      return { error: null, data: data.products }

    } else {

      return { error: 'No hay productos registrados', data: null }
    }

  } catch (error) {

    return { error: error.message, data: null }

  }
}

export const fetchIncomeTypes = async () => {

  try {

    const res = await fetch('/api/income/types/get')
    const data = await res.json()

    if (data.success === false) {

      return { error: data.message, data: null }
    }

    if (!data.incomeTypes.length == 0) {

      return { error: null, data: data.incomeTypes }

    } else {

      return { error: 'No hay tipos de ingresos registrados', data: null }
    }

  } catch (error) {

    return { error: error.message, data: null }
  }
}

export const deleteOutgoingFetch = async (outgoingId) => {

  try {

    const res = await fetch('/api/outgoing/delete/' + outgoingId, {

      method: 'DELETE'

    })

    const data = await res.json()

    if (data.success === false) {

      return { error: data.message, data: null }
    }

    return { error: null, data: null }


  } catch (error) {

    return { error: error.message }
  }
}

export const deleteExtraOutgoingFetch = async (extraOutgoingId) => {

  try {

    const res = await fetch('/api/outgoing/extra-outgoing/delete/' + extraOutgoingId, {

      method: 'DELETE'

    })

    const data = await res.json()

    if (data.success === false) {

      return { error: data.message, data: null }
    }

    return { error: null, data: null }


  } catch (error) {

    return { error: error.message }
  }
}

export const deleteStockFetch = async (stockId) => {

  try {

    const res = await fetch('/api/stock/delete/' + stockId, {

      method: 'DELETE'

    })

    const data = await res.json()

    if (data.success === false) {

      return { error: data.message, data: null }
    }

    return { error: null, data: null }

  } catch (error) {

    return { error: error.message, data: null }
  }
}

export const deleteProductLossItemFetch = async (productLossId) => {

  try {

    const res = await fetch('/api/outgoing/product-loss/delete/' + productLossId, {

      method: 'DELETE'

    })

    const data = await res.json()

    if (data.success === false) {

      return { error: data.message, data: null }
    }

    return { error: null, data: null }

  } catch (error) {

    return { error: error.message, data: null }
  }
}

export const deleteOutputFetch = async (outputId) => {

  try {

    const res = await fetch('/api/output/delete-output/' + outputId, {

      method: 'DELETE'
    })

    const data = await res.json()

    if (data.success === false) {

      return { error: data.message, data: null }
    }

    return { error: null, data: null }

  } catch (error) {

    return { error: error.message, data: null }
  }
}

export const deleteIncomeFetch = async (incomeId) => {

  try {

    const res = await fetch('/api/income/delete/' + incomeId, {

      method: 'DELETE'
    })

    const data = await res.json()

    if (data.success === false) {

      return { error: data.message, data: null }
    }

    return { error: null, data: null }

  } catch (error) {

    return { error: error.message, data: null }
  }
}

export const deleteEmployeePaymentFetch = async (paymentId, incomeId, extraOutgoingId) => {

  try {

    const res = await fetch('/api/employee/delete-employee-payment/' + paymentId + '/' + incomeId + '/' + extraOutgoingId , {

      method: 'DELETE'
    })

    const data = await res.json()

    if (data.success === false) {

      return { error: data.message, data: null }
    }

    return { error: null, data: data }

  } catch (error) {

    return { error: error.message, data: null }
  }
}