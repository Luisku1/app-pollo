import Output from '../models/accounts/output.model.js'
import Input from '../models/accounts/input.model.js'
import { errorHandler } from '../utils/error.js'
import { getProductPrice } from './price.controller.js'
import ProviderInput from '../models/providers/provider.input.model.js'
import { updateReportInputs, updateReportOutputs } from '../utils/updateReport.js'
import { fetchBranchReport } from './branch.report.controller.js'
import { getDayRange } from '../utils/formatDate.js'

export const newInput = async (req, res, next) => {

  const { inputWeight, inputComment, inputPieces, company, product, employee, branch, inputSpecialPrice, createdAt } = req.body

  try {

    let amount = 0
    let price = 0
    let specialPrice = false

    if (inputSpecialPrice) {

      price = inputSpecialPrice
      amount = price * inputWeight
      specialPrice = !specialPrice

    } else {

      const branchReport = await fetchBranchReport(branch, createdAt)

      if (branchReport != null || branchReport != undefined) {

        if (Object.getOwnPropertyNames(branchReport).length != 0) {

          price = (await getProductPrice(product, branch, branchReport.createdAt)).price

        }
      } else {

        price = (await getProductPrice(product, branch)).price

      }
      amount = price * inputWeight
    }

    const newInput = new Input({ weight: inputWeight, comment: inputComment, pieces: inputPieces, company, product, employee, branch, amount, price: price, createdAt, specialPrice })

    await newInput.save()

    await updateReportInputs(branch, createdAt, amount)

    res.status(200).json({ message: 'New input created', input: newInput })

  } catch (error) {

    next(error)
  }
}

export const getNetDifference = async (req, res, next) => {

  const date = new Date(req.params.date)
  const companyId = req.params.companyId

  const {bottomDate, topDate} = getDayRange(date)

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

        result[employee._id].productsMovement[product].weight += weight / element.branch.p

      } else {

        result[employee._id].productsMovement[product] = {
          weight: weight / element.branch.p,
          name: productName
        }
      }

    } else {

      result[employee._id].productsMovement[product] = {
        weight: weight / element.branch.p,
        name: productName
      }
    }
  });

  return result
}

export const getBranchInputs = async (req, res, next) => {

  const date = new Date(req.params.date)
  const branchId = req.params.branchId

  const {bottomDate, topDate} = getDayRange(date)


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
        branch: branchId
      }]
    }).populate({ path: 'employee', select: 'name lastName' }).populate({ path: 'product', select: 'name' }).populate({ path: 'branch', select: 'branch' })

    if (inputs.length == 0) {

      next(errorHandler(404, 'Not inputs found'))

    } else {

      res.status(200).json({ inputs: inputs })
    }

  } catch (error) {

    next(error)
  }

}

export const getBranchProviderInputs = async (req, res, next) => {

  const branchId = req.params.branchId
  const date = new Date(req.params.date)

  const {bottomDate, topDate} = getDayRange(date)

  try {
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

    if (providerInputs) {

      res.status(200).json({ providerInputs: providerInputs })
    }

  } catch (error) {

    next(error)
  }
}

export const getInputs = async (req, res, next) => {

  const date = new Date(req.params.date)
  const companyId = req.params.companyId

  const {bottomDate, topDate} = getDayRange(date)


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

      res.status(200).json({ inputs: inputs })
    }

  } catch (error) {

    next(error)
  }

}

export const deleteInput = async (req, res, next) => {

  const inputId = req.params.inputId

  try {

    const input = await Input.findById(inputId)
    const deleted = await Input.deleteOne({ _id: inputId })

    if (deleted.acknowledged == 1) {

      await updateReportInputs(input.branch, input.createdAt, -(input.amount))
      res.status(200).json({ message: 'Input deleted correctly' })

    } else {

      next(errorHandler(404, 'Input not founded'))
    }

  } catch (error) {

    next(error)
  }
}

