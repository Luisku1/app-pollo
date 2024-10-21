import Output from '../models/accounts/output.model.js'
import Input from '../models/accounts/input.model.js'
import { errorHandler } from '../utils/error.js'
import { getProductPrice } from './price.controller.js'
import ProviderInput from '../models/providers/provider.input.model.js'
import { updateReportInputs, updateReportOutputs } from '../utils/updateReport.js'
import { getDayRange } from '../utils/formatDate.js'
import mongoose, { Types } from 'mongoose'
import { createDefaultBranchReport, fetchBranchReport } from './branch.report.controller.js'
import BranchReport from '../models/accounts/branch.report.model.js'
import { updateEmployeeDailyBalancesBalance } from './employee.controller.js'

export const newBranchInput = async (req, res, next) => {

  const { weight, specialPrice, price, amount, comment, pieces, company, product, employee, branch, createdAt } = req.body

  try {

    const newInput = await newBranchInputAndUpdateBranchReport({ weight, comment, pieces, company, product, employee, branch, amount, price, createdAt, specialPrice })

    res.status(200).json({ message: 'New input created', input: newInput })

  } catch (error) {

    next(error)
  }
}

export const newBranchInputAndUpdateBranchReport = async ({ weight, comment, pieces, company, product, employee, branch, amount, price, createdAt, specialPrice }) => {

  let branchReport = null
  let input = null
  let updatedEmployeeDailyBalance = null
  let updatedBranchReport = null

  try {

    branchReport = await fetchBranchReport({ branchId: branch, date: createdAt })

    if (!branchReport) {

      branchReport = await createDefaultBranchReport({ branchId: branch, date: createdAt, companyId: company })
    }

    if (!branchReport) throw new Error("No se encontró ni se pudo crear el reporte");

    input = await Input.create({ weight, comment, pieces, company, product, employee, branch, amount, price, createdAt, specialPrice })

    if (!input) throw new Error("No se logró crear la entrada a sucursal");

    updatedBranchReport = await BranchReport.findByIdAndUpdate(branchReport._id, {

      $push: { inputsArray: input._id },
      $inc: { inputs: input.amount, balance: -input.amount }

    })

    if (updatedBranchReport) {

      if (updatedBranchReport.employee) {

        updatedEmployeeDailyBalance = await updateEmployeeDailyBalancesBalance({ branchReport: updatedBranchReport })

        if (!updatedEmployeeDailyBalance) throw new Error("No se pudo actualizar la cuenta del empleado");
      }

      return input

    } else {

      throw new Error("Hubo un problema encontrando el reporte a modificar");
    }

  } catch (error) {

    if (input) {

      await Input.findByIdAndDelete(input._id)
    }

    if (!updatedEmployeeDailyBalance && updatedBranchReport
      && (branchReport.balance != updatedBranchReport.balance
        ||
        branchReport.inputsArray != updatedBranchReport.inputsArray
        || branchReport.inputs != updatedBranchReport.inputs)) {

      await BranchReport.findByIdAndUpdate(branchReport._id, { balance: branchReport.balance, inputsArray: branchReport.inputsArray, inputs: branchReport.inputs })
    }

    throw error;

  }
}

export const newCustomerInput = async (req, res, next) => {

  const { weight, price, pieces, amount, employee, comment, product, company, branchCustomer: customer, createdAt } = req.body

  try {

    const newCustomerInput = new Input({ weight, pieces, price, employee, amount, comment, product, company, customer, createdAt })

    await newCustomerInput.save()

    // await recalculateCustomerNote

    res.status(200).json({ input: newInput })

  } catch (error) {

    next(error)
  }
}

