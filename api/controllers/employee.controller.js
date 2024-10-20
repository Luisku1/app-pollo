import { Types } from "mongoose"
import BranchReport from "../models/accounts/branch.report.model.js"
import EmployeeDailyBalance from "../models/employees/employee.daily.balance.js"
import Employee from "../models/employees/employee.model.js"
import { errorHandler } from "../utils/error.js"
import { getDayRange } from "../utils/formatDate.js"
import { deleteExtraOutgoingFunction, newExtraOutgoingFunction } from "./outgoing.controller.js"
import { deleteIncome, getIncomeTypeId, newBranchIncomeFunction } from "./income.controller.js"
import EmployeePayment from "../models/employees/employee.payment.model.js"
import ExtraOutgoing from "../models/accounts/outgoings/extra.outgoing.model.js"
import IncomeCollected from "../models/accounts/incomes/income.collected.model.js"
import { fetchBranchReport, fetchBranchReportById } from "./branch.report.controller.js"
import SupervisorReport from "../models/accounts/supervisor.report.model.js"
import { fetchRolesFromDB } from "./role.controller.js"

export const getEmployees = async (req, res, next) => {

	try {

		const companyId = req.params.companyId
		const employees = await Employee.find({
			active: true,
			company: companyId
		}).sort({ name: 1 }).populate({ path: 'role', select: 'name' })

		res.status(200)
			.json({ employees: employees })


	} catch (error) {

		next(error)
	}
}

