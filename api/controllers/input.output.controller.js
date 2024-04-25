import Output from '../models/accounts/output.model.js'
import Input from '../models/accounts/input.model.js'
import { errorHandler } from '../utils/error.js'
import { getProductPrice } from './price.controller.js'
import ProviderInput from '../models/providers/provider.input.model.js'
import Branch from '../models/branch.model.js'

export const newInput = async (req, res, next) => {

  const { inputWeight, inputComment, inputPieces, company, product, employee, branch } = req.body
  const createdAt = new Date().toISOString()

  try {

    const price = await getProductPrice(product, branch)
    const amount = price.price * inputWeight
    const newInput = new Input({ weight: inputWeight, comment: inputComment, pieces: inputPieces, company, product, employee, branch, amount, price: price.price, createdAt })

    await newInput.save()

    res.status(200).json({ message: 'New input created', input: newInput })

  } catch (error) {

    next(error)
  }
}

export const getNetDifference = async (req, res, next) => {

  const date = new Date(req.params.date)
  const companyId = req.params.companyId

  const actualLocaleDate = new Date(new Date(date).getTime() - 6 * 60 * 60000)
  const actualLocaleDay = actualLocaleDate.toISOString().slice(0, 10)

  const actualLocaleDatePlusOne = new Date(actualLocaleDay)
  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)
  const actualLocalDayPlusOne = actualLocaleDatePlusOne.toISOString().slice(0, 10)

  const bottomDate = new Date(actualLocaleDay + 'T00:00:00.000-06:00')
  const topDate = new Date(actualLocalDayPlusOne + 'T00:00:00.000-06:00')

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
    }).populate({ path: 'branch', select: 'p' }).populate({ path: 'product', select: 'name' })

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
    }).populate({ path: 'branch', select: 'p' }).populate({ path: 'product', select: 'name' })

    const productsInputs = groupAndSumFunction(inputs)

    const productsOutputs = groupAndSumFunction(outputs)

    const netDifference = {}

    Object.keys(productsOutputs).forEach(product => {

      netDifference[product] = {

        name: productsOutputs[product].name,
        difference: (productsInputs[product] ? productsInputs[product].weight : 0) - (productsOutputs[product].weight)
      }
    })

    Object.keys(productsInputs).forEach(product => {

      if (!netDifference[product]) {

        netDifference[product] = {

          name: productsInputs[product].name,
          difference: (productsInputs[product].weight) - (productsOutputs[product].weight || 0)
        }
      }
    })

    res.status(200).json({ netDifference: netDifference })

  } catch (error) {

    next(error)
  }
}

const groupAndSumFunction = (items) => {

  const result = {}

  items.forEach(element => {

    const product = element.product._id
    const productName = element.product.name
    const weight = element.weight

    if (result[product]) {

      result[product].weight += weight / element.branch.p

    } else {

      result[product] = {
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

  const actualLocaleDate = new Date(new Date(date).getTime() - 6 * 60 * 60000)
  const actualLocaleDay = actualLocaleDate.toISOString().slice(0, 10)

  const actualLocaleDatePlusOne = new Date(actualLocaleDay)
  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)
  const actualLocalDayPlusOne = actualLocaleDatePlusOne.toISOString().slice(0, 10)

  const bottomDate = new Date(actualLocaleDay + 'T00:00:00.000-06:00')
  const topDate = new Date(actualLocalDayPlusOne + 'T00:00:00.000-06:00')


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
  const actualLocaleDate = new Date(new Date(date).getTime() - 6 * 60 * 60000)
  const actualLocaleDay = actualLocaleDate.toISOString().slice(0, 10)

  const actualLocaleDatePlusOne = new Date(actualLocaleDay)
  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)
  const actualLocalDayPlusOne = actualLocaleDatePlusOne.toISOString().slice(0, 10)

  const bottomDate = new Date(actualLocaleDay + 'T00:00:00.000-06:00')
  const topDate = new Date(actualLocalDayPlusOne + 'T00:00:00.000-06:00')

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

  const actualLocaleDate = new Date(new Date(date).getTime() - 6 * 60 * 60000)
  const actualLocaleDay = actualLocaleDate.toISOString().slice(0, 10)

  const actualLocaleDatePlusOne = new Date(actualLocaleDay)
  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)
  const actualLocalDayPlusOne = actualLocaleDatePlusOne.toISOString().slice(0, 10)

  const bottomDate = new Date(actualLocaleDay + 'T00:00:00.000-06:00')
  const topDate = new Date(actualLocalDayPlusOne + 'T00:00:00.000-06:00')


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

    const deleted = await Input.deleteOne({ _id: inputId })

    if (deleted.acknowledged == 1) {

      res.status(200).json({ message: 'Input deleted correctly' })

    } else {

      next(errorHandler(404, 'Input not founded'))
    }

  } catch (error) {

    next(error)
  }
}

