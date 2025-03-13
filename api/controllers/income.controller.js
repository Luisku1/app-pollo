import { Types } from "mongoose";
import IncomeCollected from "../models/accounts/incomes/income.collected.model.js";
import IncomeType from "../models/accounts/incomes/income.type.model.js";
import { errorHandler } from "../utils/error.js";
import { getDayRange } from "../utils/formatDate.js";
import { pushOrPullBranchReportRecord } from "./branch.report.controller.js";
import { pushOrPullCustomerReportRecord } from "./customer.controller.js";
import { pushOrPullSupervisorReportRecord } from "./employee.controller.js";

export const newBranchIncomeQuery = async (req, res, next) => {

  const { _id, amount, company, branch, employee, type, createdAt } = req.body

  try {

    const newIncome = await newBranchIncomeFunction({ _id, amount, company, branch, employee, type, createdAt })

    res.status(201).json({ message: 'New income created successfully', income: newIncome })

  } catch (error) {

    next(error)
  }
}

export const newTransferredIncome = async (req, res, next) => {

  const { prevOwnerId, supervisorId, income } = req.body

  try {

    const newIncome = await newTransferredIncomeFunction(prevOwnerId, supervisorId, income)

    res.status(201).json({ message: 'New income created successfully', income: newIncome })

  } catch (error) {

    next(error)
  }
}

export const newTransferredIncomeFunction = async (prevOwnerId, supervisorId, income) => {

  let newIncome = null

  try {

    newIncome = await IncomeCollected.create(income)

    if (!newIncome) throw new Error("No se logró crear el registro")

    await pushOrPullSupervisorReportRecord({
      supervisorId: supervisorId,
      date: newIncome.createdAt,
      record: newIncome,
      affectsBalancePositively: false,
      operation: '$addToSet',
      arrayField: 'incomesArray',
      amountField: 'incomes'
    })

    await pushOrPullSupervisorReportRecord({
      supervisorId: prevOwnerId,
      date: newIncome.createdAt,
      record: {...newIncome, amount: -newIncome.amount},
      affectsBalancePositively: false,
      operation: '$addToSet',
      arrayField: 'incomesArray',
      amountField: 'incomes'
    })

    return newIncome

  } catch (error) {

    if (newIncome) {

      await IncomeCollected.findByIdAndDelete(newIncome._id)
    }

    throw error
  }
}

export const getIncomesByType = (type, arrayName, dayRange) => ({

  $lookup: {
    from: 'incomecollecteds',
    localField: '_id',
    foreignField: 'employee',
    as: arrayName,
    pipeline: [
      {
        $match: {
          createdAt: { $gte: new Date(dayRange.bottomDate), $lt: new Date(dayRange.topDate) }
        }
      },
      {
        $lookup: {
          from: 'employeepayments',
          localField: '_id',
          foreignField: 'income',
          as: 'employeePayment',
          pipeline: [
            {
              $lookup: {
                from: 'employees',
                localField: 'employee',
                foreignField: '_id',
                as: 'employee'
              }
            },
            {
              $unwind: {
                path: '$employee',
                preserveNullAndEmptyArrays: true
              }
            }
          ]
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
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee'
        }
      },
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customer'
        }
      },
      {
        $unwind: {
          path: '$customer',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'incometypes',
          localField: 'type',
          foreignField: '_id',
          as: 'type',
        }
      },
      { $unwind: { path: '$employeePayment', preserveNullAndEmptyArrays: true } },
      {
        $unwind: {
          path: '$branch',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$employee',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$type',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: { 'type.name': type }
      }
    ]
  }
})

