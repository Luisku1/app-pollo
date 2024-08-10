import { Types } from "mongoose"
import BranchReport from "../models/accounts/branch.report.model.js"
import EmployeeDailyBalance from "../models/employees/employee.daily.balance.js"
import Employee from "../models/employees/employee.model.js"
import { errorHandler } from "../utils/error.js"
import { getDayRange } from "../utils/formatDate.js"
import { newExtraOutgoingFunction } from "./outgoing.controller.js"
import { getIncomeTypeId, newIncomeFunction } from "./income.controller.js"
import EmployeePayment from "../models/employees/employee.payment.model.js"
import ExtraOutgoing from "../models/accounts/outgoings/extra.outgoing.model.js"
import IncomeCollected from "../models/accounts/incomes/income.collected.model.js"

export const getEmployees = async (req, res, next) => {

	try {

		const companyId = req.params.companyId
		const employees = await Employee.find({ company: companyId }).sort({ name: 1 }).populate({ path: 'role', select: 'name' })

		res.status(200)
			.json({ employees: employees })


	} catch (error) {

		next(error)
	}
}

export const getEmployee = async (req, res, next) => {

	const employeeId = req.params.employeeId

	try {

		const employee = await Employee.findById(employeeId).populate('role')

		if (employee) {

			res.status(200).json({ employee: employee })

		} else {

			next(errorHandler(404, 'Not employee found'))
		}

	} catch (error) {

		next(error)
	}
}

export const getEmployeeReports = async (req, res, next) => {

	const employeeId = req.params.employeeId

	try {

		const employeeWorkedDays = await getEmployeeWorkedDays(req, res, employeeId, next)

		const employeeReports = await BranchReport.find({
			$or: [
				{
					employee: employeeId
				},
				{
					assistant: employeeId
				}
			]
		}).sort({ createdAt: -1 }).limit(employeeWorkedDays).populate({ path: 'branch', select: 'branch' })

		if (employeeReports.length > 0) {

			res.status(200).json({ employeeReports: employeeReports })

		} else {

			next(errorHandler(404, 'Not employee reports found'))
		}

	} catch (error) {

		next(error)
	}
}

const getEmployeeWorkedDays = async (req, res, employeeId, next) => {

	const day = new Date().getDay()

	try {

		const employee = await Employee.findById(employeeId).select('payDay')

		if (employee.payDay - day > 0) {

			return 8 - (employee.payDay - day)

		} else {

			if (employee.payDay - day < 0) {

				return (Math.abs(employee.payDay - day) + 1)

			} else {

				return 8
			}
		}

	} catch (error) {

		next(error)
	}
}

export const getEmployeeDayInfo = async (req, res, next) => {

	const employeeId = req.params.employeeId

	const { bottomDate } = getDayRange(new Date())

	try {

		const employeeDayInfo = await EmployeeDailyBalance.findOne({
			$and: [
				{
					createdAt: {

						$gte: bottomDate
					}
				},
				{
					employee: employeeId
				}
			]
		}).populate({ path: 'employee', select: 'name lastName' })

		if (employeeDayInfo) {

			res.status(200).json({ employeeDayInfo: employeeDayInfo })
		}

	} catch (error) {

	}
}

export const deleteDuplicatedEmployeeDailyBalances = async (req, res, next) => {

	try {

		const inserted = await new EmployeeDailyBalance({ employee: '65f4faba45c96ebe9ffb081c', company: '65f50041e995d4e5cb7e1d01', createdAt: '2024-04-16T06:00:00.000+00:00' })



		res.status(200).json(inserted)
	} catch (error) {

		next(error)
	}
}

export const getEmployeesDailyBalances = async (req, res, next) => {

	const date = new Date(req.params.date)
	const companyId = req.params.companyId

	const { bottomDate, topDate } = getDayRange(date)

	try {

		let employeesDailyBalances = await EmployeeDailyBalance.find({

			$and: [
				{
					createdAt: { $gte: bottomDate }
				},
				{
					createdAt: { $lt: topDate }
				},
				{
					company: companyId
				}
			]
		}).populate({ path: 'employee', select: 'name lastName' })

		if (employeesDailyBalances.length > 0) {

			res.status(200).json(employeesDailyBalances)

		} else {

			let bulkOps = []

			const employees = await Employee.find({
				$and: [
					{
						company: companyId
					},
					{
						active: true
					}
				]
			}).select({ path: '_id' })

			employees.forEach((employee) => {

				let document = {

					employee: employee._id,
					company: companyId,
					createdAt: bottomDate
				}

				bulkOps.push({ "insertOne": { 'document': document } })
			})

			EmployeeDailyBalance.bulkWrite(bulkOps)
				.then(async (result) => {

					const castedInsertedIds = Object.values(result.insertedIds).map((id) => new Types.ObjectId(id))

					employeesDailyBalances = await EmployeeDailyBalance.find({ _id: { $in: castedInsertedIds } }).populate({ path: 'employee', select: 'name lastName' })

					res.status(200).json(employeesDailyBalances)
				})
		}

	} catch (error) {

		next(error)

	}
}