export const getNetDifference = async (req, res, next) => {

  const date = new Date(req.params.date)
  const companyId = req.params.companyId

  const { bottomDate, topDate } = getDayRange(date)

  try {

    const outputs = await Output.find({
      $and: [
        {
          createdAt: {

            $gte: bottomDate
          }
        },
        {
          createdAt: {

            $lt: topDate
          }

        },
        {
          company: companyId
        }]
    }).populate({ path: 'branch', select: 'p' }).populate({ path: 'product', select: 'name' }).populate({ path: 'employee', select: 'name lastName' })

    const inputs = await Input.find({
      $and: [{

        createdAt: {

          $gte: bottomDate
        }
      },
      {

        createdAt: {

          $lt: topDate
        }

      },
      {
        company: companyId
      }]
    }).populate({ path: 'branch', select: 'p' }).populate({ path: 'product', select: 'name' }).populate({ path: 'employee', select: 'name lastName' })

    const employeesInputs = groupAndSumFunction(inputs)

    const employeesOutputs = groupAndSumFunction(outputs)

    const employeeNetDifference = {}

    Object.keys(employeesOutputs).forEach(employeeOutputs => {

      if (!employeeNetDifference[employeeOutputs]) {

        employeeNetDifference[employeeOutputs] = {

          employee: employeesOutputs[employeeOutputs].employee,
          totalDifference: 0.00,
          netDifference: {}
        }
      }

      Object.keys(employeesOutputs[employeeOutputs].productsMovement).forEach((product => {

        const difference = (employeesInputs[employeeOutputs] ? employeesInputs[employeeOutputs].productsMovement[product] ? employeesInputs[employeeOutputs].productsMovement[product].weight : 0 : 0) - (employeesOutputs[employeeOutputs].productsMovement[product].weight)

        employeeNetDifference[employeeOutputs].totalDifference += difference

        employeeNetDifference[employeeOutputs].netDifference[product] = {

          name: employeesOutputs[employeeOutputs].productsMovement[product].name,
          difference: difference
        }
      }))
    })


    Object.keys(employeesInputs).forEach(employeeInputs => {

      if (!employeeNetDifference[employeeInputs]) {

        employeeNetDifference[employeeInputs] = {

          employee: employeesInputs[employeeInputs].employee,
          totalDifference: 0.00,
          netDifference: {}
        }
      }

      Object.keys(employeesInputs[employeeInputs].productsMovement).forEach((product => {

        if (!employeeNetDifference[employeeInputs].netDifference[product]) {

          const difference = (employeesInputs[employeeInputs].productsMovement[product].weight) - (employeesOutputs[employeeInputs] ? employeesOutputs[employeeInputs].productsMovement[product] ? employeesOutputs[employeeInputs].productsMovement[product].weight : 0 : 0)

          employeeNetDifference[employeeInputs].totalDifference += difference

          employeeNetDifference[employeeInputs].netDifference[product] = {

            name: employeesInputs[employeeInputs].productsMovement[product].name,
            difference: difference
          }
        }
      }))
    })

    res.status(200).json({ netDifference: employeeNetDifference })

  } catch (error) {

    next(error)
  }
}

const groupAndSumFunction = (items) => {

  const result = {}

  items.forEach(element => {

    const employee = element.employee
    const product = element.product._id
    const productName = element.product.name
    const weight = element.weight

    if (!result[employee._id]) {

      result[employee._id] = {
        employee: employee,
        productsMovement: {}
      }
    }

    if (result[employee._id].productsMovement) {

      if (result[employee._id].productsMovement[product]) {

        result[employee._id].productsMovement[product].weight += weight / (element.branch?.p || 0)

      } else {

        result[employee._id].productsMovement[product] = {
          weight: weight / (element.branch?.p || 0),
          name: productName
        }
      }

    } else {

      result[employee._id].productsMovement[product] = {
        weight: weight / (element.branch?.p || 0),
        name: productName
      }
    }
  });

  return result
}

export const getBranchInputsRequest = async (req, res, next) => {

  const date = new Date(req.params.date)
  const branchId = req.params.branchId

  try {

    const inputs = await getBranchInputs({ branchId, date })

    if (inputs.length == 0) {

      next(errorHandler(404, 'Not inputs found'))

    } else {

      res.status(200).json({ inputs: inputs })
    }

  } catch (error) {

    next(error)
  }

}

