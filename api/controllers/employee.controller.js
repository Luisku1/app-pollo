import { Types } from "mongoose"
import BranchReport from "../models/accounts/branch.report.model.js"
import EmployeeDailyBalance from "../models/employees/employee.daily.balance.js"
import Employee from "../models/employees/employee.model.js"
import { errorHandler } from "../utils/error.js"
import { getDayRange } from "../utils/formatDate.js"

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

	const inserted = await new EmployeeDailyBalance({employee: '65f4faba45c96ebe9ffb081c', company: '65f50041e995d4e5cb7e1d01', createdAt: '2024-04-16T06:00:00.000+00:00'})



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
				.then(result => {

					employeesDailyBalances = Employee.find({ _id: { $in: result.insertedIds } })
					res.status(200).json({ employeesDailyBalances: result })
				})
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
						{ $match: { createdAt: { $gte: bottomDate } } },
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