export const newEmployeePaymentQuery = async (req, res, next) => {

	const { amount, detail, company, branch, employee, supervisor, createdAt } = req.body

	let income = {}
	let employeePayment = {}

	const employeeData = await Employee.findById(employee, 'name lastName')

	try {

		const extraOutgoing = await newExtraOutgoingFunction({ amount, concept: (detail + ' [' + employeeData.name + ' ' + employeeData.lastName + ']'), company, employee: supervisor, createdAt, partOfAPayment: true })

		if (branch != null) {

			const incomeType = await getIncomeTypeId({ name: 'Efectivo' })
			console.log(incomeType._id)
			income = await newIncomeFunction({ amount: amount, company, branch, employee: supervisor, type: String(incomeType._id), createdAt, partOfAPayment: true })

			employeePayment = await newEmployeePaymentFunction({ amount, detail, employee, supervisor, company, extraOutgoing: extraOutgoing._id, income: income._id, createdAt })

			res.status(200).json({ extraOutgoing, income, employeePayment })

		} else {

			employeePayment = await newEmployeePaymentFunction({ amount, detail, employee, supervisor, company, extraOutgoing: extraOutgoing._id, createdAt })

			res.status(200).json({ extraOutgoing, employeePayment })
		}

	} catch (error) {

		next(error)
	}
}

export const newEmployeePaymentFunction = async ({ amount, detail, employee, supervisor, company, extraOutgoing, income, createdAt }) => {

	const newEmployeePayment = new EmployeePayment({ amount, detail, employee, supervisor, company, extraOutgoing, income, createdAt })

	await newEmployeePayment.save()

	return newEmployeePayment
}

export const getEmployeesPaymentsQuery = async (req, res, next) => {

	const { bottomDate, topDate } = getDayRange(new Date(req.params.date))
	const companyId = req.params.companyId

	try {

		const employeePayments = await EmployeePayment.find({

			$and: [

				{
					createdAt: { $lt: topDate }
				},

				{
					createdAt: { $gte: bottomDate }
				},

				{ company: companyId }
			]
		}).populate('supervisor', 'name lastName').populate('employee', 'name lastName')

		res.status(200).json({ employeePayments })

	} catch (error) {

		next(error)
	}
}

export const deleteEmployeePaymentQuery = async (req, res, next) => {

	const { paymentId, incomeId, extraOutgoingId } = req.params
	console.log(incomeId == 'undefined')
	console.log(typeof incomeId)
	let deletedIncome = incomeId == 'undefined' ? {deletedCount: 1} : {}

	try {

		const deletedExtraOutgoing = await ExtraOutgoing.deleteOne({ _id: extraOutgoingId })
		if(incomeId != 'undefined') {

			deletedIncome = await IncomeCollected.deleteOne({ _id: incomeId })
		}
		const deletedPayment = await EmployeePayment.deleteOne({ _id: paymentId })
		console.log(deletedPayment, deletedIncome, deletedExtraOutgoing)

		if (!(deletedExtraOutgoing.deletedCount == 0 && deletedIncome.deletedCount == 0 && deletedPayment.deletedCount == 0)) {

			res.status(200).json('Pago eliminado, verifique que el gasto y el efectivo del pago se hayan eliminado correctamente.')
		} else {

			next(errorHandler(404, 'Algo ha salido mal'))
		}

	} catch (error) {

		next(error)
	}
}

export const getEmployeePayroll = async (req, res, next) => {

	const companyId = req.params.companyId
	const { bottomDate } = getDayRange(req.params.date)
	const day = (new Date(bottomDate)).getDay()
	console.log(new Date(bottomDate))
	console.log(day)

	try {

		const employeesPayroll = await Employee.aggregate([

			{
				$match: {
					'company': new Types.ObjectId(companyId),
					'payDay': day
				}
			},

			{
				$lookup: {
					from: 'employeedailybalances',
					localField: '_id',
					foreignField: 'employee',
					as: 'dailyBalances',
					pipeline: [
						{ $match: { createdAt: { $lt: new Date(bottomDate) } } },
						{ $sort: { createdAt: -1 } },
						{ $limit: 7 }
					]
				}
			},

			{
				$project: {
					_id: 1,
					name: 1,
					lastName: 1,
					balance: 1,
					salary: 1,
					dailyBalances: 1
				}
			}
		])

		if (employeesPayroll.length > 0) {

			employeesPayroll.forEach(payroll => {

				payroll.dailyBalances.sort((prev, next) => prev.createdAt - next.createdAt)
			})

			res.status(200).json({ employeesPayroll: employeesPayroll })

		} else {

			res.status(200).json('Not data found')
		}

	} catch (error) {

		next(error)
	}
}

export const updateEmployeeDailyBalance = async (req, res, next) => {

	const body = req.body
	const balanceId = req.params.balanceId

	try {

		const updated = await EmployeeDailyBalance.updateOne({ _id: balanceId }, body)

		if (updated.acknowledged) {

			res.status(200).json('Balance updated')

		} else {

			next(errorHandler(404, 'An error ocurred'))
		}

	} catch (error) {

		next(error)
	}
}


export const updateEmployeeDailyBalancesBalance = async (employeeId, date, balance) => {

	try {

		await updateDailyBalancesBalance(employeeId, date, balance)

	} catch (error) {

		console.log(error)
	}
}

export const updateDailyBalancesBalance = async (employeeId, isoDate, balance) => {

	const date = new Date(isoDate)

	const { bottomDate, topDate } = getDayRange(date)

	try {

		const updatedDailyBalance = await EmployeeDailyBalance.updateOne({
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
					employee: employeeId
				}
			]
		}, { accountBalance: balance })

		return updatedDailyBalance

	} catch (error) {

		console.log(error)
	}
}

export const deleteEmployee = async (req, res, next) => {

	const employeeId = req.params.employeeId

	try {

		const deleted = await Employee.deleteOne({ _id: employeeId })

		if (deleted.acknowledged == 1) {

			res.status(200).json('Employee deleted successfully')

		} else {

			next(errorHandler(404, 'Employee not found'))
		}

	} catch (error) {

		next(error)
	}
}