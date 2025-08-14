import { Types } from "mongoose";
import IncomeCollected from "../models/accounts/incomes/income.collected.model.js";
import IncomeType from "../models/accounts/incomes/income.type.model.js";
import { errorHandler } from "../utils/error.js";
import { getDayRange } from "../utils/formatDate.js";
import { pushOrPullBranchReportRecord } from "./branch.report.controller.js";
import { pushOrPullCustomerReportRecord } from "./customer.controller.js";
import { employeeAggregate, pushOrPullSupervisorReportRecord } from "./employee.controller.js";
import SupervisorReport from "../models/accounts/supervisor.report.model.js";
import Employee from "../models/employees/employee.model.js";
import { dateFromYYYYMMDD } from "../../common/dateOps.js";

export const typeAggregate = (localField = 'type') => {
  return [
    {
      $lookup: {
        from: 'incometypes',
        localField: localField,
        foreignField: '_id',
        as: localField
      }
    },
    {
      $unwind: { path: `$${localField}`, preserveNullAndEmptyArrays: true }
    }
  ]
}

export const incomeAggregate = (localField = 'income') => {
  return [
    {
      $lookup: {
        from: 'incomecollecteds',
        localField: localField,
        foreignField: '_id',
        as: localField
      }
    },
    {
      $unwind: { path: `$${localField}`, preserveNullAndEmptyArrays: true }
    }
  ]
}

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

  const { income, prevIncome } = req.body

  if (!income || !prevIncome) return next(errorHandler(400, 'Missing data'))

  try {

    await canAffordTransfer(prevIncome)
    await newTransferredIncomeFunction(income, prevIncome)
    res.status(201).json({ message: 'New income created successfully' })

  } catch (error) {

    next(error)
  }
}

const canAffordTransfer = async (income) => {

  const { employee, amount } = income

  try {

    const { bottomDate, topDate } = getDayRange(new Date(income.createdAt))

    const supervisorReport = (await SupervisorReport.aggregate([
      {
        $match: {
          supervisor: new Types.ObjectId(employee),
          createdAt: { $gte: new Date(bottomDate), $lt: new Date(topDate) }
        }
      }
    ]))[0]
    if (!supervisorReport) throw new Error("No hay ingresos en la cuenta de este empleado")
    if (isNaN(supervisorReport.incomes)) throw new Error(`No hay ingresos en la cuenta de este empleado`)
    if (-amount < 0) throw new Error("El monto no puede ser negativo")
    if (-amount > supervisorReport.incomes) {

      const { name, lastName } = await Employee.findById(employee)
      throw new Error(`${name} ${lastName} sólo cuenta con $${parseFloat(supervisorReport.incomes).toFixed(2)} en su cuenta`)
    }

  } catch (error) {

    throw error
  }
}

export const newTransferredIncomeFunction = async (actualIncome, prevIncome) => {

  let newOwnerIncome = null
  let prevOwnerIncome = null
  let supervisorReport = null

  try {

    newOwnerIncome = await IncomeCollected.create(actualIncome)
    prevOwnerIncome = await IncomeCollected.create(prevIncome)


    if (!newOwnerIncome || !prevOwnerIncome) throw new Error("No se logró crear el registro")

    supervisorReport = await pushOrPullSupervisorReportRecord({
      supervisorId: newOwnerIncome.employee,
      date: newOwnerIncome.createdAt,
      record: newOwnerIncome,
      affectsBalancePositively: false,
      operation: '$addToSet',
      arrayField: 'incomesArray',
      amountField: 'incomes'
    })

    await pushOrPullSupervisorReportRecord({
      supervisorId: prevOwnerIncome.employee,
      date: prevOwnerIncome.createdAt,
      record: prevOwnerIncome,
      affectsBalancePositively: false,
      operation: '$addToSet',
      arrayField: 'incomesArray',
      amountField: 'incomes',
      noCreate: true
    })

    return newOwnerIncome

  } catch (error) {

    if (supervisorReport) {
      await pushOrPullSupervisorReportRecord({
        supervisorId: newOwnerIncome.employee,
        date: newOwnerIncome.createdAt,
        record: newOwnerIncome,
        affectsBalancePositively: false,
        operation: '$pull',
        arrayField: 'incomesArray',
        amountField: 'incomes'
      })
    }

    if (newOwnerIncome) {

      await IncomeCollected.findByIdAndDelete(newOwnerIncome._id)
    }

    if (prevOwnerIncome) {

      await IncomeCollected.findByIdAndDelete(prevOwnerIncome._id)
    }

    throw error
  }
}

export const incomesAggregate = (companyId) => {
  return [
    ...typeAggregate(),
    ...employeeAggregate('employee', undefined, companyId),
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
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customer'
      }
    },
    { $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } }
  ]
}

export const lookupSupervisorReportIncomes = (type, arrayName, dayRange) => ({

  $lookup: {
    from: 'incomecollecteds',
    localField: 'incomesArray',
    foreignField: '_id',
    as: arrayName,
    pipeline: [
      {
        $lookup: {
          from: 'incometypes',
          localField: 'type',
          foreignField: '_id',
          as: 'type',
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
      { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$type', preserveNullAndEmptyArrays: true } },
      (type === '*' ? {} :
        {
          $match: { 'type.name': type }
        }
      ),
      {
        $lookup: {
          from: 'employees',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner',
        }
      },
      { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'employees',
          localField: 'prevOwner',
          foreignField: '_id',
          as: 'prevOwner',
        }
      },
      {
        $unwind: { path: '$prevOwner', preserveNullAndEmptyArrays: true }
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
        $unwind: {
          path: '$branch',
          preserveNullAndEmptyArrays: true
        }
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
      amountField: 'payments'
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

export const getIncomes = async (req, res, next) => {
  const date = dateFromYYYYMMDD(req.params.date);
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
      ...employeeAggregate('prevOwner', 'prevOwner', companyId),
      ...employeeAggregate('owner', 'owner', companyId),
      ...employeeAggregate('employee', undefined, companyId),
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
      { $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$type', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } }
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
        if (!income.prevOwner)
          total += income.amount;
      });

      branchesIncomes.sort((prevIncome, nextIncome) => prevIncome.branch.position - nextIncome.branch.position);

      res.status(200).json({ incomes: [...branchesIncomes, ...customersIncomes] });

    } else {
      res.status(404).json({ message: 'No incomes found', incomes: [] });
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
  let prevOwnerIncome = null


  try {

    deletedIncome = { ...(await IncomeCollected.findByIdAndDelete(incomeId))?._doc }

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
    }

    if (deletedIncome.customer) {

      await pushOrPullCustomerReportRecord({
        customerId: deletedIncome.customer,
        date: deletedIncome.createdAt,
        record: deletedIncome,
        affectsBalancePositively: true,
        operation: '$pull',
        arrayField: 'paymentsArray',
        amountField: 'payments'
      })
    }

    if (deletedIncome.prevOwnerIncome) {

      prevOwnerIncome = { ...(await IncomeCollected.findByIdAndDelete(deletedIncome.prevOwnerIncome))._doc }

      await pushOrPullSupervisorReportRecord({
        supervisorId: prevOwnerIncome.employee,
        date: prevOwnerIncome.createdAt,
        record: prevOwnerIncome,
        affectsBalancePositively: false,
        operation: '$pull',
        arrayField: 'incomesArray',
        amountField: 'incomes'
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

      if (!deletedIncome.prevOwner)
        await newBranchIncomeFunction(deletedIncome)
    }

    throw error
  }
}