export const newBranchIncomeFunction = async ({ _id = null, amount, company, branch, employee, type, createdAt, partOfAPayment = false }) => {

  let income = null

  const incomeData = { amount, company, branch, employee, type, createdAt, partOfAPayment }

  if (_id) incomeData._id = _id

  try {

    income = await IncomeCollected.create({ _id, amount, company, branch, employee, type, createdAt, partOfAPayment })

    if (!income) throw new Error("No se logró crear el registro")

    await pushOrPullBranchReportRecord({
      branchId: income.branch,
      date: income.createdAt,
      record: income,
      affectsBalancePositively: true,
      operation: '$addToSet',
      arrayField: 'incomesArray',
      amountField: 'incomes'
    })

    await pushOrPullSupervisorReportRecord({
      supervisorId: income.employee,
      date: income.createdAt,
      record: income,
      affectsBalancePositively: false,
      operation: '$addToSet',
      arrayField: 'incomesArray',
      amountField: 'incomes'
    })

    return income

  } catch (error) {

    if (income) {

      await IncomeCollected.findByIdAndDelete(income._id)
    }

    throw error;
  }
}

export const newCustomerIncomeFunction = async ({ amount, company, customer, employee, type, createdAt, partOfAPayment = false }) => {

  let income = null

  try {

    income = await IncomeCollected.create({ amount, company, customer, employee, type, createdAt, partOfAPayment })

    if (!income) throw new Error("No se logró crear el registro")

    await pushOrPullCustomerReportRecord({
      customerId: customer,
      date: income.createdAt,
      record: income,
      affectsBalancePositively: true,
      operation: '$addToSet',
      arrayField: 'paymentsArray',
      amountField: 'paymentsAmount'
    })

    await pushOrPullSupervisorReportRecord({
      supervisorId: income.employee,
      date: income.createdAt,
      record: income,
      affectsBalancePositively: false,
      operation: '$addToSet',
      arrayField: 'incomesArray',
      amountField: 'incomes'
    })

    return income

  } catch (error) {

    if (income) {

      await IncomeCollected.findByIdAndDelete(income._id)
    }

    throw error
  }
}

export const newCustomerIncomeQuery = async (req, res, next) => {

  const { amount, company, customer, employee, type, createdAt } = req.body

  try {

    const newIncome = await newCustomerIncomeFunction({ amount, company, customer, employee, type, createdAt })

    res.status(201).json({
      message: 'New income created successfully',
      income: newIncome
    })

  } catch (error) {
    console.log(error)
    next(error)
  }
}

export const newIncomeType = async (req, res, next) => {

  const name = req.body.name

  try {

    const newType = await IncomeType.create({ name })

    res.status(201).json({ message: 'New type created successfully', type: newType })

  } catch (error) {

    next(error)
  }
}

export const getIncomeTypeId = async ({ name }) => {

  return IncomeType.findOne({ name }, '_id')
}

export const getBranchIncomesRequest = async (req, res, next) => {

  const date = new Date(req.params.date)
  const branchId = req.params.branchId

  try {

    const branchIncomes = await getBranchIncomes({ branchId, date })

    if (branchIncomes.length > 0) {

      res.status(200).json({ branchIncomes: branchIncomes })

    } else {

      next(errorHandler(404, 'Not incomes found'))
    }

  } catch (error) {

    next(error)
  }

}

export const getBranchIncomes = async ({ branchId, date }) => {

  const { bottomDate, topDate } = getDayRange(new Date(date))

  return IncomeCollected.aggregate([
    {
      $match: {
        "createdAt": { $gte: new Date(bottomDate), $lt: new Date(topDate) },
        "company": new Types.ObjectId(companyId),
        "branch": new Types.ObjectId(branchId)
      }
    },
    {
      $lookup: {
        from: 'employeepayments',
        localField: '_id',
        foreignField: 'income',
        as: 'employeePayment',
        pipeline: [
          {
            $lookup: {
              from: 'employees',
              localField: 'employee',
              foreignField: '_id',
              as: 'employee'
            }
          },
          { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } }
        ]
      }
    },
    {
      $lookup: {
        from: 'employees',
        localField: 'employee',
        foreignField: '_id',
        as: 'employee'
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
      $lookup: {
        from: 'incometypes',
        localField: 'type',
        foreignField: '_id',
        as: 'type'
      }
    },
    {
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customer'
      }
    },
    { $unwind: { path: '$employeePayment', preserveNullAndEmptyArrays: true } },
    {
      $unwind: { path: '$employee', preserveNullAndEmptyArrays: true }
    },
    {
      $unwind: { path: '$branch', preserveNullAndEmptyArrays: true }
    },
    {
      $unwind: { path: '$type', preserveNullAndEmptyArrays: true }
    },
    {
      $unwind: { path: '$customer', preserveNullAndEmptyArrays: true }
    }
  ]);
}