export const getBranchInputs = async ({ branchId, date }) => {


  const { bottomDate, topDate } = getDayRange(date)

  const inputs = await Input.find({

    $and: [{

      createdAt: {

        $gte: bottomDate
      }
    },
    {

      createdAt: {

        $lt: topDate
      }

    },
    {
      branch: branchId
    }]
  }).populate({ path: 'employee', select: 'name lastName' }).populate({ path: 'product', select: 'name' }).populate({ path: 'branch', select: 'branch' })

  return inputs.length > 0 ? inputs : []
}

export const getBranchProviderInputsRequest = async (req, res, next) => {

  const branchId = req.params.branchId
  const date = new Date(req.params.date)

  try {

    const providerInputs = await getBranchProviderInputs({ branchId, date })

    if (providerInputs) {

      res.status(200).json({ providerInputs: providerInputs })
    }

  } catch (error) {

    next(error)
  }
}


export const getBranchProviderInputs = async ({ branchId, date }) => {

  const { bottomDate, topDate } = getDayRange(date)

  const providerInputs = await ProviderInput.find({

    $and: [{

      createdAt: {

        $gte: bottomDate
      }
    },
    {

      createdAt: {

        $lt: topDate
      }

    },
    {
      branch: branchId
    }]
  }).populate({ path: 'product', select: 'name' }).populate({ path: 'employee', select: 'name lastName' })

  return providerInputs.length > 0 ? providerInputs : []
}




export const getInputs = async (req, res, next) => {

  const date = new Date(req.params.date)
  const companyId = req.params.companyId

  const { bottomDate, topDate } = getDayRange(date)


  try {

    const inputs = await Input.find({

      $and: [{

        createdAt: {

          $gte: bottomDate
        }
      },
      {

        createdAt: {

          $lt: topDate
        }

      },
      {
        company: companyId
      }]
    }).populate({ path: 'employee', select: 'name lastName' }).populate({ path: 'product', select: 'name' }).populate({ path: 'branch', select: 'branch position' })

    if (inputs.length == 0) {

      next(errorHandler(404, 'Not inputs found'))

    } else {

      let totalWeight = 0
      const branchInputs = []
      const customerInputs = []

      inputs.forEach(input => {

        if (input.branch === undefined) {

          customerInputs.push(input)

        } else {

          branchInputs.push(input)
        }

        totalWeight += input.weight
      })

      branchInputs.sort((input, nextInput) => {

        return input.branch.position - nextInput.branch.position
      })

      res.status(200).json({ inputs: [...branchInputs, ...customerInputs], totalWeight: totalWeight })
    }

  } catch (error) {

    next(error)
  }

}

export const getBranchInputsAvg = async (req, res, next) => {

  const branchId = req.params.branchId
  const date = new Date()

  date.setDate(date.getDate() - 30)

  try {

    const branchInputsAvg = await Input.aggregate([
      {
        $match: {
          "branch": new Types.ObjectId(branchId),
          "createdAt": { $gte: date }
        }
      },
      {
        $project: {
          total: { $sum: ["$amount"] }
        }
      },
      {
        $group: {
          _id: branchId,
          average: { $avg: '$total' }
        }
      }
    ])

    if (branchInputsAvg.length > 0) {

      res.status(200).json({ branchInputsAvg: branchInputsAvg[0].average })

    } else {

      res.status(200).json({ branchInputsAvg: 0 })
    }


  } catch (error) {

    next(error)
  }

}