export const newOutput = async (req, res, next) => {

  const { outputWeight, outputComment, pieces, company, product, employee, branch, outputSpecialPrice, createdAt } = req.body

  try {

    let amount = 0
    let price = 0
    let specialPrice = false

    if (outputSpecialPrice) {

      price = outputSpecialPrice
      amount = price * outputWeight
      specialPrice = !specialPrice

    } else {

      const branchReport = await fetchBranchReport(branch, createdAt)

      if (branchReport != null || branchReport != undefined) {

        if (Object.getOwnPropertyNames(branchReport).length != 0) {

          price = (await getProductPrice(product, branch, branchReport.createdAt)).price

        }

      } else {

        price = (await getProductPrice(product, branch)).price

      }

      amount = price * outputWeight
    }

    const newOutput = new Output({ weight: outputWeight, comment: outputComment, pieces, company, product, employee, branch, amount, price: price, createdAt: createdAt, specialPrice })

    await newOutput.save()

    await updateReportOutputs(branch, createdAt, amount)
    res.status(200).json({ message: 'New output created', output: newOutput })

  } catch (error) {

    next(error)
  }
}

export const getBranchOutputs = async (req, res, next) => {

  const date = new Date(req.params.date)
  const branchId = req.params.branchId

  const {bottomDate, topDate} = getDayRange(date)

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
        branch: branchId
      }]
    }).populate({ path: 'employee', select: 'name lastName' }).populate({ path: 'product', select: 'name' }).populate({ path: 'branch', select: 'branch' })

    if (outputs.length == 0) {

      next(errorHandler(404, 'Not outputs found'))

    } else {

      res.status(200).json({ outputs: outputs })
    }

  } catch (error) {

    next(error)
  }
}

export const getOutputs = async (req, res, next) => {

  const date = new Date(req.params.date)
  const companyId = req.params.companyId

  const {bottomDate, topDate} = getDayRange(date)


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

      res.status(200).json({ outputs: outputs })
    }

  } catch (error) {

    next(error)
  }
}

export const getProviderProductInputs = async (req, res, next) => {

  const { companyId, productId, date } = req.params

  const {bottomDate, topDate} = getDayRange(date)

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

      res.status(200).json({ providerInputs: providerInputs })

    } else {

      next(errorHandler(404, 'No provider inputs found'))
    }

  } catch (error) {

    next(error)
  }
}

export const createProviderInput = async (req, res, next) => {

  const { providerInputWeight, product, employee, branch, company, comment, providerInputPieces, createdAt } = req.body
  const pricesDate = new Date(createdAt)
  pricesDate.setDate(pricesDate.getDate() + 1)
  const productPrice = await getProductPrice(product, branch, pricesDate)
  const amount = productPrice.price * providerInputWeight
  const newProviderInput = ProviderInput({ weight: providerInputWeight, product, employee, branch, company, comment, pieces: providerInputPieces, amount, createdAt })

  try {

    await newProviderInput.save()

    await updateReportInputs(branch, createdAt, amount)

    res.status(200).json({ providerInput: newProviderInput })

  } catch (error) {
    console.log(error)
    next(error)
  }
}

export const deleteProviderInput = async (req, res, next) => {

  const providerInputId = req.params.providerInputId

  try {

    const providerInput = await ProviderInput.findById(providerInputId)
    const deleted = await ProviderInput.deleteOne({ _id: providerInputId })

    if (deleted.acknowledged == 1) {

      await updateReportInputs(providerInput.branch, providerInput.createdAt, -(providerInput.amount))
      res.status(200).json({ message: 'Provider input deleted correctly' })

    } else {

      next(errorHandler(404, 'Provider input not found'))
    }

  } catch (error) {

    next(error)
  }
}

export const deleteOutput = async (req, res, next) => {

  const outputId = req.params.outputId

  try {

    const output = await Output.findById(outputId)
    const deleted = await Output.deleteOne({ _id: outputId })

    if (deleted.acknowledged == 1) {

      updateReportOutputs(output.branch, output.createdAt, -(output.amount))
      res.status(200).json({ message: 'Output deleted correctly' })

    } else {

      next(errorHandler(404, 'Output not found'))
    }

  } catch (error) {

    next(error)
  }
}