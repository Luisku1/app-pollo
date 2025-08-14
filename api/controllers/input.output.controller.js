import Output from '../models/accounts/output.model.js'
import Input from '../models/accounts/input.model.js'
import { errorHandler } from '../utils/error.js'
import ProviderInput from '../models/providers/provider.input.model.js'
import { getDayRange, today } from '../utils/formatDate.js'
import { Types } from 'mongoose'
import { pushOrPullBranchReportRecord } from './branch.report.controller.js'
import { customerAggregate, pushOrPullCustomerReportRecord } from './customer.controller.js'
import { employeeAggregate } from './employee.controller.js'
import { createStockAndUpdateBranchReport, deleteStockAndUpdateBranchReport } from './stock.controller.js'
import { branchAggregate } from './branch.controller.js'
import { productAggregate } from './product.controller.js'
import { dateFromYYYYMMDD } from '../../common/dateOps.js'

const inputLookups = () => {
  return [
    ...employeeAggregate('employee', undefined, companyId),
    ...customerAggregate('customer', companyId),
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $lookup: {
        from: 'branches',
        localField: 'branch',
        foreignField: '_id',
        as: 'branch'
      }
    },
    { $unwind: { path: '$product', preserveNullAndEmptyArrays: false } },
    { $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } }

  ]
}

const outputLookups = () => {
  return [
    ...employeeAggregate('employee', undefined, companyId),
    ...customerAggregate('customer', companyId),
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $lookup: {
        from: 'branches',
        localField: 'branch',
        foreignField: '_id',
        as: 'branch'
      }
    },
    {
      $unwind: '$product'
    },
    {
      $unwind: '$branch'
    }
  ]
}

export const newBranchInput = async (req, res, next) => {

  const { _id, weight, specialPrice, price, amount, comment, pieces, company, product, employee, addInStock, branch, createdAt } = req.body

  try {

    const newInput = await newBranchInputAndUpdateBranchReport({ _id, weight, comment, pieces, company, product, addInStock, employee, branch, amount, price, createdAt, specialPrice })

    res.status(200).json({ message: 'New input created', input: newInput })

  } catch (error) {

    next(error)
  }
}

export const newBranchInputAndUpdateBranchReport = async ({ _id, weight, comment, pieces, company, addInStock, product, employee, branch, amount, price, createdAt, specialPrice }) => {

  let input = null
  let stock = null
  let updatedBranchReport = null

  try {

    input = await Input.create({ _id, weight, comment, pieces, company, product, employee, branch, amount, price, createdAt, specialPrice })

    if (!input) throw new Error("No se logró crear la entrada a sucursal");

    updatedBranchReport = await pushOrPullBranchReportRecord({
      branchId: branch,
      date: createdAt,
      record: input,
      affectsBalancePositively: false,
      amountField: 'inputs',
      arrayField: 'inputsArray',
      operation: '$addToSet'
    })

    if (!updatedBranchReport) throw new Error("No se logró actualizar el reporte de sucursal");

    if (addInStock) {
      stock = await createStockAndUpdateBranchReport(input, 'input')

      if (!stock) throw new Error("No se logró crear el stock asociado a la entrada");

      Input.findByIdAndUpdate(input._id, { stock: stock._id }, { new: true })
    }

    return input

  } catch (error) {

    if (stock) {

      await deleteStockAndUpdateBranchReport({ stockId: stock._id, alsoDeleteInitial: true })
    }

    if (updatedBranchReport) {

      await pushOrPullBranchReportRecord({
        branchId: branch,
        date: createdAt,
        record: input,
        affectsBalancePositively: false,
        operation: '$pull',
        arrayField: 'inputsArray',
        amountField: 'inputs'
      })
    }

    if (input) {

      await deleteInputById(input._id)
    }

    throw error;
  }
}