export const deleteInput = async (req, res, next) => {

  const inputId = req.params.inputId

  let deletedInput = null
  let branchReport = null
  let updatedEmployeeDailyBalance = null
  let updatedBranchReport = null

  try {

    deletedInput = await Input.findByIdAndDelete(inputId)

    if (!deletedInput) throw new Error("No se eliminó el efectivo");

    branchReport = await fetchBranchReport({ branchId: deletedInput.branch, date: deletedInput.createdAt })

    if (!branchReport) throw new Error("No se encontró el reporte para este movimiento");

    updatedBranchReport = await BranchReport.findByIdAndUpdate(branchReport._id, {

      $pull: { inputsArray: deletedInput._id },
      $inc: { inputs: -deletedInput.amount, balance: deletedInput.amount }

    }, { new: true })

    if (updatedBranchReport) {

      if (updatedBranchReport.employee) {

        updatedEmployeeDailyBalance = await updateEmployeeDailyBalancesBalance({ branchReport: branchReport })

        if (!updatedEmployeeDailyBalance) throw new Error("No se pudo actualizar la cuenta del empleado");
      }

    } else {

      throw new Error("No se pudo actualizar la cuenta, verifique el error");

    }

    res.status(200).json({ message: 'Input deleted correctly' })

  } catch (error) {

    if (deletedInput) {

      await Input.create({ deletedInput })
    }

    if (!updatedEmployeeDailyBalance && updatedBranchReport
      && (branchReport.balance != updatedBranchReport.balance
        ||
        branchReport.inputsArray != updatedBranchReport.inputsArray
        || branchReport.inputs != updatedBranchReport.inputs)) {

      await BranchReport.findByIdAndUpdate(branchReport._id, { balance: branchReport.balance, inputsArray: branchReport.inputsArray, inputs: branchReport.inputs })
    }

    next(error);

  }
}

export const newBranchOutput = async (req, res, next) => {

  const { weight, comment, amount, price, pieces, company, product, employee, branch: branch, specialPrice, createdAt } = req.body

  console.log(req.body)

  try {

    const newOutput = await newBranchOutputAndUpdateBranchReport({ weight, comment, pieces, company, product, employee, branch, amount, price, createdAt, specialPrice })
    res.status(200).json({ message: 'New output created', output: newOutput })

  } catch (error) {

    next(error)
  }
}

export const newBranchOutputAndUpdateBranchReport = async ({ weight, comment, pieces, company, product, employee, branch, amount, price, createdAt, specialPrice }) => {

  let branchReport = null
  let output = null
  let updatedEmployeeDailyBalance = null
  let updatedBranchReport = null

  try {

    branchReport = await fetchBranchReport({ branchId: branch, date: createdAt })

    if (!branchReport) {

      branchReport = await createDefaultBranchReport({ branchId: branch, date: createdAt, companyId: company })
    }

    if (!branchReport) throw new Error("No se encontró ni se pudo crear el reporte");

    output = await Output.create({ weight, comment, pieces, company, product, employee, branch, amount, price, createdAt, specialPrice })

    if (!output) throw new Error("No se logró crear el registro");

    updatedBranchReport = await BranchReport.findByIdAndUpdate(branchReport._id, {

      $push: { outputsArray: output._id },
      $inc: { outputs: output.amount, balance: output.amount },
    }, { new: true })

    if (updatedBranchReport) {

      if (updatedBranchReport.employee) {

        updatedEmployeeDailyBalance = await updateEmployeeDailyBalancesBalance({ branchReport: updatedBranchReport })

        if (!updatedEmployeeDailyBalance) throw new Error("No se pudo actualizar la cuenta del empleado");
      }

      return output

    } else {

      throw new Error("Hubo un problema encontrando el reporte a modificar");
    }

  } catch (error) {

    if (output) {

      await Output.findByIdAndDelete(income._id)
    }

    if (!updatedEmployeeDailyBalance && updatedBranchReport
      && (branchReport.balance != updatedBranchReport.balance
        ||
        branchReport.outputsArray != updatedBranchReport.outputsArray
        || branchReport.outputs != updatedBranchReport.outputs)) {

      await BranchReport.findByIdAndUpdate(branchReport._id, { balance: branchReport.balance, outputsArray: branchReport.outputsArray, outputs: branchReport.outputs })
    }

    throw error;

  }
}

export const newCustomerOutput = async (req, res, next) => {

  const { weight, amount, comment, pieces, company, product, employee, customer, price, createdAt } = req.body

  try {

    const newOutput = new Output({ weight, comment, pieces, company, product, employee, customer, amount, price, createdAt })

    await newOutput.save()

    // await updateCustomerTicket(branch, createdAt, amount)
    res.status(200).json({ message: 'New output created', output: newOutput })

  } catch (error) {

    next(error)

  }
}