export const newOutput = async (req, res, next) => {

  const { outputWeight, outputComment, pieces, company, product, employee, branch } = req.body
  const createdAt = new Date().toISOString()

  try {

    const price = await getProductPrice(product, branch)
    const amount = price.price * outputWeight
    const newOutput = new Output({ weight: outputWeight, comment: outputComment, pieces, company, product, employee, branch, amount, price: price.price, createdAt: createdAt })

    await newOutput.save()

    res.status(200).json({ message: 'New output created', output: newOutput })

  } catch (error) {

    next(error)
  }
}

export const getBranchOutputs = async (req, res, next) => {

  const date = new Date(req.params.date)
  const branchId = req.params.branchId

  const actualLocaleDate = new Date(new Date(date).getTime() - 6 * 60 * 60000)
  const actualLocaleDay = actualLocaleDate.toISOString().slice(0, 10)

  const actualLocaleDatePlusOne = new Date(actualLocaleDay)
  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)
  const actualLocalDayPlusOne = actualLocaleDatePlusOne.toISOString().slice(0, 10)

  const bottomDate = new Date(actualLocaleDay + 'T00:00:00.000-06:00')
  const topDate = new Date(actualLocalDayPlusOne + 'T00:00:00.000-06:00')


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

  const actualLocaleDate = new Date(new Date(date).getTime() - 6 * 60 * 60000)
  const actualLocaleDay = actualLocaleDate.toISOString().slice(0, 10)

  const actualLocaleDatePlusOne = new Date(actualLocaleDay)
  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)
  const actualLocalDayPlusOne = actualLocaleDatePlusOne.toISOString().slice(0, 10)

  const bottomDate = new Date(actualLocaleDay + 'T00:00:00.000-06:00')
  const topDate = new Date(actualLocalDayPlusOne + 'T00:00:00.000-06:00')


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

export const initializeProviderInput = async (req, res, next) => {

}

export const getProviderProductInputs = async (req, res, next) => {

  const { companyId, productId, date } = req.params

  const actualLocaleDate = new Date(new Date(date).getTime() - 6 * 60 * 60000)
  const actualLocaleDay = actualLocaleDate.toISOString().slice(0, 10)

  const actualLocaleDatePlusOne = new Date(actualLocaleDay)
  actualLocaleDatePlusOne.setDate(actualLocaleDatePlusOne.getDate() + 1)
  const actualLocalDayPlusOne = actualLocaleDatePlusOne.toISOString().slice(0, 10)

  const bottomDate = new Date(actualLocaleDay + 'T00:00:00.000-06:00')
  const topDate = new Date(actualLocalDayPlusOne + 'T00:00:00.000-06:00')

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

  const { weight, product, employee, branch, company, comment, pieces } = req.body
  const productPrice = await getProductPrice(product, branch)
  const amount = productPrice.price * weight
  const newProviderInput = ProviderInput({ weight, product, employee, branch, company, comment, pieces, amount })

  try {

    await newProviderInput.save()
    res.status(200).json({ providerInput: newProviderInput })

  } catch (error) {

    next(error)
  }
}

export const deleteProviderInput = async (req, res, next) => {

  const providerInputId = req.params.providerInputId

  try {

    const deleted = await ProviderInput.deleteOne({ _id: providerInputId })

    if (deleted.acknowledged == 1) {

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

    const deleted = await Output.deleteOne({ _id: outputId })

    if (deleted.acknowledged == 1) {

      res.status(200).json({ message: 'Output deleted correctly' })

    } else {

      next(errorHandler(404, 'Output not found'))
    }

  } catch (error) {

    next(error)
  }
}