export const newCustomerInput = async (req, res, next) => {

  const { _id, weight, price, pieces, amount, employee, comment, product, company, customer, createdAt } = req.body

  try {

    const input = await Input.create({ _id, weight, pieces, price, employee, amount, comment, product, company, customer, createdAt })

    await pushOrPullCustomerReportRecord({
      customerId: customer,
      date: createdAt,
      record: input,
      affectsBalancePositively: false,
      operation: '$addToSet',
      amountField: 'sales',
      arrayField: 'branchSales'
    })

    res.status(200).json({ input })

  } catch (error) {

    next(error)
  }
}

export const getNetDifference = async (req, res, next) => {
  const date = dateFromYYYYMMDD(req.params.date)
  const companyId = req.params.companyId
  const { bottomDate, topDate } = getDayRange(date)

  try {
    // Use $unionWith to combine Input and Output collections in a single pipeline
    // Tag each document as 'input' or 'output' and normalize the sign
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: new Date(bottomDate), $lt: new Date(topDate) },
          company: new Types.ObjectId(companyId)
        }
      },
      {
        $project: {
          employee: 1,
          product: 1,
          weight: 1,
          branch: 1,
          type: { $literal: 'input' }
        }
      },
      {
        $unionWith: {
          coll: 'outputs',
          pipeline: [
            {
              $match: {
                createdAt: { $gte: new Date(bottomDate), $lt: new Date(topDate) },
                company: new Types.ObjectId(companyId)
              }
            },
            {
              $project: {
                employee: 1,
                product: 1,
                weight: 1,
                branch: 1,
                type: { $literal: 'output' }
              }
            }
          ]
        }
      },
      // Lookup employee and product details
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'branches',
          localField: 'branch',
          foreignField: '_id',
          as: 'branch'
        }
      },
      { $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } },
      // Normalize weight by branch.p (if present)
      {
        $addFields: {
          normWeight: {
            $cond: [
              { $ifNull: ['$branch.p', false] },
              { $divide: ['$weight', '$branch.p'] },
              '$weight'
            ]
          }
        }
      },
      // Assign sign: + for input, - for output
      {
        $addFields: {
          signedWeight: {
            $cond: [
              { $eq: ['$type', 'input'] },
              '$normWeight',
              { $multiply: ['$normWeight', -1] }
            ]
          }
        }
      },
      // Group by employee and product
      {
        $group: {
          _id: {
            employee: '$employee._id',
            product: '$product._id'
          },
          employee: { $first: '$employee' },
          product: { $first: '$product' },
          totalDifference: { $sum: '$signedWeight' }
        }
      },
      // Only keep nonzero differences
      {
        $match: { totalDifference: { $ne: 0 } }
      }
    ];

    const results = await Input.aggregate(pipeline);

    // Build byEmployee and byProduct structures
    const byEmployee = {};
    const byProduct = {};
    for (const row of results) {
      const empId = row.employee?._id?.toString();
      const prodId = row.product?._id?.toString();
      const employee = row.employee;
      const product = row.product;
      const productName = product?.name;
      const diff = row.totalDifference;
      // By employee
      if (empId) {
        if (!byEmployee[empId]) {
          byEmployee[empId] = {
            employee,
            totalDifference: 0,
            netDifference: {}
          };
        }
        byEmployee[empId].totalDifference += diff;
        if (!byEmployee[empId].netDifference[prodId]) {
          byEmployee[empId].netDifference[prodId] = { name: productName, difference: 0 };
        }
        byEmployee[empId].netDifference[prodId].difference += diff;
      }
      // By product
      if (prodId) {
        if (!byProduct[prodId]) {
          byProduct[prodId] = { name: productName, employees: {} };
        }
        if (!byProduct[prodId].employees[empId]) {
          byProduct[prodId].employees[empId] = { employee, difference: 0 };
        }
        byProduct[prodId].employees[empId].difference += diff;
      }
    }

    res.status(200).json({
      byEmployee,
      byProduct
    });
  } catch (error) {
    next(error);
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

        result[employee._id].productsMovement[product].weight += weight / (element.branch?.p || 1)

      } else {

        result[employee._id].productsMovement[product] = {
          weight: weight / (element.branch?.p || 1),
          name: productName
        }
      }

    } else {

      result[employee._id].productsMovement[product] = {
        weight: weight / (element.branch?.p || 1),
        name: productName
      }
    }
  });

  return result
}