export const getBranchOutputsRequest = async (req, res, next) => {

  const date = new Date(req.params.date)
  const branchId = req.params.branchId

  try {

    const outputs = await getBranchOutputs({ branchId, date })

    if (outputs.length == 0) {

      next(errorHandler(404, 'Not outputs found'))

    } else {

      res.status(200).json({ outputs: outputs })
    }

  } catch (error) {

    next(error)
  }
}

export const getBranchOutputs = async ({ branchId, date }) => {

  const { bottomDate, topDate } = getDayRange(date)

  const outputs = await Output.find({

    $and: [{

      createdAt: {

        $gte: bottomDate
      }
    },
    {

      createdAt: {

        $lt: topDate
      }

    },
    {
      branch: branchId
    }]
  }).populate({ path: 'employee', select: 'name lastName' }).populate({ path: 'product', select: 'name' }).populate({ path: 'branch', select: 'branch' })

  return outputs.length > 0 ? outputs : []
}

export const getOutputs = async (req, res, next) => {

  const date = new Date(req.params.date)
  const companyId = req.params.companyId

  const { bottomDate, topDate } = getDayRange(date)

  try {

    const outputs = await Output.find({

      $and: [{

        createdAt: {

          $gte: bottomDate
        }
      },
      {

        createdAt: {

          $lt: topDate
        }

      },
      {
        company: companyId
      }]
    }).populate({ path: 'employee', select: 'name lastName' }).populate({ path: 'product', select: 'name' }).populate({ path: 'branch', select: 'branch position' })

    if (outputs.length == 0) {

      next(errorHandler(404, 'Not outputs found'))

    } else {

      let totalWeight = 0

      const branchOutputs = []
      const customerOutputs = []

      outputs.forEach(output => {

        if (output.branch === undefined) {

          customerOutputs.push(output)

        } else {

          branchOutputs.push(output)
        }

        totalWeight += output.weight
      })

      branchOutputs.sort((output, nextOutput) => {

        return output.branch.position - nextOutput.branch.position
      })

      res.status(200).json({ outputs: [...branchOutputs, ...customerOutputs], totalWeight: totalWeight })
    }

  } catch (error) {

    next(error)
  }
}

export const getBranchOutputsAvg = async (req, res, next) => {

  const branchId = req.params.branchId
  const date = new Date()

  date.setDate(date.getDate() - 30)

  try {

    const branchOutputsAvg = await Output.aggregate([
      {
        $match: {
          "branch": new Types.ObjectId(branchId),
          "createdAt": { $gte: date }
        }
      },
      {
        $project: {
          total: { $sum: ["$amount"] }
        }
      },
      {
        $group: {
          _id: branchId,
          average: { $avg: '$total' }
        }
      }
    ])

    if (branchOutputsAvg.length > 0) {

      res.status(200).json({ branchOutputsAvg: branchOutputsAvg[0].average })

    } else {

      res.status(200).json({ branchOutputsAvg: 0 })
    }

  } catch (error) {

    next(error)
  }

}

export const getProviderProductInputs = async (req, res, next) => {

  const { companyId, productId } = req.params
  const date = new Date(req.params.date)

  const { bottomDate, topDate } = getDayRange(date)

  try {

    const providerInputs = await ProviderInput.find({

      $and: [
        {
          createdAt: {

            $gte: bottomDate
          }
        },
        {
          createdAt: {

            $lt: topDate
          }
        },
        {
          product: productId
        },
        {
          company: companyId
        }
      ]
    }).populate({ path: 'branch', select: 'branch position' }).populate({ path: 'employee', select: 'name lastName' })

    if (providerInputs.length > 0) {

      let providerInputsWeight = 0.0
      let providerInputsPieces = 0
      let providerInputsAmount = 0.0

      providerInputs.forEach((input) => {

        providerInputsWeight += input.weight
        providerInputsPieces += input.pieces
        providerInputsAmount += input.amount
      })

      providerInputs.sort((providerInput, nextProviderInput) => {

        return providerInput.branch.position - nextProviderInput.branch.position
      })

      res.status(200).json({ providerInputs: providerInputs, providerInputsWeight, providerInputsPieces, providerInputsAmount })

    } else {

      next(errorHandler(404, 'No provider inputs found'))
    }

  } catch (error) {

    next(error)
  }
}