export const getIncomes = async (req, res, next) => {
  const date = new Date(req.params.date);
  const companyId = req.params.companyId;

  const { bottomDate, topDate } = getDayRange(date);

  try {
    const incomes = await IncomeCollected.aggregate([
      {
        $match: {
          "createdAt": { $gte: new Date(bottomDate), $lt: new Date(topDate) },
          "company": new Types.ObjectId(companyId)
        }
      },
      {
        $lookup: {
          from: 'employeepayments',
          localField: '_id',
          foreignField: 'income',
          as: 'employeePayment',
          pipeline: [
            {
              $lookup: {
                from: 'employees',
                localField: 'employee',
                foreignField: '_id',
                as: 'employee'
              }
            },
            { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } }
          ]
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee'
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
        $lookup: {
          from: 'incometypes',
          localField: 'type',
          foreignField: '_id',
          as: 'type'
        }
      },
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: { path: '$employeePayment', preserveNullAndEmptyArrays: true } },
      {
        $unwind: { path: '$employee', preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: '$branch', preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: '$type', preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: '$customer', preserveNullAndEmptyArrays: true }
      }
    ]);

    if (incomes.length > 0) {
      let total = 0;
      const branchesIncomes = [];
      const customersIncomes = [];

      incomes.forEach((income) => {
        if (!income.branch) {
          customersIncomes.push(income);
        } else {
          branchesIncomes.push(income);
        }
        total += income.amount;
      });

      branchesIncomes.sort((prevIncome, nextIncome) => prevIncome.branch.position - nextIncome.branch.position);

      res.status(200).json({ incomes: [...branchesIncomes, ...customersIncomes], total });
    } else {
      next(errorHandler(404, 'No incomes found'));
    }
  } catch (error) {
    next(error);
  }
};

export const getIncomeTypes = async (req, res, next) => {

  try {

    const incomeTypes = await IncomeType.find({})

    if (incomeTypes.length > 0) {

      res.status(200).json({ incomeTypes: incomeTypes })

    } else {

      next(errorHandler(404, 'Not income types found'))
    }

  } catch (error) {

    next(error)
  }
}

export const deleteIncomeQuery = async (req, res, next) => {

  const incomeId = req.params.incomeId

  try {

    const deletedIncome = await deleteIncome(incomeId)

    if (!deletedIncome) throw new Error("Algo ha salido mal");

    res.status(200).json('Registro eliminado')

  } catch (error) {

    next(error);
  }
}

export const deleteIncome = async (incomeId) => {

  let deletedIncome = null

  try {

    deletedIncome = await IncomeCollected.findByIdAndDelete(incomeId)

    if (!deletedIncome) throw new Error("No se eliminó el registro")

    if (deletedIncome.branch) {

      await pushOrPullBranchReportRecord({
        branchId: deletedIncome.branch,
        date: deletedIncome.createdAt,
        record: deletedIncome,
        affectsBalancePositively: true,
        operation: '$pull',
        arrayField: 'incomesArray',
        amountField: 'incomes'
      })

    } else {

      await pushOrPullCustomerReportRecord({
        customerId: deletedIncome.customer,
        date: deletedIncome.createdAt,
        record: deletedIncome,
        affectsBalancePositively: true,
        operation: '$pull',
        arrayField: 'paymentsArray',
        amountField: 'paymentsAmount'
      })
    }

    await pushOrPullSupervisorReportRecord({
      supervisorId: deletedIncome.employee,
      date: deletedIncome.createdAt,
      record: deletedIncome,
      affectsBalancePositively: false,
      operation: '$pull',
      arrayField: 'incomesArray',
      amountField: 'incomes'
    })


    return deletedIncome

  } catch (error) {

    if (deletedIncome) {

      await newBranchIncomeFunction(deletedIncome)
    }

    throw error
  }
}