export const getBranchInputsRequest = async (req, res, next) => {

  const date = dateFromYYYYMMDD(req.params.date)
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
  const date = dateFromYYYYMMDD(req.params.date)

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

  const date = dateFromYYYYMMDD(req.params.date)
  const companyId = req.params.companyId

  const { bottomDate, topDate } = getDayRange(date)

  try {

    const inputs = await Input.aggregate([
      {
        $match: {
          "createdAt": { $gte: new Date(bottomDate), $lt: new Date(topDate) },
          "company": new Types.ObjectId(companyId)
        }
      },
      ...inputLookups()
    ])
    console.log(inputs)

    if (inputs.length == 0) {

      res.status(404).json({
        message: 'No inputs found',
        data: [],
        success: false
      })

    } else {

      let totalWeight = 0
      const branchInputs = []
      const customerInputs = []

      inputs.forEach((input) => {

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

      res.status(200).json({
        data: [...branchInputs, ...customerInputs],
        message: 'Inputs found',
        success: true
      })
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

  try {

    await deleteInputById(inputId)

    res.status(200).json({ message: 'Input deleted correctly' })

  } catch (error) {

    next(error);
  }
}

export const deleteInputById = async (inputId) => {

  let deletedInput = null

  try {

    deletedInput = await Input.findByIdAndDelete(inputId)

    if (!deletedInput) throw new Error("No se eliminó la entrada");

    if (deletedInput.branch) {

      await pushOrPullBranchReportRecord({
        branchId: deletedInput.branch,
        date: deletedInput.createdAt,
        record: deletedInput,
        affectsBalancePositively: false,
        operation: '$pull',
        arrayField: 'inputsArray',
        amountField: 'inputs'
      })

      if (deletedInput.stock) {

        await deleteStockAndUpdateBranchReport({ stock_id: deletedInput.stock, alsoDeleteInitial: true })
      }

    } else {

      await pushOrPullCustomerReportRecord({
        customerId: deletedInput.customer,
        date: deletedInput.createdAt,
        record: deletedInput,
        affectsBalancePositively: false,
        operation: '$pull',
        arrayField: 'branchSales',
        amountField: 'sales'
      })
    }

  } catch (error) {

    console.log(error)

    if (deletedInput) {

      await Input.create(deletedInput)
    }

    throw error;
  }
}

export const newBranchOutput = async (req, res, next) => {

  const { _id, weight, comment, amount, price, pieces, company, product, employee, branch: branch, specialPrice, fromStock = null, createdAt } = req.body

  try {

    const newOutput = await newBranchOutputAndUpdateBranchReport({ _id, weight, comment, pieces, company, product, employee, branch, fromStock, amount, price, createdAt, specialPrice })
    res.status(200).json({ message: 'New output created', output: newOutput })

  } catch (error) {

    next(error)
  }
}

export const newBranchOutputAndUpdateBranchReport = async ({ _id, weight, comment, pieces, company, product, employee, branch, amount, price, createdAt, fromStock, specialPrice }) => {

  let output = null
  let updatedBranchReport = null
  let stock = null

  try {

    output = await Output.create({ _id, weight, comment, pieces, company, product, employee, branch, amount, price, createdAt, specialPrice })

    if (!output) throw new Error("No se logró crear el registro")

    updatedBranchReport = await pushOrPullBranchReportRecord({
      branchId: branch,
      date: createdAt,
      record: output,
      affectsBalancePositively: true,
      operation: '$addToSet',
      arrayField: 'outputsArray',
      amountField: 'outputs'
    })

    if (!updatedBranchReport) throw new Error("No se logró actualizar el reporte de sucursal");

    if (fromStock) {

      stock = await createStockAndUpdateBranchReport(output, 'output')

      if (!stock) throw new Error("No se logró crear el stock asociado a la salida");

      Output.findByIdAndUpdate(output._id, { stock: stock._id }, { new: true })
    }

    return output

  } catch (error) {

    if (updatedBranchReport) {

      await pushOrPullBranchReportRecord({
        branchId: branch,
        date: createdAt,
        record: output,
        affectsBalancePositively: true,
        operation: '$pull',
        arrayField: 'outputsArray',
        amountField: 'outputs'
      })
    }

    if (stock) {

      await deleteStockAndUpdateBranchReport({ stockId: stock._id, alsoDeleteInitial: true })
    }

    if (output) {

      await Output.findByIdAndDelete(income._id)
    }

    throw error;
  }
}

export const newCustomerOutput = async (req, res, next) => {

  const { _id, weight, amount, comment, pieces, company, product, employee, customer, price, createdAt } = req.body

  try {

    const output = await Output.create({ _id, weight, comment, pieces, company, product, employee, customer, amount, price, createdAt })

    await pushOrPullCustomerReportRecord({
      customerId: customer,
      date: createdAt,
      record: output,
      affectsBalancePositively: true,
      operation: '$addToSet',
      amountField: 'returns',
      arrayField: 'returnsArray'
    })

    res.status(200).json({ message: 'New output created', output })

  } catch (error) {

    next(error)

  }
}

export const getBranchOutputsRequest = async (req, res, next) => {

  const date = dateFromYYYYMMDD(req.params.date)
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

  const date = dateFromYYYYMMDD(req.params.date)
  const companyId = req.params.companyId

  const { bottomDate, topDate } = getDayRange(date)

  try {

    const outputs = await Output.aggregate([
      {
        $match: {
          "createdAt": { $gte: new Date(bottomDate), $lt: new Date(topDate) },
          "company": new Types.ObjectId(companyId)
        }
      },
      ...outputLookups()
    ])

    if (outputs.length == 0) {

      next(errorHandler(404, 'Not outputs found'))

    } else {

      let totalWeight = 0

      const branchOutputs = []
      const customerOutputs = []

      outputs.forEach((output) => {

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
    }).populate({ path: 'branch', select: 'branch position' }).populate({ path: 'employee', select: 'name lastName' }).populate({ path: 'product', select: 'name' })

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

export const getProviderInputs = async (req, res, next) => {

  const date = dateFromYYYYMMDD(req.params.date)
  const companyId = req.params.companyId
  const { bottomDate, topDate } = getDayRange(date)

  try {

    const providerInputs = await ProviderInput.aggregate([
      {
        $match: {
          "createdAt": { $gte: new Date(bottomDate), $lt: new Date(topDate) },
          "company": new Types.ObjectId(companyId)
        }
      },
      ...productAggregate('product'),
      ...employeeAggregate('employee', undefined, companyId),
      ...branchAggregate('branch'),
      ...customerAggregate('customer', companyId),
      {
        $group: {
          _id: "$product._id",
          totalWeight: { $sum: "$weight" },
          totalPieces: { $sum: "$pieces" },
          totalAmount: { $sum: "$amount" },
          inputs: { $push: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $unwind: "$productDetails"
      },
      {
        $sort: { "totalAmount": -1 }
      },
      {
        $project: {
          _id: 1,
          weight: 1,
          pieces: 1,
          amount: 1,
          inputs: 1,
          name: "$productDetails.name"
        }
      }
    ])

    if (providerInputs.length > 0) {
      res.status(200).json({ providerInputs })
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

  const { _id, weight, product, price, amount, employee, branch, company, comment, pieces, provider, specialPrice, createdAt } = req.body

  try {
    const newProviderInput = await createBranchProviderInputAndUpdateBranchReport({ _id, weight, product, price, employee, branch, company, comment, pieces, amount, specialPrice, createdAt })

    res.status(200).json({ providerInput: newProviderInput })

  } catch (error) {
    console.log(error)
    next(error)
  }
}

export const createBranchProviderInputAndUpdateBranchReport = async ({ _id, weight, product, price, employee, branch, company, comment, pieces, amount, specialPrice, createdAt, provider }) => {

  let providerInput = null

  try {

    const providerInputData = { weight, provider, product, price, employee, branch, company, comment, pieces, amount, specialPrice, createdAt: today(createdAt) ? new Date() : createdAt }

    if (_id) providerInputData._id = _id

    providerInput = await ProviderInput.create(providerInputData)

    if (!providerInput) throw new Error("No creó el registro")

    await pushOrPullBranchReportRecord({
      branchId: branch,
      date: createdAt,
      record: providerInput,
      affectsBalancePositively: false,
      operation: '$addToSet',
      arrayField: 'providerInputsArray',
      amountField: 'providerInputs',
    })

    return providerInput

  } catch (error) {

    if (providerInput) {

      await ProviderInput.findByIdAndDelete(providerInput._id)
    }

    throw error;
  }
}

export const createCustomerProviderInput = async (req, res, next) => {

  const { _id, weight, product, price, amount, employee, customer, company, comment, pieces, provider, createdAt } = req.body

  let providerInput = null

  try {

    const providerInputData = { weight, product, price, amount, employee, customer, provider, company, comment, pieces, createdAt }

    if (_id) providerInputData._id = _id

    providerInput = await ProviderInput.create(providerInputData)

    await pushOrPullCustomerReportRecord({
      customerId: customer,
      date: createdAt,
      record: providerInput,
      affectsBalancePositively: false,
      operation: '$addToSet',
      arrayField: 'directSales',
      amountField: 'sales'
    })

    res.status(200).json({ providerInput })

  } catch (error) {

    next(error)
  }
}

export const deleteProviderInput = async (req, res, next) => {

  const providerInputId = req.params.providerInputId

  let deletedProviderInput = null

  try {

    deletedProviderInput = await ProviderInput.findByIdAndDelete(providerInputId)

    if (!deletedProviderInput) throw new Error("No se eliminó el registro");

    if (deletedProviderInput.branch) {

      await pushOrPullBranchReportRecord({
        branchId: deletedProviderInput.branch,
        date: deletedProviderInput.createdAt,
        record: deletedProviderInput,
        affectsBalancePositively: false,
        operation: '$pull',
        arrayField: 'providerInputsArray',
        amountField: 'providerInputs',
      })

    } else {

      await pushOrPullCustomerReportRecord({
        customerId: deletedProviderInput.customer,
        date: deletedProviderInput.createdAt,
        record: deletedProviderInput,
        affectsBalancePositively: false,
        operation: '$pull',
        arrayField: 'directSales',
        amountField: 'sales'
      })
    }

    res.status(200).json({ message: 'Registro eliminado', success: true })

  } catch (error) {

    if (deletedProviderInput) {

      await ProviderInput.create({ deletedProviderInput })
    }

    console.log(error)

    next(error);
  }
}

export const deleteOutput = async (req, res, next) => {

  const outputId = req.params.outputId

  if (!Types.ObjectId.isValid(outputId)) {
    return next(errorHandler(400, 'Invalid output ID'));
  }

  let deletedOutput = null

  try {

    let deletedOutput = await Output.findByIdAndDelete(outputId)

    if (deletedOutput.branch) {
      await pushOrPullBranchReportRecord({
        branchId: deletedOutput.branch,
        date: deletedOutput.createdAt,
        record: deletedOutput,
        affectsBalancePositively: true,
        operation: '$pull',
        arrayField: 'outputsArray',
        amountField: 'outputs'
      })
      if (deleteOutput.stock) {

        await deleteStockAndUpdateBranchReport({ stock_id: deleteOutput.stock, alsoDeleteInitial: true })
      }

    } else {
      await pushOrPullCustomerReportRecord({
        customerId: deletedOutput.customer,
        date: deletedOutput.createdAt,
        record: deletedOutput,
        affectsBalancePositively: true,
        operation: '$pull',
        arrayField: 'returnsArray',
        amountField: 'returns'
      })
    }

    res.status(200).json('Registro eliminado')

  } catch (error) {

    if (deletedOutput) {

      await Output.create({ deletedOutput })
    }

    next(error);
  }
}