export const getBranchProviderInputsAvg = async (req, res, next) => {

  const branchId = req.params.branchId
  const date = new Date()

  date.setDate(date.getDate() - 30)

  try {

    const branchProviderInputsAvg = await ProviderInput.aggregate([
      {
        $match: {
          "branch": new Types.ObjectId(branchId),
          "createdAt": { $gte: date }
        }
      },
      {
        $project: {
          total: { $sum: ["$amount"] }
        }
      },
      {
        $group: {
          _id: branchId,
          average: { $avg: '$total' }
        }
      }
    ])

    if (branchProviderInputsAvg.length > 0) {

      res.status(200).json({ branchProviderInputsAvg: branchProviderInputsAvg[0].average })

    } else {

      res.status(200).json({ branchProviderInputsAvg: 0 })
    }

  } catch (error) {

    next(error)
  }

}

export const createBranchProviderInput = async (req, res, next) => {

  const { weight, product, price, amount, employee, branch, company, comment, pieces, specialPrice, createdAt } = req.body

  try {
    const newProviderInput = await createBranchProviderInputAndUpdateBranchReport({ weight, product, price, employee, branch, company, comment, pieces, amount, specialPrice, createdAt })

    res.status(200).json({ providerInput: newProviderInput })

  } catch (error) {
    console.log(error)
    next(error)
  }
}

export const createBranchProviderInputAndUpdateBranchReport = async ({ weight, product, price, employee, branch, company, comment, pieces, amount, specialPrice, createdAt }) => {

  let branchReport = null
  let providerInput = null
  let updatedEmployeeDailyBalance = null
  let updatedBranchReport = null

  try {

    branchReport = await fetchBranchReport({ branchId: branch, date: createdAt })

    if (!branchReport) {

      branchReport = await createDefaultBranchReport({ branchId: branch, date: createdAt, companyId: company })
    }

    if (!branchReport) throw new Error("No se encontró ni se pudo crear el reporte");

    providerInput = await ProviderInput.create({ weight, product, price, employee, branch, company, comment, pieces, amount, specialPrice, createdAt })

    if (!providerInput) throw new Error("No creó el registro");

    updatedBranchReport = await BranchReport.findByIdAndUpdate(branchReport._id, {

      $push: { providerInputsArray: providerInput._id },
      $inc: { providerInputs: providerInput.amount, balance: -providerInput.amount }

    }, { new: true })

    if (updatedBranchReport) {

      if (updatedBranchReport.employee) {

        updatedEmployeeDailyBalance = await updateEmployeeDailyBalancesBalance({ branchReport: updatedBranchReport })

        if (!updatedEmployeeDailyBalance) throw new Error("No se pudo actualizar la cuenta del empleado");
      }

      return providerInput

    } else {

      throw new Error("Hubo un problema encontrando el reporte a modificar");
    }

  } catch (error) {

    if (providerInput) {

      await ProviderInput.findByIdAndDelete(providerInput._id)
    }

    if (!updatedEmployeeDailyBalance && updatedBranchReport &&
      (branchReport.balance != updatedBranchReport.balance
        ||
        branchReport.providerInputsArray != updatedBranchReport.providerInputsArray
        || branchReport.providerInputs != updatedBranchReport.providerInputs)) {

      await BranchReport.findByIdAndUpdate(branchReport._id, { balance: branchReport.balance, providerInputsArray: branchReport.providerInputsArray, providerInputs: branchReport.providerInputs })
    }

    throw error;
  }
}

export const createCustomerProviderInput = async (req, res, next) => {

  const { weight, product, price, amount, employee, customer, company, comment, pieces, createdAt } = req.body
  const newProviderInput = ProviderInput({ weight, product, price, employee, customer, company, comment, pieces, amount, createdAt })

  try {

    await newProviderInput.save()

    // await updateReportInputs(branch, createdAt, amount)

    res.status(200).json({ providerInput: newProviderInput })

  } catch (error) {
    console.log(error)
    next(error)
  }
}