export const getAllEmployees = async (req, res, next) => {

	const companyId = req.params.companyId

	try {

		const employees = await Employee.find({ company: companyId }).sort({ name: 1 }).populate({ path: 'role', select: 'name' })

		res.status(200).json({ employees })

	} catch (error) {

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

	const { employeeId, consultantRole } = req.params
	const { bottomDate, topDate } = getDayRange(new Date())

	try {

		const roles = await fetchRolesFromDB()
		const consultantRoleObject = roles.find((role) => role._id == consultantRole)

		const isNotSeller = consultantRoleObject.name != 'Vendedor'

		const employeeWeekDays = await getEmployeeWorkedDays(bottomDate, employeeId)
		const firstWeekDay = new Date(bottomDate)
		firstWeekDay.setDate(firstWeekDay.getDate() - employeeWeekDays)

		const employeeObjectId = new Types.ObjectId(employeeId)

		const employeeReports = await BranchReport.aggregate([
			{
				$match: {
					'createdAt': { $gte: new Date(firstWeekDay), $lt: new Date(topDate) },

					$or: [
						// Coincidir con employee o assistant
						{
							$or: [
								{ 'employee': employeeObjectId },
								{ 'assistant': employeeObjectId },
							]
						},
						// Coincidir con sender y el rol no ser "Vendedor"
						{
							'sender': employeeObjectId,
							$expr: { $eq: [isNotSeller, true] } // Verifica que el rol no sea "Vendedor"
						}
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
					from: 'employees',
					localField: 'assistant',
					foreignField: '_id',
					as: 'assistant'
				}
			},
			{
				$lookup: {
					from: 'employees',
					localField: 'sender',
					foreignField: '_id',
					as: 'sender'
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
				$unwind: { path: '$branch', preserveNullAndEmptyArrays: true }
			},
			{
				$unwind: { path: '$sender', preserveNullAndEmptyArrays: true }
			},
			{
				$unwind: { path: '$assistant', preserveNullAndEmptyArrays: true }
			},
			{
				$unwind: { path: '$employee', preserveNullAndEmptyArrays: true }
			},
			{
				$sort: { 'createdAt': -1 }
			},
			{
				$project: {
					_id: 1,
					createdAt: 1,
					initialStock: 1,
					initialStockArray: 1,
					finalStock: 1,
					finalStockArray: 1,
					inputs: 1,
					inputsArray: 1,
					providerInputs: 1,
					providerInputsArray: 1,
					outputs: 1,
					outputsArray: 1,
					outgoings: 1,
					outgoingsArray: 1,
					incomes: 1,
					incomesArray: 1,
					balance: 1,
					branch: 1,
					employee: 1,
					assistant: 1,
					reportData: 1
				}

			}
		])

		if (employeeReports.length > 0) {

			res.status(200).json({ employeeBranchReports: employeeReports })

		} else {

			next(errorHandler(404, 'Not employee reports found'))
		}

	} catch (error) {

		next(error)
	}
}

export const getEmployeeWorkedDays = async (bottomDate, employeeId) => {

	const bottomDateDay = (new Date(bottomDate)).getDay()
	const employeePayDay = (await Employee.findById(employeeId)).payDay
	let weekDaysWorked = 0

	if (bottomDateDay == employeePayDay) {

		weekDaysWorked = 7

	} else {

		if (bottomDateDay > employeePayDay) {

			weekDaysWorked = bottomDateDay - employeePayDay

		} else {

			weekDaysWorked = bottomDateDay - employeePayDay + 7
		}
	}

	return weekDaysWorked
}

export const getEmployeeDayInfo = async (req, res, next) => {

	const employeeId = req.params.employeeId

	const { bottomDate } = getDayRange(new Date())

	try {

		const employeeDayInfo = await EmployeeDailyBalance.findOne({

			createdAt: { $gte: bottomDate },
			employee: employeeId

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

	let income = null
	let employeePayment = null
	let incomeType = null
	let extraOutgoing

	const employeeData = await Employee.findById(employee, 'name lastName')

	try {

		extraOutgoing = await newExtraOutgoingFunction({ amount, concept: (detail + ' [' + employeeData.name + ' ' + employeeData.lastName + ']'), company, employee: supervisor, createdAt, partOfAPayment: true })

		if (!extraOutgoing) throw new Error("No se ha podido crear el gasto fuera de cuenta");

		if (branch != null) {

			incomeType = await getIncomeTypeId({ name: 'Efectivo' })

			if (!incomeType) throw new Error("No se encontró el tipo de ingreso");

			income = await newBranchIncomeFunction({ amount, company, branch, employee: supervisor, type: String(incomeType._id), createdAt, partOfAPayment: true })

			if (!income) throw new Error("No se pudo crear el efectivo");

			employeePayment = await newEmployeePaymentFunction({ amount, detail, employee, supervisor, company, extraOutgoing: extraOutgoing._id, income: income._id, createdAt })

			if (!employeePayment) throw new Error("No se ha podido crear el pago a empleado");

		} else {

			employeePayment = await newEmployeePaymentFunction({ amount, detail, employee, supervisor, company, extraOutgoing: extraOutgoing._id, createdAt })

			if (!employeePayment) throw new Error("No se ha podido crear el pago a empleado");

		}

		res.status(200).json({ extraOutgoing, income, employeePayment })

	} catch (error) {

		if (extraOutgoing) {

			await ExtraOutgoing.findByIdAndDelete(extraOutgoing._id)
		}

		if (employeePayment) {

			await EmployeePayment.findByIdAndDelete(employeePayment._id)
		}

		if (income) {

			await deleteIncome({ incomeId: income._id })
		}

		next(error)
	}
}

export const newEmployeePaymentFunction = async ({ amount, detail, employee, supervisor, company, extraOutgoing, income, createdAt }) => {

	const newEmployeePayment = new EmployeePayment({ amount, detail, employee, supervisor, company, extraOutgoing, income, createdAt })

	await newEmployeePayment.save()

	return newEmployeePayment
}

export const getEmployeePayments = async (req, res, next) => {

	const employeeId = req.params.employeeId
	const { bottomDate, topDate } = getDayRange(new Date(req.params.date))
	const bottomDateDay = (new Date(bottomDate)).getDay()

	try {

		const employeePayDay = (await Employee.findById(employeeId)).payDay

		if (!employeePayDay) throw new Error("El empleado no tiene día de pago");

		let weekDaysWorked = 0

		if (bottomDateDay == employeePayDay) {

			weekDaysWorked = 7

		} else {

			if (bottomDateDay > employeePayDay) {

				weekDaysWorked = bottomDateDay - employeePayDay

			} else {

				weekDaysWorked = bottomDateDay - employeePayDay + 7
			}
		}

		const firstWeekDay = new Date(bottomDate)
		firstWeekDay.setDate(firstWeekDay.getDate() - weekDaysWorked)
		const employeePayments = {

			total: 0,
			employeePayments: []
		}

		employeePayments.employeePayments = await EmployeePayment.find({
			$and: [

				{
					createdAt: {
						$gte: firstWeekDay
					}
				},
				{
					createdAt: {
						$lt: new Date(topDate)
					}
				},
				{ employee: employeeId }
			]
		})

		employeePayments.employeePayments.forEach((employeePayment) => {

			employeePayments.total += employeePayment.amount
		})

		res.status(200).json(employeePayments)

	} catch (error) {

		next(error)
	}
}

export const getEmployeesPaymentsQuery = async (req, res, next) => {

	const { bottomDate, topDate } = getDayRange(req.params.date)
	const companyId = req.params.companyId

	try {

		const employeesPayments = await EmployeePayment.find({
			createdAt: { $lt: topDate, $gte: bottomDate },
			company: companyId
		}).populate('supervisor', 'name lastName').populate('employee', 'name lastName')

		if (employeesPayments.length > 0) {

			let total = 0

			employeesPayments.forEach((employeePayment) => {

				total += employeePayment.amount
			})

			res.status(200).json({ employeesPayments, totalEmployeesPayments: total })

		} else {

			throw new Error("No se encontraron pagos a empleados");
		}

	} catch (error) {

		next(error)
	}
}

export const deleteEmployeePaymentQuery = async (req, res, next) => {

	const { paymentId, incomeId, extraOutgoingId } = req.params

	let deletedIncome = null
	let deletedExtraOutgoing = null
	let deletedPayment = null

	try {

		deletedExtraOutgoing = await deleteExtraOutgoingFunction({ extraOutgoingId })
		if (!deletedExtraOutgoing) throw new Error("No se eliminó el gasto fuera de cuentas");

		if (incomeId) {

			deletedIncome = await deleteIncome({ incomeId })
			if (!deletedIncome) throw new Error("No se pudo eliminar el ingreso");
		}

		deletedPayment = await EmployeePayment.findByIdAndDelete(paymentId)
		if (!deletedPayment) throw new Error("No se pudo eliminar el pago a empleado");

		res.status(200).json('Pago eliminado, verifique que el gasto y el efectivo del pago se hayan eliminado correctamente.')

	} catch (error) {

		if (deletedExtraOutgoing) {

			await ExtraOutgoing.create({ deletedExtraOutgoing })
		}

		if (deletedIncome) {

			await IncomeCollected.create({ deletedIncome })
		}

		if (deletedPayment) {

			await EmployeePayment.create({ deletedPayment })
		}

		next(error)
	}
}

export const getEmployeePayroll = async (req, res, next) => {

	const companyId = req.params.companyId
	const { bottomDate } = getDayRange(req.params.date)
	const day = (new Date(bottomDate)).getDay()

	try {

		const employeesPayroll = await Employee.aggregate([

			{
				$match: {
					'company': new Types.ObjectId(companyId),
					'payDay': day,
					'active': true
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

export const addSupervisorMoneyDelivery = async (req, res, next) => {

	const { supervisorId, companyId, amount, date } = req.body
	const { bottomDate, topDate } = getDayRange(date)
	let dailyBalance = null
	let updatedDailyBalance = null
	let supervisorReport = null
	let updatedSupervisorReport = null

	try {

		supervisorReport = await SupervisorReport.findOne({
			createdAt: { $lt: topDate, $gte: bottomDate },
			supervisor: new Types.ObjectId(supervisorId)
		})

		if (!supervisorReport) {

			supervisorReport = await SupervisorReport.create({ company: companyId, supervisor: supervisor._id })

			if (!supervisorReport) throw new Error("No se pudo crear el reporte del supervisor");

		}

		updatedSupervisorReport = await SupervisorReport.findByIdAndUpdate(supervisorReport._id, {
			moneyDelivered: amount,
			$inc: { balance: (amount - supervisorReport.moneyDelivered) }
		}, { new: true })

		if (!updatedSupervisorReport) throw new Error("No se editó el reporte de supervisor");

		dailyBalance = await EmployeeDailyBalance.findOne({
			createdAt: { $lt: topDate, $gte: bottomDate },
			employee: new Types.ObjectId(supervisorId)
		})

		if (!dailyBalance) throw new Error("No se encontró el balance del empleado.");

		updatedDailyBalance = await EmployeeDailyBalance.findByIdAndUpdate(dailyBalance._id, {
			supervisorBalance: updatedSupervisorReport.balance
		}, { new: true })

		if (!updatedDailyBalance) throw new Error("No se editó el balance del supervisor");

		res.status(200).json({ updatedSupervisorReport })

	} catch (error) {

		if (!updatedDailyBalance && updatedSupervisorReport
			&& (SupervisorReport.balance != updatedSupervisorReport.balance
				|| supervisorReport.moneyDelivered != supervisorReport.moneyDelivered)) {

			await SupervisorReport.findByIdAndUpdate(supervisorReport._id, { moneyDelivered: supervisorReport.moneyDelivered, balance: supervisorReport.balance })
		}

		next(error)
	}
}

export const addSupervisorReportIncome = async ({ income, day }) => {

	const { bottomDate, topDate } = day

	let dailyBalance = null
	let updatedDailyBalance = null
	let supervisorReport = null
	let updatedSupervisorReport = null

	try {

		supervisorReport = await SupervisorReport.findOne({
			createdAt: { $lt: topDate, $gte: bottomDate },
			supervisor: new Types.ObjectId(income.employee)
		})

		if (!supervisorReport) {

			supervisorReport = await SupervisorReport.create({ supervisor: income.employee, company: income.company })

			if (!supervisorReport) throw new Error("No se pudo crear el reporte del supervisor");

		}

		updatedSupervisorReport = await SupervisorReport.findByIdAndUpdate(supervisorReport._id, {

			$push: { incomesArray: income._id },
			$inc: { incomes: income.amount, balance: -income.amount }
		}, { new: true })

		if (!updatedSupervisorReport) throw new Error("No se editó el reporte de supervisor");

		dailyBalance = await EmployeeDailyBalance.findOne({
			createdAt: { $lt: topDate, $gte: bottomDate },
			employee: new Types.ObjectId(income.employee)
		})

		if (!dailyBalance) throw new Error("No se encontró el balance del empleado.");

		updatedDailyBalance = await EmployeeDailyBalance.findByIdAndUpdate(dailyBalance._id, {

			supervisorBalance: updatedSupervisorReport.balance
		}, { new: true })

		if (!updatedDailyBalance) throw new Error("No se editó el balance del supervisor")

	} catch (error) {

		if (!updatedDailyBalance && updatedSupervisorReport
			&& (SupervisorReport.balance != updatedSupervisorReport.balance
				|| supervisorReport.incomesArray != supervisorReport.incomesArray
				|| supervisorReport.incomes != supervisorReport.incomes)) {


			await SupervisorReport.findByIdAndUpdate(supervisorReport._id, { incomes: supervisorReport.incomes, incomesArray: supervisorReport.incomesArray, balance: supervisorReport.balance })
		}
		throw error
	}
}

export const deleteSupervisorReportIncome = async ({ income, day }) => {

	const { bottomDate, topDate } = day

	let dailyBalance = null
	let updatedDailyBalance = null
	let supervisorReport = null
	let updatedSupervisorReport = null

	try {

		supervisorReport = await SupervisorReport.findOne({
			createdAt: { $lt: topDate, $gte: bottomDate },
			supervisor: new Types.ObjectId(income.employee)
		})

		if (!supervisorReport) throw new Error("No encontró el reporte")

		updatedSupervisorReport = await SupervisorReport.findByIdAndUpdate(supervisorReport._id, {

			$pull: { incomesArray: income._id },
			$inc: { incomes: -income.amount, balance: income.amount }
		}, { new: true })

		if (!updatedSupervisorReport) throw new Error("No se editó el reporte de supervisor");

		dailyBalance = await EmployeeDailyBalance.findOne({
			createdAt: { $lt: topDate, $gte: bottomDate },
			employee: new Types.ObjectId(income.employee)
		})

		if (!dailyBalance) throw new Error("No se encontró el balance del empleado.");

		updatedDailyBalance = await EmployeeDailyBalance.findByIdAndUpdate(dailyBalance._id, {

			supervisorBalance: updatedSupervisorReport.balance
		}, { new: true })

		if (!updatedDailyBalance) throw new Error("No se editó el balance del supervisor")

	} catch (error) {

		if (!updatedDailyBalance && updatedSupervisorReport
			&& (SupervisorReport.balance != updatedSupervisorReport.balance
				|| supervisorReport.incomesArray != supervisorReport.incomesArray
				|| supervisorReport.incomes != supervisorReport.incomes)) {


			await SupervisorReport.findByIdAndUpdate(supervisorReport._id, { incomes: supervisorReport.incomes, incomesArray: supervisorReport.incomesArray, balance: supervisorReport.balance })
		}
		throw error
	}
}

export const deleteSupervisorExtraOutgoing = async ({ extraOutgoing, day }) => {

	const { bottomDate, topDate } = day

	let dailyBalance = null
	let updatedDailyBalance = null
	let supervisorReport = null
	let updatedSupervisorReport = null

	try {

		supervisorReport = await SupervisorReport.findOne({
			createdAt: { $lt: topDate, $gte: bottomDate },
			supervisor: new Types.ObjectId(extraOutgoing.employee)
		})

		if (!supervisorReport) throw new Error("No encontró el reporte")

		updatedSupervisorReport = await SupervisorReport.findByIdAndUpdate(supervisorReport._id, {
			$pull: { extraOutgoingsArray: extraOutgoing._id },
			$inc: { extraOutgoings: -extraOutgoing.amount, balance: -extraOutgoing.amount }
		}, { new: true })

		if (!updatedSupervisorReport) throw new Error("No se editó el reporte de supervisor");

		dailyBalance = await EmployeeDailyBalance.findOne({
			createdAt: { $lt: topDate, $gte: bottomDate },
			employee: new Types.ObjectId(extraOutgoing.employee)
		})

		if (!dailyBalance) throw new Error("No se encontró el balance del empleado.");

		updatedDailyBalance = await EmployeeDailyBalance.findByIdAndUpdate(dailyBalance._id, {

			supervisorBalance: updatedSupervisorReport.balance
		}, { new: true })

		if (!updatedDailyBalance) throw new Error("No se editó el balance del supervisor");

	} catch (error) {

		if (!updatedDailyBalance && updatedSupervisorReport
			&& (SupervisorReport.balance != updatedSupervisorReport.balance
				|| supervisorReport.extraOutgoingsArray != supervisorReport.extraOutgoingsArray
				|| supervisorReport.extraOutgoings != supervisorReport.extraOutgoings)) {


			await SupervisorReport.findByIdAndUpdate(supervisorReport._id, { incomesArray: supervisorReport.extraOutgoings, extraOutgoingsArray: supervisorReport.extraOutgoingsArray, balance: supervisorReport.balance })
		}

		throw error
	}
}

export const addSupervisorReportExtraOutgoing = async ({ extraOutgoing, day }) => {
	const { bottomDate, topDate } = day

	let dailyBalance = null
	let updatedDailyBalance = null
	let supervisorReport = null
	let updatedSupervisorReport = null

	try {

		supervisorReport = await SupervisorReport.findOne({
			createdAt: { $lt: topDate, $gte: bottomDate },
			supervisor: new Types.ObjectId(extraOutgoing.employee)
		})

		if (!supervisorReport) {

			supervisorReport = await SupervisorReport.create({ supervisor: extraOutgoing.employee, company: extraOutgoing.company })

			if (!supervisorReport) throw new Error("No se pudo crear el reporte del supervisor");
		}

		updatedSupervisorReport = await SupervisorReport.findByIdAndUpdate(supervisorReport._id, {

			$push: { extraOutgoingsArray: extraOutgoing._id },
			$inc: { extraOutgoings: extraOutgoing.amount, balance: extraOutgoing.amount }

		}, { new: true })

		if (!updatedSupervisorReport) throw new Error("No se editó el reporte de supervisor");

		dailyBalance = await EmployeeDailyBalance.findOne({
			createdAt: { $lt: topDate, $gte: bottomDate },
			employee: new Types.ObjectId(extraOutgoing.employee)
		})

		if (!dailyBalance) throw new Error("No se encontró el balance del empleado.");

		updatedDailyBalance = await EmployeeDailyBalance.findByIdAndUpdate(dailyBalance._id, {

			supervisorBalance: updatedSupervisorReport.balance
		}, { new: true })

		if (!updatedDailyBalance) throw new Error("No se editó el balance del supervisor");

	} catch (error) {

		if (!updatedDailyBalance && updatedSupervisorReport
			&& (SupervisorReport.balance != updatedSupervisorReport.balance
				|| supervisorReport.incomesArray != supervisorReport.incomesArray
				|| supervisorReport.incomes != supervisorReport.incomes)) {

			await SupervisorReport.findByIdAndUpdate(supervisorReport._id, { incomes: supervisorReport.incomes, incomesArray: supervisorReport.incomesArray, balance: supervisorReport.balance })
		}

		throw error
	}
}

export const updateEmployeeDailyBalancesBalance = async ({ branchReport, changedEmployee = false }) => {

	return await updateDailyBalancesBalance(branchReport, changedEmployee)
}

export const updateSupervisorDailyBalance = async ({ record, date, employee, recordType }) => {

	const { bottomDate, topDate } = getDayRange(date)
	let dailyBalance = null
	let updatedDailyBalance = null

	dailyBalance = await EmployeeDailyBalance.findOne({
		createdAt: { $lt: topDate, $gte: bottomDate },
		employee: new Types.ObjectId(employee)
	})

	if (!dailyBalance) throw new Error("No se encontró el balance del empleado.")

	if (recordType == 'incomes') {

		updatedDailyBalance = await EmployeeDailyBalance.findByIdAndUpdate(dailyBalance._id, {

			supervisorBalance: 0

		}, { new: true })

	} else {

		updatedDailyBalance = await EmployeeDailyBalance.findByIdAndUpdate(dailyBalance._id, { supervisorBalance: 0 })
	}

	if (!updatedDailyBalance) throw new Error("No se actualizó el balance del empleado")

	return updatedDailyBalance
}

export const updateDailyBalancesBalance = async (branchReport, changedEmployee = false) => {

	const { bottomDate, topDate } = getDayRange(branchReport.createdAt)

	let dailyBalance = await EmployeeDailyBalance.findOne({
		createdAt: { $lt: topDate, $gte: bottomDate },
		employee: new Types.ObjectId(branchReport.employee)
	})

	if (!dailyBalance) throw new Error("No se encontró el balance del empleado.");

	const updatedDailyBalance = await EmployeeDailyBalance.findByIdAndUpdate(dailyBalance._id, { accountBalance: changedEmployee ? 0 : branchReport.balance })

	if (!updatedDailyBalance) throw new Error("No se actualizó el balance del empleado");

	return updatedDailyBalance
}

export const changeEmployeeActiveStatus = async (req, res, next) => {

	const { newStatus } = req.body
	const employeeId = req.params.employeeId

	try {

		const updatedEmployee = await Employee.findOneAndUpdate({ _id: employeeId }, { active: newStatus }, { new: true }).populate({ path: 'role' })

		if (Object.getOwnPropertyNames(updatedEmployee).length > 0) {

			res.status(200).json({ updatedEmployee })

		} else {

			next(errorHandler(404, 'No se pudo actualizar el usuario'))
		}

	} catch (error) {

		next(error)
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