import Output from '../models/accounts/output.model.js'
import Input from '../models/accounts/input.model.js'
import { errorHandler } from '../utils/error.js'
import Price from '../models/accounts/price.model.js'
import { getProductPrice } from './price.controller.js'

export const newInput = async (req, res, next) => {

  const {inputWeight, inputComment, inputPieces, company, product, employee, branch} = req.body
  const createdAt = new Date().toISOString()

  try {

    const price = await getProductPrice(product, branch)
    const amount = price.price * inputWeight
    const newInput = new Input({weight: inputWeight, comment: inputComment, pieces: inputPieces, company, product, employee, branch, amount, price: price.price, createdAt})

    await newInput.save()

    res.status(200).json({message: 'New input created', input: newInput})

  } catch (error) {

    next(error)
  }
}

export const getBranchInputs = async (req, res, next) => {

  const date = new Date(req.params.date)
  const branchId = req.params.branchId

  const functionalDate = new Date(date)
  const functionalDatePlusOneDay = new Date(date)

  functionalDatePlusOneDay.setDate(functionalDatePlusOneDay.getDate() + 1)

  const bottomDate = new Date(functionalDate.toISOString().slice(0, 10) + 'T00:00:00.000-06:00')
  const topDate = new Date(functionalDatePlusOneDay.toISOString().slice(0, 10) + 'T00:00:00.000-06:00')


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
    }).populate({path: 'employee', select: 'name lastName'}).populate({path: 'product', select: 'name'}).populate({path: 'branch', select: 'branch'})

    if (inputs.length == 0) {

      next(errorHandler(404, 'Not inputs found'))

    } else {

      res.status(200).json({ inputs: inputs })
    }

  } catch (error) {

    next(error)
  }

}

export const getInputs = async (req, res, next) => {

  const date = new Date(req.params.date)
  const companyId = req.params.companyId

  const functionalDate = new Date(date)
  const functionalDatePlusOneDay = new Date(date)

  functionalDatePlusOneDay.setDate(functionalDatePlusOneDay.getDate() + 1)

  const bottomDate = new Date(functionalDate.toISOString().slice(0, 10) + 'T00:00:00.000-06:00')
  const topDate = new Date(functionalDatePlusOneDay.toISOString().slice(0, 10) + 'T00:00:00.000-06:00')


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
    }).populate({path: 'employee', select: 'name lastName'}).populate({path: 'product', select: 'name'}).populate({path: 'branch', select: 'branch'})

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

    const deleted = await Input.deleteOne({_id: inputId})

    if(deleted.acknowledged == 1) {

      res.status(200).json({message: 'Input deleted correctly'})

    } else {

      next(errorHandler(404, 'Input not founded'))
    }

  } catch (error) {

    next(error)
  }
}

export const newOutput = async (req, res, next)  => {

  const {outputWeight, outputComment, pieces, company, product, employee, branch} = req.body
  const tzoffset = (new Date(Date.now())).getTimezoneOffset() * 60000; //offset in milliseconds
  const functionalDate = new Date(Date.now() - tzoffset)

  try {

    const price = await getProductPrice(product, branch)
    const amount = price.price * outputWeight
    const newOutput = new Output({weight: outputWeight, comment: outputComment, pieces, company, product, employee, branch, amount, price: price.price, createdAt: functionalDate})

    await newOutput.save()

    res.status(200).json({message: 'New output created', output: newOutput})

  } catch (error) {

    next(error)
  }
}

export const getBranchOutputs = async (req, res, next) => {

  const date = new Date(req.params.date)
  const branchId = req.params.branchId

  const functionalDate = new Date(date)
  const functionalDatePlusOneDay = new Date(date)

  functionalDatePlusOneDay.setDate(functionalDatePlusOneDay.getDate() + 1)

  const bottomDate = new Date(functionalDate.toISOString().slice(0, 10) + 'T00:00:00.000-06:00')
  const topDate = new Date(functionalDatePlusOneDay.toISOString().slice(0, 10) + 'T00:00:00.000-06:00')


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
    }).populate({path: 'employee', select: 'name lastName'}).populate({path: 'product', select: 'name'}).populate({path: 'branch', select: 'branch'})

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

  const functionalDate = new Date(date)
  const functionalDatePlusOneDay = new Date(date)

  functionalDatePlusOneDay.setDate(functionalDatePlusOneDay.getDate() + 1)

  const bottomDate = new Date(functionalDate.toISOString().slice(0, 10) + 'T00:00:00.000-06:00')
  const topDate = new Date(functionalDatePlusOneDay.toISOString().slice(0, 10) + 'T00:00:00.000-06:00')


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
    }).populate({path: 'employee', select: 'name lastName'}).populate({path: 'product', select: 'name'}).populate({path: 'branch', select: 'branch'})

    if (outputs.length == 0) {

      next(errorHandler(404, 'Not outputs found'))

    } else {

      res.status(200).json({ outputs: outputs })
    }

  } catch (error) {

    next(error)
  }
}

export const deleteOutput = async (req, res, next) => {

  const outputId = req.params.outputId

  try {

    const deleted = await Output.deleteOne({_id: outputId})

    if(deleted.acknowledged == 1) {

      res.status(200).json({message: 'Output deleted correctly'})

    } else {

      next(errorHandler(404, 'Output not founded'))
    }

  } catch (error) {

    next(error)
  }
}