export const deleteProviderInput = async (req, res, next) => {

  const providerInputId = req.params.providerInputId

  let deletedProviderInput = null
  let branchReport = null
  let updatedEmployeeDailyBalance = null
  let updatedBranchReport = null

  try {

    deletedProviderInput = await ProviderInput.findByIdAndDelete(providerInputId)

    if (!deletedProviderInput) throw new Error("No se eliminó el registro");

    branchReport = await fetchBranchReport({ branchId: deletedProviderInput.branch, date: deletedProviderInput.createdAt })

    if (!branchReport) throw new Error("No se encontró ningún reporte ");

    updatedBranchReport = await BranchReport.findByIdAndUpdate(branchReport._id, {

      $pull: { providerInputsArray: deletedProviderInput._id },
      $inc: {
        providerInputs: -deletedProviderInput.amount,
        balance: deletedProviderInput.amount
      }

    }, { new: true })

    if (updatedBranchReport) {

      if (updatedBranchReport.employee) {

        updatedEmployeeDailyBalance = await updateEmployeeDailyBalancesBalance({ branchReport: branchReport })

        if (!updatedEmployeeDailyBalance) throw new Error("No se pudo actualizar la cuenta del empleado");
      }

    } else {

      throw new Error("No se pudo actualizar la cuenta, verifique el error");

    }

    res.status(200).json('Registro eliminado')

  } catch (error) {

    if (deletedProviderInput) {

      await ProviderInput.create({ deletedProviderInput })
    }

    if (!updatedEmployeeDailyBalance && updatedBranchReport &&
      (branchReport.balance != updatedBranchReport.balance
        ||
        branchReport.providerInputsArray != updatedBranchReport.providerInputsArray
        || branchReport.providerInputs != updatedBranchReport.providerInputs)) {

      await BranchReport.findByIdAndUpdate(branchReport._id, { balance: branchReport.balance, providerInputsArray: branchReport.providerInputsArray, providerInputs: branchReport.providerInputs })
    }

    next(error);

  }
}

export const deleteOutput = async (req, res, next) => {

  const outputId = req.params.outputId

  let deletedOutput = null
  let branchReport = null
  let updatedEmployeeDailyBalance = null
  let updatedBranchReport = null

  try {

    deletedOutput = await Output.findByIdAndDelete(outputId)

    if (!deletedOutput) throw new Error("No se eliminó el registro");

    branchReport = await fetchBranchReport({ branchId: deletedOutput.branch, date: deletedOutput.createdAt })

    if (!branchReport) throw new Error("No se encontró ningún reporte ");

    updatedBranchReport = await BranchReport.findByIdAndUpdate(branchReport._id, {

      $pull: { outputsArray: deletedOutput._id },
      $inc: { outputs: -deletedOutput.amount, balance: -deletedOutput.amount }

    }, { new: true })

    if (updatedBranchReport) {

      if (updatedBranchReport.employee) {

        updatedEmployeeDailyBalance = await updateEmployeeDailyBalancesBalance({ branchReport: branchReport })

        if (!updatedEmployeeDailyBalance) throw new Error("No se pudo actualizar la cuenta del empleado");
      }

    } else {

      throw new Error("No se pudo actualizar la cuenta, verifique el error");
    }

    res.status(200).json('Registro eliminado')

  } catch (error) {

    if (deletedOutput) {

      await Output.create({ deletedOutput })
    }

    if (!updatedEmployeeDailyBalance && updatedBranchReport
      && (branchReport.balance != updatedBranchReport.balance
        ||
        branchReport.outputsArray != updatedBranchReport.outputsArray
        || branchReport.outputs != updatedBranchReport.outputs)) {

      await BranchReport.findByIdAndUpdate(branchReport._id, { balance: branchReport.balance, outputsArray: branchReport.outputsArray, outputs: branchReport.outputs })
    }

    next(error);
  }
}