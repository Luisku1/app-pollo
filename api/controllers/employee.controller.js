import { get, Types } from "mongoose"
import bcryptjs from 'bcryptjs'
import BranchReport from "../models/accounts/branch.report.model.js"
import EmployeeDailyBalance from "../models/employees/employee.daily.balance.js"
import Employee from "../models/employees/employee.model.js"
import { errorHandler } from "../utils/error.js"
import { formatDate, getDayRange, getWeekRange } from "../utils/formatDate.js"
import { deleteExtraOutgoingFunction, newExtraOutgoingFunction } from "./outgoing.controller.js"
import { deleteIncome, getIncomeTypeId, lookupSupervisorReportIncomes, newBranchIncomeFunction } from "./income.controller.js"
import EmployeePayment from "../models/employees/employee.payment.model.js"
import SupervisorReport from "../models/accounts/supervisor.report.model.js"
import { fetchRolesFromDB } from "./role.controller.js"
import EmployeeWeeklyBalance from "../models/employees/employee.weekly.balance.model.js"
import EmployeeRest from "../models/employees/employee.rest.model.js"
import { branchLookup, unwindBranch, employeeLookup, unwindEmployee } from "./branch.report.controller.js"
import EmployeeBalanceAdjustment from "../models/employees/balance.adjustment.model.js"
import { toCurrency } from "../../common/formatters.js"
import CompanyPenalties from "../models/company.penalties.model.js"
import { branchAggregate } from "./branch.controller.js"

export const employeePaymentIncomeAggregate = (localField, as = 'employeePayment') => {
	return [
		{
			$lookup: {
				from: 'employeePayments',
				localField: localField,
				foreignField: 'income',
				as: as,
				pipeline: [
					...employeeAggregate('employee'),
				]
			}
		},
		{
			$unwind: { path: `$${as}`, preserveNullAndEmptyArrays: true }
		},
	]
}


export const employeeAggregate = (localField, as = 'employee') => {
	return [
		{
			$lookup: {
				from: 'employees',
				localField: localField,
				foreignField: '_id',
				as: as,
				pipeline: [
					{
						$lookup: {
							from: 'roles',
							localField: 'role',
							foreignField: '_id',
							as: 'role'
						}
					},
					{
						$unwind: { path: '$role', preserveNullAndEmptyArrays: true }
					},
					{
						$project: {
							password: 0
						}
					}
				]
			}
		},
		{ $unwind: { path: `$${as}`, preserveNullAndEmptyArrays: true } }
	]
}

const employeeSupervisorReportsLookup = (localField, bottomDate, topDate) => ({
	$lookup: {
		from: 'supervisorreports',
		localField: localField,
		foreignField: 'supervisor',
		as: 'supervisorReports',
		pipeline: [
			{
				$match: {
					'createdAt': { $gte: new Date(bottomDate), $lt: new Date(topDate) },
				}
			},
			{
				$lookup: {
					from: 'employees',
					localField: 'supervisor',
					foreignField: '_id',
					as: 'supervisor',
					pipeline: [
						{
							$lookup: {
								from: 'roles',
								localField: 'role',
								foreignField: '_id',
								as: 'role'
							}
						},
						{ $unwind: { path: '$role', preserveNullAndEmptyArrays: true } },
						{
							$project: {
								password: 0
							}
						}
					]
				}
			},
			{ $unwind: { path: '$supervisor', preserveNullAndEmptyArrays: false } },
			{
				$lookup: {
					from: 'extraoutgoings',
					localField: 'extraOutgoingsArray',
					foreignField: '_id',
					as: 'extraOutgoingsArray',
					pipeline: [
						{ $sort: { "amount": -1 } },
						{
							$lookup: {
								from: 'employeepayments',
								localField: '_id',
								foreignField: 'extraOutgoing',
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
						{ $unwind: { path: '$employeePayment', preserveNullAndEmptyArrays: true } },
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
			lookupSupervisorReportIncomes('Depósito', 'depositsArray'),
			lookupSupervisorReportIncomes('Efectivo', 'cashArray'),
			lookupSupervisorReportIncomes('Terminal', 'terminalIncomesArray'),
			{
				$addFields: {
					extraOutgoings: { $sum: '$extraOutgoingsArray.amount' },
					cash: { $sum: '$cashArray.amount' },
					deposits: { $sum: '$depositsArray.amount' },
					terminalIncomes: { $sum: '$terminalIncomesArray.amount' },
					verifiedCash: '$verifiedCash',
					verifiedDeposits: '$verifiedDeposits',
				}
			},
			{
				$project: {
					_id: 1,
					extraOutgoings: 1,
					cash: 1,
					deposits: 1,
					supervisor: 1,
					createdAt: 1,
					cashArray: 1,
					depositsArray: 1,
					extraOutgoingsArray: 1,
					terminalIncomes: 1,
					terminalIncomesArray: 1,
					missingIncomes: 1,
					verifiedCash: 1,
					balance: 1,
					verifiedDeposits: 1,
					supervisor: 1
				}
			}
		]
	}
})

const employeeDailyBalancesLookup = (localField, bottomDate, topDate) => ({
	$lookup: {
		from: 'employeedailybalances',
		localField: localField,
		foreignField: 'employee',
		as: 'employeeDailyBalances',
		pipeline: [
			{
				$match: {
					createdAt: { $gte: new Date(bottomDate), $lt: new Date(topDate) }
				}
			},
			{
				$sort: { createdAt: -1 }
			}
		]
	}
})

const employeeBranchReportsLookup = (localField, bottomDate, topDate) => ({
	$lookup: {
		from: 'branchreports',
		localField: localField,
		foreignField: 'employee',
		as: 'branchReports',
		pipeline: [
			{
				$match: { createdAt: { $gte: new Date(bottomDate), $lt: new Date(topDate) } }
			},
			{
				$sort: { createdAt: -1 }
			},
			{
				$lookup: {
					from: 'outputs',
					localField: 'outputsArray',
					foreignField: '_id',
					as: 'outputsArray',
					pipeline: [
						{
							$lookup: {
								from: 'products',
								localField: 'product',
								foreignField: '_id',
								as: 'product',
							},
						},
						{ $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
						...employeeAggregate('employee'),
						{
							$lookup: {
								from: 'branches',
								localField: 'branch',
								foreignField: '_id',
								as: 'branch',
							},
						},
						{ $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } },
						{
							$lookup: {
								from: 'customers',
								localField: 'customer',
								foreignField: '_id',
								as: 'customer',
							},
						},
						{ $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
					]
				}
			},
			{
				$lookup: {
					from: 'inputs',
					localField: 'inputsArray',
					foreignField: '_id',
					as: 'inputsArray',
					pipeline: [
						{
							$lookup: {
								from: 'products',
								localField: 'product',
								foreignField: '_id',
								as: 'product',
							},
						},
						{ $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
						{
							$lookup: {
								from: 'employees',
								localField: 'employee',
								foreignField: '_id',
								as: 'employee',
							},
						},
						{ $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
						{
							$lookup: {
								from: 'branches',
								localField: 'branch',
								foreignField: '_id',
								as: 'branch',
							},
						},
						{ $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } },
						{
							$lookup: {
								from: 'customers',
								localField: 'customer',
								foreignField: '_id',
								as: 'customer',
							},
						},
						{ $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
					],
				}
			},
			{
				$lookup: {
					from: 'providerinputs',
					localField: 'providerInputsArray',
					foreignField: '_id',
					as: 'providerInputsArray',
					pipeline: [
						{
							$lookup: {
								from: 'products',
								localField: 'product',
								foreignField: '_id',
								as: 'product',
							},
						},
						{ $unwind: { path: '$product', preserveNullAndEmptyArrays: true }, },
						{
							$lookup: {
								from: 'employees',
								localField: 'employee',
								foreignField: '_id',
								as: 'employee',
							},
						},
						{ $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
						{
							$lookup: {
								from: 'branches',
								localField: 'branch',
								foreignField: '_id',
								as: 'branch',
							},
						},
						{ $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } },
						{
							$lookup: {
								from: 'customers',
								localField: 'customer',
								foreignField: '_id',
								as: 'customer',
							},
						},
						{ $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
					],
				}
			},
			{
				$lookup: {
					from: 'incomecollecteds',
					localField: 'incomesArray',
					foreignField: '_id',
					as: 'incomesArray',
					pipeline: [
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
											foreignField: '_id',
											localField: 'employee',
											as: 'employee'
										}
									},
									{
										$lookup: {
											from: 'employees',
											foreignField: '_id',
											localField: 'supervisor',
											as: 'supervisor'
										}
									},
									{
										$unwind: { path: '$supervisor', preserveNullAndEmptyArrays: true }
									},
									{
										$unwind: { path: '$employee', preserveNullAndEmptyArrays: true }
									},
									{
										$lookup: {
											from: 'branches',
											foreignField: '_id',
											localField: 'branch',
											as: 'branch'
										}
									},
									{
										$unwind: { path: '$branch', preserveNullAndEmptyArrays: true }
									}
								]
							}
						},
						{ $unwind: { path: '$employeePayment', preserveNullAndEmptyArrays: true } },
						{
							$lookup: {
								from: 'incometypes',
								localField: 'type',
								foreignField: '_id',
								as: 'type',
							},
						},
						{
							$unwind: { path: '$type', preserveNullAndEmptyArrays: true }
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
						{
							$lookup: {
								from: 'branches',
								localField: 'branch',
								foreignField: '_id',
								as: 'branch'
							}
						},
						{ $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } },
						{
							$lookup: {
								from: 'customers',
								localField: 'customer',
								foreignField: '_id',
								as: 'customer'
							}
						},
						{ $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
						{
							$lookup: {
								from: 'employees',
								localField: 'owner',
								foreignField: '_id',
								as: 'owner'
							}
						},
						{ $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
						{
							$lookup: {
								from: 'employees',
								localField: 'prevOwner',
								foreignField: '_id',
								as: 'prevOwner'
							}
						},
						{ $unwind: { path: '$prevOwner', preserveNullAndEmptyArrays: true } }
					]
				}
			},
			{
				$lookup: {
					from: 'outgoings',
					localField: 'outgoingsArray',
					foreignField: '_id',
					as: 'outgoingsArray',
					pipeline: [
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
								from: 'branches',
								localField: 'branch',
								foreignField: '_id',
								as: 'branch'
							}
						},
						{ $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } }
					]
				}
			},
			{
				$lookup: {
					from: 'stocks',
					localField: 'finalStockArray',
					foreignField: '_id',
					as: 'finalStockArray',
					pipeline: [
						{
							$lookup: {
								from: 'products',
								localField: 'product',
								foreignField: '_id',
								as: 'product',
							}
						},
						{ $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
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
								from: 'branches',
								localField: 'branch',
								foreignField: '_id',
								as: 'branch'
							}
						},
						{ $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } }
					]
				}
			},
			{
				$lookup: {
					from: 'stocks',
					localField: 'initialStockArray',
					foreignField: '_id',
					as: 'initialStockArray',
					pipeline: [
						{
							$lookup: {
								from: 'products',
								localField: 'product',
								foreignField: '_id',
								as: 'product',
							}
						},
						{ $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
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
								from: 'branches',
								localField: 'branch',
								foreignField: '_id',
								as: 'branch'
							}
						},
						{ $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } }
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
				$unwind: { path: '$branch' }
			},
			...employeeAggregate('employee'),
			{
				$lookup: {
					from: 'employees',
					localField: 'assistant',
					foreignField: '_id',
					as: 'assistant'
				}
			},
			{
				$unwind: { path: '$assistant', preserveNullAndEmptyArrays: true }
			}
		]
	}
})

export const getEmployeeBranchReports = async (req, res, next) => {

	const { employeeId } = req.params
	const { date } = req.query

	const employeePayDay = await getEmployeePayDay(employeeId)

	let shiftedWeeks = 0

	if (employeePayDay == new Date().getDate()) shiftedWeeks = -1


	const { weekStart, weekEnd } = getWeekRange(new Date(date), employeePayDay, shiftedWeeks)

	try {

		const employeeBranchReports = await Employee.aggregate([
			{
				$match: { _id: new Types.ObjectId(employeeId) }
			},
			employeeBranchReportsLookup('_id', weekStart, weekEnd),
			{
				$project: {
					_id: 1,
					name: 1,
					lastName: 1,
					branchReports: 1,
				}
			}
		]) ?? []

		res.status(200).json({
			message: 'Employee branch reports',
			data: employeeBranchReports[0]?.branchReports ?? [],
			success: true
		})

	} catch (error) {

		console.log(error)
		next(error)
	}
}

export const getEmployeeSupervisorReports = async (req, res, next) => {

	const { employeeId } = req.params
	const { date } = req.query

	const employeePayDay = await getEmployeePayDay(employeeId)

	let shiftedWeeks = 0

	if (employeePayDay == new Date().getDate()) shiftedWeeks = -1

	const { weekStart, weekEnd } = getWeekRange(new Date(date), employeePayDay, -1, shiftedWeeks)

	try {

		const employeeSupervisorReports = await Employee.aggregate([
			{
				$match: { _id: new Types.ObjectId(employeeId) }
			},
			employeeSupervisorReportsLookup('_id', weekStart, weekEnd),
			{
				$project: {
					_id: 1,
					name: 1,
					lastName: 1,
					supervisorReports: 1,
				}
			}
		])

		res.status(200).json({
			message: 'Employee supervisor reports',
			data: employeeSupervisorReports[0]?.supervisorReports ?? [],
			success: true
		})

	} catch (error) {

		console.log(error)
		next(error)
	}
}

export const getEmployees = async (req, res, next) => {

	try {

		const companyId = req.params.companyId
		const employees = await Employee.find({ company: companyId, active: true }).sort({ name: 1 })

		res.status(200)
			.json({ employees: employees })

	} catch (error) {

		next(error)
	}
}

export const getAllEmployees = async (req, res, next) => {

	const companyId = req.params.companyId

	try {

		const employees = await Employee.find({ company: companyId }).sort({ name: 1 }).populate({ path: 'role', select: 'name' }).populate({ path: 'hiredBy', select: 'name lastName' })

		res.status(200).json({ employees })

	} catch (error) {
		next(error)
	}
}

export const getEmployee = async (req, res, next) => {

	const employeeId = req.params.employeeId

	try {

		const employee = await Employee.findById(employeeId).populate('role')
		const { password: pass, ...rest } = employee._doc

		if (employee) {

			res.status(200).json({ employee: rest })

		} else {

			next(errorHandler(404, 'Not employee found'))
		}

	} catch (error) {

		next(error)
	}
}

export const getEmployeeReports = async (req, res, next) => {
	const { employeeId, consultantRole, pag } = req.params
	const { bottomDate } = getDayRange(new Date())

	try {
		const roles = await fetchRolesFromDB()
		const consultantRoleObject = roles.find((role) => role._id == consultantRole)
		const isNotSeller = consultantRoleObject.name != 'Vendedor'

		const employeeWeekDays = await getEmployeeWorkedDays(bottomDate, employeeId)
		const firstWeekDay = new Date(bottomDate)
		firstWeekDay.setDate(firstWeekDay.getDate() - employeeWeekDays)
		let oldestDate = new Date(firstWeekDay)

		if (!isNaN(pag) && pag > 0) {
			oldestDate.setDate(oldestDate.getDate() - 7 * pag)
		}

		const employeeObjectId = new Types.ObjectId(employeeId)

		const employeeReports = await BranchReport.aggregate([
			{
				$match: {
					'createdAt': { $gte: new Date(oldestDate) },
					$or: [
						{ 'employee': employeeObjectId },
						{ 'assistant': employeeObjectId },
						{
							'sender': employeeObjectId,
							$expr: { $eq: [isNotSeller, true] }
						}
					]
				}
			},
			{
				$sort: { 'createdAt': -1 }
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
				$lookup: {
					from: 'stocks',
					localField: 'finalStockArray',
					foreignField: '_id',
					as: 'finalStockArray',
					pipeline: [
						branchLookup,
						unwindBranch,
						{
							$lookup: {
								from: 'products',
								localField: 'product',
								foreignField: '_id',
								as: 'product',
							},
						},
						{
							$unwind: {
								path: '$product',
								preserveNullAndEmptyArrays: true,
							},
						},
						employeeLookup,
						unwindEmployee
					],
				},
			},
			{
				$lookup: {
					from: 'stocks',
					localField: 'initialStockArray',
					foreignField: '_id',
					as: 'initialStockArray',
					pipeline: [
						branchLookup,
						unwindBranch,
						{
							$lookup: {
								from: 'products',
								localField: 'product',
								foreignField: '_id',
								as: 'product',
							},
						},
						{
							$unwind: {
								path: '$product',
								preserveNullAndEmptyArrays: true,
							},
						},
						employeeLookup,
						unwindEmployee
					],
				}
			},
			{
				$lookup: {
					from: 'inputs',
					localField: 'inputsArray',
					foreignField: '_id',
					as: 'inputsArray',
					pipeline: [
						branchLookup,
						unwindBranch,
						{
							$lookup: {
								from: 'products',
								localField: 'product',
								foreignField: '_id',
								as: 'product',
							},
						},
						{
							$unwind: {
								path: '$product',
								preserveNullAndEmptyArrays: true,
							},
						},
						employeeLookup,
						unwindEmployee
					],
				},
			},
			{
				$lookup: {
					from: 'providerinputs',
					localField: 'providerInputsArray',
					foreignField: '_id',
					as: 'providerInputsArray',
					pipeline: [
						{
							$lookup: {
								from: 'products',
								localField: 'product',
								foreignField: '_id',
								as: 'product',
							},
						},
						{ $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
						{
							$lookup: {
								from: 'employees',
								localField: 'employee',
								foreignField: '_id',
								as: 'employee',
							},
						},
						{ $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
						{
							$lookup: {
								from: 'branches',
								localField: 'branch',
								foreignField: '_id',
								as: 'branch',
							},
						},
						{ $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } },
						{
							$lookup: {
								from: 'customers',
								localField: 'customer',
								foreignField: '_id',
								as: 'customer',
							},
						},
						{ $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
					],
				},
			},
			{
				$lookup: {
					from: 'outputs',
					localField: 'outputsArray',
					foreignField: '_id',
					as: 'outputsArray',
					pipeline: [
						branchLookup,
						unwindBranch,
						{
							$lookup: {
								from: 'products',
								localField: 'product',
								foreignField: '_id',
								as: 'product',
							},
						},
						{
							$unwind: {
								path: '$product',
								preserveNullAndEmptyArrays: true,
							},
						},
						employeeLookup,
						unwindEmployee,
					],
				},
			},
			{
				$lookup: {
					from: 'outgoings',
					localField: 'outgoingsArray',
					foreignField: '_id',
					as: 'outgoingsArray',
					pipeline: [
						branchLookup,
						unwindBranch,
						employeeLookup,
						unwindEmployee,
					],
				},
			},
			{
				$lookup: {
					from: 'incomecollecteds',
					localField: 'incomesArray',
					foreignField: '_id',
					as: 'incomesArray',
					pipeline: [
						branchLookup,
						unwindBranch,
						employeeLookup,
						unwindEmployee,
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
						{ $unwind: { path: '$employeePayment', preserveNullAndEmptyArrays: true } },
						{
							$lookup: {
								from: 'incometypes',
								localField: 'type',
								foreignField: '_id',
								as: 'type',
							},
						},
						{
							$unwind: {
								path: '$type',
								preserveNullAndEmptyArrays: true,
							},
						},
					],
				},
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
					reportData: 1,
					company: 1,
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

	const { bottomDate, topDate } = getDayRange(new Date())

	try {

		const employeeDayInfo = await EmployeeDailyBalance.findOne({

			createdAt: { $gte: bottomDate, $lt: topDate },
			employee: employeeId

		}).populate({ path: 'employee', select: 'name lastName' })

		if (employeeDayInfo) {

			res.status(200).json({
				message: 'Información del día del empleado',
				data: employeeDayInfo,
				success: true
			})
		}

	} catch (error) {

		next(error)
	}
}

export const getSignedUser = async (req, res, next) => {

	const employeeId = req.params.employeeId

	try {

		const employee = await Employee.findById(employeeId)

		if (!employee) return res.status(404).json({ message: 'No se encontró al empleado' })

		res.status(200).json({
			data: employee,
			message: 'Empleado encontrado',
			success: true
		})

	} catch (error) {

		next(error)
	}
}

export const updateEmployee = async (req, res, next) => {

	const { employeeId } = req.params
	let updateData = req.body
	let updatedEmployee = null
	let prevEmployee = null

	try {

		prevEmployee = await Employee.findById(employeeId)

		if (!prevEmployee) return res.status(404).json({ message: "No se encontró al empleado" })

		if (updateData.payday && updateData.payDay != prevEmployee.payDay) {
			await changeWeeklyBalance(employeeId, prevEmployee.payDay, updateData.payDay)
		}

		if (updateData.password) {

			const samePass = bcryptjs.compareSync(updateData.password, prevEmployee.password)

			if (samePass) {

				delete updateData.password

			} else {

				updateData = { ...updateData, password: bcryptjs.hashSync(updateData.password, 10) }
			}
		}

		updatedEmployee = await Employee.findByIdAndUpdate(prevEmployee, updateData, { new: true })

		updatedEmployee.password = undefined // Remove password from response

		if (!updatedEmployee)
			return res.status(404).json({ message: "No se actualizó al empleado" })

		res.status(200).json({ employee: updatedEmployee })

	} catch (error) {

		if (updatedEmployee) {

			await Employee.findByIdAndUpdate(employeeId, prevEmployee, { new: true })
		}
		next(error)
	}
}

export const changeWeeklyBalance = async (employee, payDay, newPayDay) => {
	let employeeWeeklyBalance = null;
	let newEmployeeWeeklyBalance = null;
	let originalEmployeeWeeklyBalance = null;

	try {
		// 1. Obtener los balances semanales y diarios
		const { weekStart: prevWeekStart } = getWeekRange(new Date(), payDay);
		const { weekStart, weekEnd } = getWeekRange(new Date(), newPayDay);

		employeeWeeklyBalance = await EmployeeWeeklyBalance.findOne({
			employee: employee._id,
			weekStart: prevWeekStart,
			currentPayDay: payDay
		}).populate('employeeDailyBalances');

		if (!employeeWeeklyBalance) throw new Error("No se encontró el balance semanal original");

		// Guardar snapshot para rollback
		originalEmployeeWeeklyBalance = employeeWeeklyBalance.toObject();

		// 2. Crear o buscar el nuevo balance semanal
		newEmployeeWeeklyBalance = await EmployeeWeeklyBalance.findOne({
			employee: employee._id,
			weekStart: weekStart,
			currentPayDay: newPayDay
		});

		if (!newEmployeeWeeklyBalance) {
			newEmployeeWeeklyBalance = await createEmployeeWeeklyBalance({
				employeeId: employee._id,
				employeePayDay: newPayDay,
				companyId: employee.company,
				date: weekStart
			});
		}

		// 3. Filtrar dailyBalances que deben moverse
		const toMove = employeeWeeklyBalance.employeeDailyBalances.filter(db =>
			db.createdAt >= weekStart && db.createdAt < weekEnd
		);

		// 4. Mover dailyBalances al nuevo weeklyBalance
		await EmployeeWeeklyBalance.findByIdAndUpdate(newEmployeeWeeklyBalance._id, {
			$addToSet: { employeeDailyBalances: { $each: toMove.map(db => db._id) } },
			$set: { previousWeekBalance: employeeWeeklyBalance.previousWeekBalance }
		});

		await EmployeeWeeklyBalance.findByIdAndUpdate(employeeWeeklyBalance._id, {
			$pull: { employeeDailyBalances: { $in: toMove.map(db => db._id) } }
		});

		// 5. Eliminar el weeklyBalance original si ya no tiene dailyBalances
		const updatedOriginal = await EmployeeWeeklyBalance.findById(employeeWeeklyBalance._id);
		if (updatedOriginal.employeeDailyBalances.length === 0) {
			await EmployeeWeeklyBalance.findByIdAndDelete(employeeWeeklyBalance._id);
		}

		// 6. Actualizar los dailyBalances para que apunten al nuevo weeklyBalance
		await EmployeeDailyBalance.updateMany(
			{ _id: { $in: toMove.map(db => db._id) } },
			{ $set: { weeklyBalance: newEmployeeWeeklyBalance._id } }
		);

		return true;
	} catch (error) {
		// Rollback: restaurar el estado original si algo falla
		if (originalEmployeeWeeklyBalance) {
			await EmployeeWeeklyBalance.findByIdAndUpdate(
				originalEmployeeWeeklyBalance._id,
				originalEmployeeWeeklyBalance
			);
		}
		throw error;
	}
};

export const refactorEmployeesWeeklyBalances = async ({ companyId }) => {

	try {

		const date = new Date()

		const bottomRange = new Date(date)
		bottomRange.setDate(bottomRange.getDate() - 2)
		const { bottomDate } = getDayRange(date)

		const activeEmployees = await Employee.find({
			company: companyId,
			active: true
		}, '_id payDay')

		activeEmployees.forEach(async (employee) => {

			const { weekStart } = getWeekRange(bottomDate, employee.payDay || 0)

			const employeeDailyBalances = await EmployeeDailyBalance.find({
				employee: employee._id,
				createdAt: { $gte: bottomRange.toISOString(), $lt: bottomDate }
			})

			employeeDailyBalances.forEach(async (dailyBalance) => {

				await addDailyBalanceInWeeklyBalance({ dailyBalance })
			})
		})

	} catch (error) {

		console.log('Error en la refactorización', error)
		throw error
	}
}

export const getEmployeePayDay = async (employeeId) => {

	const employee = await Employee.findById(employeeId, 'payDay')

	return employee?.payDay ?? 0
}

export const isCurrentOrInmediateWeek = (date, payDay) => {

	const currentDate = new Date()
	const dateToCheck = new Date(date)
	const { bottomDate } = getDayRange(currentDate)
	const { weekStart: currentStart, weekEnd: currentEnd } = getWeekRange(currentDate, payDay)
	const { weekStart: checkStart, weekEnd: checkEnd } = getWeekRange(dateToCheck, payDay)
	const isInmediatePrevWeek = bottomDate === checkEnd
	const isCurrentWeek = currentStart === checkStart && currentEnd === checkEnd

	console.log('isCurrentOrInmediateWeek', { payDay, checkStart, checkEnd, bottomDate, isInmediatePrevWeek })

	return {
		paramsWeekRange: {
			weekStart: checkStart,
			weekEnd: checkEnd
		},
		currentWeekRange: {
			weekStart: currentStart,
			weekEnd: currentEnd
		},
		isCurrentWeek: isCurrentWeek,
		isInmediatePrevWeek: isInmediatePrevWeek
	}
}

export const addDailyBalanceInWeeklyBalance = async ({ dailyBalance }) => {

	try {

		if (!dailyBalance) return

		const payDay = await getEmployeePayDay(dailyBalance.employee)

		let employeeWeeklyBalance = await fetchEmployeeWeeklyBalance({ employeeId: dailyBalance.employee, date: dailyBalance.createdAt, payDay })

		if (!employeeWeeklyBalance) {

			employeeWeeklyBalance = await createEmployeeWeeklyBalance({ employeeId: dailyBalance.employee, employeePayDay: payDay, companyId: dailyBalance.company, date: dailyBalance.createdAt })
		}

		if (!employeeWeeklyBalance) throw new Error("No se encontró un balance semanal y no se pudo crear")

		const alreadyExists = employeeWeeklyBalance.employeeDailyBalances.includes(dailyBalance._id)

		if (alreadyExists) return

		await EmployeeWeeklyBalance.findByIdAndUpdate(employeeWeeklyBalance._id, {
			$addToSet: { employeeDailyBalances: dailyBalance._id }
		})

		await EmployeeDailyBalance.findByIdAndUpdate(dailyBalance._id, {
			weeklyBalance: employeeWeeklyBalance._id
		})

	} catch (error) {

		throw error
	}
}

export const createEmployeeWeeklyBalance = async ({ employeeId, employeePayDay, companyId, date }) => {

	const { weekStart: currentStart, weekEnd: currentEnd } = getWeekRange(date, employeePayDay)
	const { weekStart } = getWeekRange(date, employeePayDay, -1)

	const hasFutureBalance = await EmployeeWeeklyBalance.exists({
		employee: employeeId,
		weekStart: { $gt: weekStart }
	})

	let lastEmployeeWeeklyBalance = null

	// 2. Si NO hay balances futuros, busca el más cercano menor o igual a weekStart
	if (!hasFutureBalance) {
		lastEmployeeWeeklyBalance = await EmployeeWeeklyBalance.findOne({
			employee: employeeId,
			weekStart: { $lt: weekStart }
		}).sort({ weekStart: -1 })
	}

	const previousWeekBalance = lastEmployeeWeeklyBalance?.balance || 0
	const employeeWeeklyData = {
		previousWeekBalance,
		employee: employeeId,
		company: companyId,
		weekStart: currentStart,
		currentPayDay: employeePayDay,
		weekEnd: currentEnd
	}

	return await EmployeeWeeklyBalance.create(employeeWeeklyData)
}

export const deleteEmployeeWeeklyBalance = async (employeeId, weekStart) => {

	let deletedEmployeeWeeklyBalance = null

	try {

		deletedEmployeeWeeklyBalance = await EmployeeWeeklyBalance.findOneAndDelete({
			weekStart: weekStart,
			employee: employeeId,
		})

		if (!deletedEmployeeWeeklyBalance) {
			throw new Error('No se encontró el balance semanal del empleado')
		}

		return deletedEmployeeWeeklyBalance

	} catch (error) {

		throw error
	}
}

export const deleteEmployeeWeeklyBalanceById = async (employeeWeeklyBalanceId) => {

	try {

	} catch (error) {

	}
}

export const fetchEmployeeWeeklyBalance = async ({ employeeId, date, payDay }) => {

	try {

		const { weekStart } = getWeekRange(date, payDay)

		const employeeWeeklyBalance = await EmployeeWeeklyBalance.findOne({
			weekStart: weekStart,
			employee: employeeId
		})

		return employeeWeeklyBalance || null

	} catch (error) {

		throw error
	}
}

export const fetchEmployeeWeeklyBalanceByDailyBalance = async (employee, weekStart) => {
	try {
		const employeeWeeklyBalance = await EmployeeWeeklyBalance.findOne({
			employee: employee,
			weekStart: weekStart
		})
		return employeeWeeklyBalance || null
	} catch (error) {
		throw error
	}
}

export const fetchEmployeePayroll = async ({ employeeId, weekRange }) => {

	try {

		const { weekStart, weekEnd } = weekRange
		const payDay = await getEmployeePayDay(employeeId)

		const weeklyBalance = await EmployeeWeeklyBalance.aggregate([
			{
				$match: {
					'weekStart': { $gte: weekStart, $lt: weekEnd },
					'employee': new Types.ObjectId(employeeId)
				}
			},
			{
				$lookup: {
					from: 'employeeweeklybalances',
					localField: 'employeeDailyBalances',
					foreignField: '_id',
					as: 'employeeDailyBalances',
				}
			},
			{
				$lookup: {
					from: 'employeepayments',
					localField: 'employee',
					foreignField: 'employee',
					as: 'employeePaymentsArray',
					pipeline: [
						{ $match: { createdAt: { $gt: bottomDate, $lt: topDate } } }
					]
				}
			},
			{
				$addFields: {
					accountBalance: { $sum: '$employeeDailyBalances.accountBalance' },
					supervisorsBalance: { $sum: '$employeeDailyBalances.supervisorBalance' },
					employeePayments: { $sum: '$employeePaymentsArray.amount' },
					missingWorkDiscount: {
						$multiply: [
							{ $size: { $filter: { input: '$employeeDailyBalances', as: 'balance', cond: { $eq: ['$$balance.missingWork', true] } } } },
							60,
						],
					},

				}
			}
		])


		return weeklyBalance || null

	} catch (error) {

		console.log(error)
		throw new Error('No se obtuvo el balance semanal del empleado')
	}
}

export const fetchEmployeesPayroll = async ({ companyId, date }) => {

	try {

		const day = new Date(date).getDay()

		// await refactorEmployeesWeeklyBalances({companyId})

		const { weekStart, weekEnd } = getWeekRange(date, day, -1)
		const firstTopDate = getDayRange(weekStart).topDate
		const lastTopDate = getDayRange(weekEnd).topDate

		const weeklyBalances = await EmployeeWeeklyBalance.aggregate([
			{
				$match: {
					'company': new Types.ObjectId(companyId),
					'weekStart': { $eq: new Date(weekStart) }
				}
			},
			employeeBranchReportsLookup('employee', weekStart, weekEnd),
			{
				$lookup: {
					from: 'employeedailybalances',
					localField: 'employeeDailyBalances',
					foreignField: '_id',
					as: 'employeeDailyBalances',
					pipeline: [
						{
							$match: { createdAt: { $gte: new Date(weekStart), $lt: new Date(weekEnd) } }
						}
					]
				}
			},
			employeeSupervisorReportsLookup('employee', weekStart, weekEnd),
			{
				$lookup: {
					from: 'employeebalanceadjustments',
					localField: 'balanceAdjustments',
					foreignField: '_id',
					as: 'balanceAdjustments'
				}
			},
			{
				$lookup: {
					from: 'employeepayments',
					localField: 'employee',
					foreignField: 'employee',
					as: 'employeePayments',
					pipeline: [
						{
							$match: { createdAt: { $gte: new Date(firstTopDate), $lt: new Date(lastTopDate) } }
						},
						{
							$sort: { createdAt: -1 }
						},
						{
							$lookup: {
								from: 'incomecollecteds',
								foreignField: '_id',
								localField: 'income',
								as: 'income',
								pipeline: [
									...employeeAggregate('employee'),
									...branchAggregate('branch'),
								]
							}
						},
						{ $unwind: { path: '$income', preserveNullAndEmptyArrays: true } },
						...employeeAggregate('employee'),
						...employeeAggregate('supervisor', 'supervisor')
					]
				}
			},
			{
				$lookup: {
					from: 'employees',
					localField: 'employee',
					foreignField: '_id',
					as: 'employee',
					pipeline: [
						{
							$lookup: {
								from: 'roles',
								localField: 'role',
								foreignField: '_id',
								as: 'role'
							}
						},
						{
							$unwind: { path: '$role' }
						},
					]
				}
			},
			{
				$unwind: { path: '$employee' }
			},
			{
				$addFields: {
					accountBalance: { $sum: '$employeeDailyBalances.accountBalance' },
					supervisorBalance: { $sum: '$supervisorReports.balance' },
					employeePaymentsAmount: { $sum: '$employeePayments.amount' },
					missingWorkDiscount: {
						$multiply: [
							{ $size: { $filter: { input: '$employeeDailyBalances', as: 'balance', cond: { $eq: ['$$balance.dayDiscount', true] } } } },
							{ $divide: ['$employee.salary', -7] },
						],
					},
					lateDiscount: {
						$multiply: [
							{ $size: { $filter: { input: '$employeeDailyBalances', as: 'balance', cond: { $eq: ['$$balance.lateDiscount', true] } } } },
							-60,
						],
					},

				}
			},
			{
				$addFields: {
					balance: {
						$add: [
							{ $ifNull: ['$supervisorBalance', 0] },
							{ $ifNull: ['$accountBalance', 0] },
							{ $ifNull: ['$missingWorkDiscount', 0] },
							{ $ifNull: ['$lateDiscount', 0] },
						]
					}
				}
			},
		])

		return weeklyBalances || null

	} catch (error) {

		console.log(error)
		throw error
	}
}

export const getSingleEmployeePayroll = async (req, res, next) => {
	const { employeeId } = req.params;
	const { page } = req.query;
	try {
		// Get the employee's payDay
		const payDay = await getEmployeePayDay(employeeId);
		// Calculate week range for the given date and payDay
		const { weekStart, weekEnd } = getWeekRange(new Date(), payDay, page);
		const firstTopDate = getDayRange(weekStart).topDate;
		const lastTopDate = getDayRange(weekEnd).topDate;

		// Use the same aggregation pipeline as fetchEmployeesPayroll, but filter for one employee
		const weeklyBalances = await EmployeeWeeklyBalance.aggregate([
			{
				$match: {
					employee: new Types.ObjectId(employeeId),
					weekStart: new Date(weekStart),
				},
			},
			employeeBranchReportsLookup('employee', weekStart, weekEnd),
			employeeDailyBalancesLookup('employee', weekStart, weekEnd),
			employeeSupervisorReportsLookup('employee', weekStart, weekEnd),
			{
				$lookup: {
					from: 'employeebalanceadjustments',
					localField: 'balanceAdjustments',
					foreignField: '_id',
					as: 'balanceAdjustments',
				},
			},
			{
				$lookup: {
					from: 'employeepayments',
					localField: 'employee',
					foreignField: 'employee',
					as: 'employeePayments',
					pipeline: [
						{ $match: { createdAt: { $gte: new Date(firstTopDate), $lt: new Date(lastTopDate) } } },
						{ $sort: { createdAt: -1 } },
						...employeeAggregate('employee', 'employee'),
						...employeeAggregate('supervisor', 'supervisor'),
						...branchAggregate('branch')
					],
				},
			},
			{
				$lookup: {
					from: 'employees',
					localField: 'employee',
					foreignField: '_id',
					as: 'employee',
					pipeline: [
						{
							$lookup: {
								from: 'roles',
								localField: 'role',
								foreignField: '_id',
								as: 'role',
							},
						},
						{ $unwind: { path: '$role' } },
					],
				},
			},
			{ $unwind: { path: '$employee' } },
			{
				$addFields: {
					accountBalance: { $sum: '$employeeDailyBalances.accountBalance' },
					supervisorBalance: { $sum: '$supervisorReports.balance' },
					employeePaymentsAmount: { $sum: '$employeePayments.amount' },
					missingWorkDiscount: {
						$multiply: [
							{ $size: { $filter: { input: '$employeeDailyBalances', as: 'balance', cond: { $eq: ['$$balance.dayDiscount', true] } } } },
							{ $divide: ['$employee.salary', -7] },
						],
					},
					lateDiscount: {
						$multiply: [
							{ $size: { $filter: { input: '$employeeDailyBalances', as: 'balance', cond: { $eq: ['$$balance.lateDiscount', true] } } } },
							-60,
						],
					},
				},
			},
			{
				$addFields: {
					balance: {
						$add: [
							{ $ifNull: ['$supervisorBalance', 0] },
							{ $ifNull: ['$accountBalance', 0] },
							{ $ifNull: ['$missingWorkDiscount', 0] },
							{ $ifNull: ['$lateDiscount', 0] },
						],
					},
				},
			},
		]);

		res.status(200).json({ employeePayroll: weeklyBalances?.[0] || null, date: weekStart });
	} catch (error) {
		console.log(error);
		next(error);
	}
};

export const deleteDuplicatedEmployeeDailyBalances = async (req, res, next) => {

	try {

		const inserted = await new EmployeeDailyBalance({ employee: '65f4faba45c96ebe9ffb081c', company: '65f50041e995d4e5cb7e1d01', createdAt: '2024-04-16T06:00:00.000+00:00' })



		res.status(200).json(inserted)
	} catch (error) {

		next(error)
	}
}

export const createEmployeeRest = async (req, res, next) => {

	const { _id, employeeId, replacementId, companyId, date } = req.body
	const { bottomDate } = getDayRange(date)

	try {

		const employeeRestData = { employee: employeeId, replacement: replacementId, company: companyId, date: bottomDate }

		if (_id) employeeRestData._id = _id

		const newEmployeeRest = await EmployeeRest.create(employeeRestData)

		if (!newEmployeeRest) next(errorHandler(404, 'No se pudo crear el descanso'))

		res.status(200).json({
			message: 'Descanso creado correctamente',
			data: newEmployeeRest,
			success: true
		})

	} catch (error) {

		next(error)
	}
}

export const getPendingEmployeesRests = async (req, res, next) => {

	const companyId = req.params.companyId
	const { bottomDate } = getDayRange(new Date())


	try {

		const pendingEmployeesRests = await EmployeeRest.aggregate([
			{
				$match: {
					"createdAt": { $gte: new Date(bottomDate) },
					"company": new Types.ObjectId(companyId),
				}
			},
			...employeeAggregate('employee'),
			...employeeAggregate('replacement', 'replacement'),
		])

		if (pendingEmployeesRests.length < 1) {

			next(errorHandler(404, 'No se encontraron descansos pendientes'))

		} else {

			res.status(200).json({ pendingEmployeesRests })
		}

	} catch (error) {

		next(error)
	}
}

export const deleteEmployeeRest = async (req, res, next) => {

	const employeeRestId = req.params.employeeRestId

	try {

		const deletedEmployeeRest = await EmployeeRest.findByIdAndDelete(employeeRestId)

		if (!deletedEmployeeRest) {

			throw new Error("No se encontró el descanso");

		} else {

			res.status(200).json({ deletedEmployeeRest })
		}

	} catch (error) {

		next(error)
	}
}

export const getEmployeesDailyBalances = async (req, res, next) => {

	const date = new Date(req.params.date)
	const companyId = req.params.companyId

	const { bottomDate, topDate } = getDayRange(date)
	const employees = await Employee.find({
		company: companyId,
		active: true

	}).select({ path: '_id' })

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
					employee: { $in: employees.map(employee => employee._id) }
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

					employeesDailyBalances.forEach(async (dailyBalance) => {

						await addDailyBalanceInWeeklyBalance({ dailyBalance })
					})

					res.status(200).json(employeesDailyBalances)
				})
		}

	} catch (error) {

		next(error)

	}
}

export const getEmployeePayment = async (req, res, next) => {
	try {
		const { incomeId } = req.params;
		const employeePayment = await EmployeePayment.findOne({
			income: incomeId
		}).populate('employee').populate('supervisor');
		if (!employeePayment) {
			throw new Error("No se encontró el pago");
		}
		res.status(200).json({
			data: employeePayment,
			message: "Pago encontrado",
			success: true
		});
	} catch (error) {
		next(error);
	}
};

export const newEmployeePaymentQuery = async (req, res, next) => {
	let extraOutgoing = null;
	let income = null;
	let employeePayment = null;

	const { amount, income: incomeId, extraOutgoing: extraOutgoingId, detail, company, branch, employee, supervisor, createdAt, _id } = req.body;

	try {

		if (!amount || !detail || !company || !employee || !supervisor || !createdAt) {
			throw new Error("Faltan datos requeridos");
		}

		const employeeData = await Employee.findById(employee, 'name lastName');
		if (!employeeData) {
			throw new Error("Empleado no encontrado");
		}

		const concept = `${detail} [${employeeData.name} ${employeeData.lastName}]`;

		extraOutgoing = await newExtraOutgoingFunction({ _id: extraOutgoingId, amount, concept, company, employee: supervisor, createdAt, partOfAPayment: true });

		if (!extraOutgoing) {
			throw new Error("No se ha podido crear el gasto fuera de cuenta");
		}

		if (branch) {
			const incomeType = await getIncomeTypeId({ name: 'Efectivo' });
			if (!incomeType) {
				throw new Error("No se encontró el tipo de ingreso");
			}

			income = await newBranchIncomeFunction({ _id: incomeId, amount, company, branch, employee: supervisor, type: String(incomeType._id), createdAt, partOfAPayment: true });
			if (!income) {
				throw new Error("No se pudo crear el efectivo");
			}
		}

		employeePayment = await newEmployeePaymentFunction({ _id, amount, detail, employee, supervisor, company, extraOutgoing: extraOutgoing._id, income: income ? income._id : null, createdAt });
		if (!employeePayment) {
			throw new Error("No se ha podido crear el pago a empleado");
		}

		res.status(200).json({ extraOutgoing, income, employeePayment });

	} catch (error) {
		// Manejo de errores y limpieza
		if (extraOutgoing) {
			await deleteExtraOutgoingFunction(extraOutgoingId);
		}

		if (employeePayment) {
			await EmployeePayment.findByIdAndDelete(employeePayment._id);
		}

		if (income) {
			await deleteIncome(incomeId);
		}

		next(error);
	}
};

export const newEmployeePaymentFunction = async ({ amount, detail, employee, supervisor, company, extraOutgoing, income, createdAt }) => {

	const employeePaymentData = { amount, detail, employee, supervisor, company, extraOutgoing, createdAt }

	if (income) employeePaymentData.income = income

	const newEmployeePayment = await EmployeePayment.create(employeePaymentData)

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

		employeePayments.employeePayments = await EmployeePayment.aggregate([
			{
				$match: {
					"createdAt": { $lt: new Date(topDate), $gte: firstWeekDay },
					"employee": new Types.ObjectId(employeeId)
				}
			},
			{
				$lookup: {
					from: 'incomecollecteds',
					localField: 'income',
					foreignField: '_id',
					as: 'income',
					pipeline: [
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
						}
					]
				}
			},
			{
				$unwind: { path: '$income', preserveNullAndEmptyArrays: true }
			},
			{
				$lookup: {
					from: 'employees',
					foreignField: '_id',
					localField: 'employee',
					as: 'employee'
				}
			},
			{
				$lookup: {
					from: 'employees',
					foreignField: '_id',
					localField: 'supervisor',
					as: 'supervisor'
				}
			},
			{
				$unwind: { path: '$supervisor', preserveNullAndEmptyArrays: true }
			},
			{
				$unwind: { path: '$employee', preserveNullAndEmptyArrays: true }
			},
			{ $sort: { createdAt: -1 } },
			{
				$project: {
					_id: 1,
					detail: 1,
					employee: 1,
					supervisor: 1,
					amount: 1,
					extraOutgoing: 1,
					createdAt: 1,
					income: 1
				}
			}
		])

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

		const employeesPayments = await EmployeePayment.aggregate([
			{
				$match: {
					createdAt: { $gte: new Date(bottomDate), $lt: new Date(topDate) },
					company: new Types.ObjectId(companyId)
				}
			},
			{
				$lookup: {
					from: 'incomecollecteds',
					localField: 'income',
					foreignField: '_id',
					as: 'income',
					pipeline: [
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
						}
					]
				}
			},
			{
				$unwind: { path: '$income', preserveNullAndEmptyArrays: true }
			},
			{
				$lookup: {
					from: 'employees',
					localField: 'employee',
					foreignField: '_id',
					as: 'employee',
					pipeline: [
						{
							$project: {
								password: 0
							}
						}
					]
				},
			},
			{
				$unwind: { path: '$employee', preserveNullAndEmptyArrays: true }
			},
			{
				$lookup: {
					from: 'employees',
					localField: 'supervisor',
					foreignField: '_id',
					as: 'supervisor',
					pipeline: [
						{
							$project: {
								password: 0
							}
						}
					]
				},
			},
			{
				$unwind: { path: '$supervisor', preserveNullAndEmptyArrays: true }
			}
		])

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

		deletedExtraOutgoing = await deleteExtraOutgoingFunction(extraOutgoingId)

		if (incomeId && incomeId != "null") {

			deletedIncome = await deleteIncome(incomeId)
		}

		deletedPayment = await EmployeePayment.findByIdAndDelete(paymentId)
		if (!deletedPayment) throw new Error("No se pudo eliminar el pago a empleado");

		res.status(200).json('Pago eliminado, verifique que el gasto y el efectivo del pago se hayan eliminado correctamente.')

	} catch (error) {

		if (deletedExtraOutgoing) {

			await newExtraOutgoingFunction(deletedExtraOutgoing)
		}

		if (deletedIncome) {

			await newBranchIncomeFunction(deletedIncome)
		}

		if (deletedPayment) {

			await EmployeePayment.create(deletedPayment)
		}

		next(error)
	}
}

export const getEmployeePayroll = async (req, res, next) => {

	const companyId = req.params.companyId

	try {

		const employeesPayroll = await fetchEmployeesPayroll({ companyId, date: req.params.date })
		// await refactorEmployeesWeeklyBalances({companyId})

		if (employeesPayroll.length > 0) {

			res.status(200).json({ employeesPayroll })

		} else {

			res.status(200).json('Not data found')
		}

	} catch (error) {

		next(error)
	}
}

export const createPenalty = async (req, res, next) => {
	const { companyId, name, amount, weeklyBalanceField } = req.body

	try {
		const newPenalty = await CompanyPenalties.create({ name, amount, company: companyId, weeklyBalanceField })

		if (!newPenalty) throw new Error("No se pudo crear la penalización");

		res.status(200).json({ newPenalty })
	} catch (error) {

		console.log(error)
		next(error)
	}
}

export const updateEmployeeDailyBalance = async (req, res, next) => {

	const body = req.body
	const balanceId = req.params.balanceId

	try {
		const updatedDailyBalance = await EmployeeDailyBalance.findByIdAndUpdate(balanceId, body, { new: true })
		const penalty = await CompanyPenalties.findOne({ penalty: Object.keys(body)[0] })

		if (penalty) {

			await Employee.findByIdAndUpdate(updatedDailyBalance.employee, { balance: Object.keys(body)[0] ? penalty.amount : -penalty.amount }, { new: true })
		}
		if (!updatedDailyBalance) throw new Error("No se pudo actualizar el balance diario del empleado");

		if (updatedDailyBalance) {

			console.log(updatedDailyBalance)

			res.status(200).json('Balance updated')

		} else {

			next(errorHandler(404, 'An error ocurred'))
		}

	} catch (error) {

		if (updatedDailyBalance) {
			await EmployeeDailyBalance.findByIdAndUpdate(balanceId, { [Object.keys(body)[0]]: !updatedDailyBalance[Object.keys(body)[0]] })
		}

		next(error)
	}
}

export const verifySupervisorCash = async (req, res, next) => {

	const { supervisorReportId, amount, date } = req.body

	try {

		const updatedSupervisorReport = await verifySupervisorMoney({ amount, typeField: "verifiedCash", date, supervisorReportId })

		res.status(200).json({ updatedSupervisorReport })

	} catch (error) {


		next(error)
	}
}

export const verifySupervisorDeposits = async (req, res, next) => {

	const { supervisorReportId, amount, date } = req.body

	try {

		const updatedSupervisorReport = await verifySupervisorMoney({ amount, typeField: "verifiedDeposits", date, supervisorReportId })

		res.status(200).json({ updatedSupervisorReport })

	} catch (error) {

		next(error)
	}
}

export const fetchOrCreateSupervisorReport = async ({ supervisorId, companyId, date, noCreate = false }) => {
	try {

		let supervisorReport = await fetchSupervisorReportInfo({ supervisorId, date })

		if (!supervisorReport && !noCreate) {

			supervisorReport = await createSupervisorReport({ supervisorId, companyId, date })
		}

		if (!supervisorReport)
			throw new Error("No se encontró ni se pudo crear el reporte de supervisor");

		return supervisorReport

	} catch (error) {
		throw error
	}
}

export const createSupervisorReport = async ({ supervisorId, companyId, date }) => {

	try {

		const { bottomDate } = getDayRange(date)

		return await SupervisorReport.create({ supervisor: supervisorId, company: companyId, createdAt: bottomDate })
	} catch (error) {

		console.error("Error al crear el reporte del supervisor:", error)
		throw new Error("Error al crear el reporte del supervisor")
	}
}

export const verifySupervisorMoney = async ({ amount, typeField, date, supervisorReportId }) => {

	let supervisorReport = null
	let updatedSupervisorReport = null
	let updatedDailyBalance = null
	let dailyBalance = null

	const { bottomDate, topDate } = getDayRange(date)

	try {

		if (!['verifiedCash', "verifiedDeposits"].includes(typeField)) throw new Error(`Campo ${typeField} inválido`)

		supervisorReport = await fetchSupervisorReport({ reportId: supervisorReportId })

		if (!supervisorReport) throw new Error("No se encontró el reporte de supervisor")

		updatedSupervisorReport = await SupervisorReport.findByIdAndUpdate(supervisorReport._id, {
			[typeField]: amount,
			$inc: { balance: (amount - supervisorReport[typeField]) }
		}, { new: true })

		if (!updatedSupervisorReport) throw new Error("No se editó el reporte de supervisor");

		dailyBalance = await EmployeeDailyBalance.findOne({
			createdAt: { $lt: topDate, $gte: bottomDate },
			employee: new Types.ObjectId(supervisorReport.supervisor)
		})

		if (!dailyBalance) {
			dailyBalance = await createDailyBalance({ companyId: supervisorReport.company, employeeId: supervisorReport.supervisor, date })
			if (!dailyBalance) throw new Error("No se pudo crear ni obtener el balance del empleado");
		}

		updatedDailyBalance = await EmployeeDailyBalance.findByIdAndUpdate(dailyBalance._id, {
			supervisorBalance: updatedSupervisorReport.balance
		}, { new: true })

		if (!updatedDailyBalance) throw new Error("No se editó el balance del supervisor");

		await Employee.findByIdAndUpdate(supervisorReport.supervisor, {
			$inc: { balance: (amount - supervisorReport[typeField]) }
		}
			, { new: true })

		return updatedSupervisorReport

	} catch (error) {

		if (!updatedDailyBalance && updatedSupervisorReport
			&& (SupervisorReport.balance != updatedSupervisorReport.balance
				|| supervisorReport[typeField] != supervisorReport[typeField])) {

			await SupervisorReport.findByIdAndUpdate(supervisorReport._id, { [typeField]: supervisorReport[typeField], balance: supervisorReport.balance })
		}
		console.log(error)
		throw error
	}
}

export const pushOrPullSupervisorReportRecord = async ({
	supervisorId,
	date,
	record,
	affectsBalancePositively,
	operation,
	arrayField,
	amountField,
	noCreate = false
}) => {

	try {

		if (!['$addToSet', '$pull'].includes(operation)) throw new Error("Parámetros inválidos, se espera '$addToSet' o '$pull'")
		if (!supervisorId || !date || !record || !arrayField || !amountField) throw new Error("Parámetros requeridos faltantes en pushOrPullSupervisorReportRecord")
		const supervisorReport = await fetchOrCreateSupervisorReport({ supervisorId, companyId: record.company, date, noCreate });

		if (!supervisorReport) throw new Error("No se encontró ni se pudo crear el reporte de supervisor");

		const adjustedBalanceInc = affectsBalancePositively ? record.amount : -record.amount
		const balanceAdjustment = operation === '$addToSet' ? adjustedBalanceInc : -adjustedBalanceInc
		const amountAdjustment = operation === '$addToSet' ? record.amount : -record.amount

		const updateInstructions = {
			[operation]: { [arrayField]: record._id },
			$inc: { [amountField]: amountAdjustment, balance: balanceAdjustment }
		}

		return await updateReportsAndBalancesAccounts({
			supervisorReport,
			updateInstructions,
			updatedFields: [arrayField, amountField]
		})

	} catch (error) {

		console.log(error)
		throw error
	}
}

export const updateReportsAndBalancesAccounts = async ({ supervisorReport, updateInstructions = {}, updatedFields }) => {

	let updatedSupervisorReport = null
	let updatedEmployeeDailyBalance = null

	try {

		updatedSupervisorReport = await SupervisorReport.findByIdAndUpdate(supervisorReport._id, { ...updateInstructions }, { new: true })

		if (!updatedSupervisorReport) throw new Error("No se pudo modificar el reporte");

		if (updatedSupervisorReport.employee) {

			updatedEmployeeDailyBalance = await updateEmployeeDailyBalances({ supervisorReport: updatedSupervisorReport })

			if (!updatedEmployeeDailyBalance) throw new Error("No se pudo actualizar la cuenta del empleado");
		}

		return updatedSupervisorReport

	} catch (error) {

		const hasDifferences = updatedFields.some(field => updatedSupervisorReport[field] !== supervisorReport[field])

		if (!updatedEmployeeDailyBalance && updatedSupervisorReport
			&& hasDifferences) {

			await SupervisorReport.findByIdAndUpdate(supervisorReport._id, supervisorReport)
		}

		throw error
	}
}

export const updateEmployeeDailyBalances = async ({ branchReport = null, supervisorReport = null, changedEmployee = false }) => {

	try {

		return branchReport ? await updateAccountBalance(branchReport, changedEmployee) : await updateSupervisorBalance(supervisorReport)

	} catch (error) {

		console.log("Error al actualizar el balance del empleado", error)
		throw new Error("No se pudo actualizar el balance del empleado");
	}
}

export const updateSupervisorBalance = async (supervisorReport) => {

	let updatedDailyBalance = null
	let dailyBalance = null
	let employee = null
	const employeeId = supervisorReport.supervisor?._id ?? supervisorReport.supervisor
	if (!employeeId) throw new Error("No hay empleado en el reporte");

	try {

		const employeePayday = await getEmployeePayDay(employeeId)
		const { currentWeekRange, isCurrentWeek, isInmediatePrevWeek } = isCurrentOrInmediateWeek(branchReport.createdAt, employeePayday)
		let dailyBalance = await fetchOrCreateDailyBalance({ companyId: supervisorReport.company, employeeId: supervisorReport.supervisor, date: supervisorReport.createdAt })

		if (!dailyBalance) throw new Error("No se encontró el balance del empleado");

		const currentBalance = dailyBalance.accountBalance
		const reportBalance = branchReport.balance
		const adjustmentBalance = changedEmployee ? -currentBalance : reportBalance - currentBalance

		updatedDailyBalance = await EmployeeDailyBalance.findByIdAndUpdate(dailyBalance._id, { supervisorBalance: supervisorReport.balance }, { new: true })

		if (!updatedDailyBalance) throw new Error("No se actualizó el balance del empleado")

		if (adjustmentBalance === 0)
			return dailyBalance

		console.log(employee, adjustmentBalance)

		employee = await Employee.findByIdAndUpdate(employeeId, {
			$inc: { balance: adjustmentBalance }
		}, { new: true })

		if (!(isCurrentWeek || isInmediatePrevWeek)) {
			await adjustBalanceSupervisorReport(supervisorReport, adjustmentBalance, currentWeekRange.startDate)
		}

		return updatedDailyBalance

	} catch (error) {

		if (employee) {
			await Employee.findByIdAndUpdate(employeeId, {
				$inc: { balance: -employee.balance }
			}, { new: false })
		}

		if (updatedDailyBalance) {

			await EmployeeDailyBalance.findByIdAndUpdate(dailyBalance._id, { supervisorBalance: dailyBalance.supervisorBalance })
		}
		console.error("Error al actualizar el balance del supervisor", error)
		throw new Error("No se pudo actualizar el balance del supervisor");
	}
}

export const fetchOrCreateDailyBalance = async ({ companyId, employeeId, date }) => {

	try {

		let dailyBalance = await fetchDailyBalance({ companyId, employeeId, date })

		if (!dailyBalance) {

			dailyBalance = await createDailyBalance({ companyId, employeeId, date })
		}

		if (!dailyBalance)
			throw new Error("No se pudo crear el balance del empleado")

		return dailyBalance

	} catch (error) {

		console.log("Error en fetchOrCreateDailyBalance", error)
		throw new Error("No se pudo encontrar o crear el balance del empleado");

	}
}

export const updateAccountBalance = async (branchReport, changedEmployee) => {

	let updatedDailyBalance = null
	let dailyBalance = null
	let employee = null
	const employeeId = branchReport.employee?._id ?? branchReport.employee
	if (!employeeId) throw new Error("No hay empleado en el reporte");

	try {
		const employeePayday = await getEmployeePayDay(employeeId)
		const { currentWeekRange, isCurrentWeek, isInmediatePrevWeek } = isCurrentOrInmediateWeek(branchReport.createdAt, employeePayday)
		dailyBalance = await fetchOrCreateDailyBalance({ companyId: branchReport.company, employeeId: employeeId, date: branchReport.createdAt })

		if (!dailyBalance) throw new Error("No se encontró el balance del empleado");

		const currentBalance = dailyBalance.accountBalance
		const reportBalance = branchReport.balance
		const adjustmentBalance = changedEmployee ? -currentBalance : reportBalance - currentBalance

		updatedDailyBalance = await EmployeeDailyBalance.findByIdAndUpdate(dailyBalance._id, { accountBalance: changedEmployee ? 0 : branchReport.balance }, { new: true })

		if (!updatedDailyBalance) throw new Error("No se actualizó el balance del empleado")

		if (adjustmentBalance === 0)
			return dailyBalance

		employee = await Employee.findByIdAndUpdate(employeeId, {
			$inc: { balance: adjustmentBalance }
		}, { new: true })

		if (!(isCurrentWeek || isInmediatePrevWeek)) {

			await adjustBalanceBranchReport(branchReport, adjustmentBalance, currentWeekRange.startDate)
		}

		return updatedDailyBalance

	} catch (error) {

		if (employee) {
			await Employee.findByIdAndUpdate(employeeId, {
				$inc: { balance: -employee.balance }
			}, { new: false })
		}

		if (updatedDailyBalance) {

			await EmployeeDailyBalance.findByIdAndUpdate(dailyBalance._id, { accountBalance: dailyBalance.accountBalance })
		}

		console.log("Error al actualizar el balance del empleado", error)
		throw new Error("No se pudo actualizar el balance del empleado");
	}
}

const adjustBalanceSupervisorReport = async (supervisorReport, adjustmentBalance, currentWeekStart) => {

	let employeeWeeklyBalance = null
	let updatedEmployeeWeeklyBalance = null
	const defaultSupervisorReport = null
	const updatedSupervisorReport = null
	const adjBalanceObj = null
	const employeeId = supervisorReport.supervisor?._id ?? supervisorReport.supervisor

	try {

		employeeWeeklyBalance = await fetchEmployeeWeeklyBalanceByDailyBalance(employeeId, currentWeekStart)

		if (!employeeWeeklyBalance) throw new Error("No se encontró el balance semanal del empleado");

		const adjBalanceData = {
			employee: employeeId,
			date: supervisorReport.createdAt,
			concept: `${formatDate(new Date()).split('T')[0]}: modificación en reporte de supervisor el día: ${formatDate(supervisorReport?.createdAt).split('T')[0]} por ${adjustmentBalance > 0 ? '+' : ''} ${toCurrency(adjustmentBalance)}`,
			amount: adjustmentBalance,
		}

		adjBalanceObj = await createAdjustmentBalance(adjBalanceData)

		if (!adjBalanceObj) throw new Error("No se pudo crear el ajuste de balance");

		defaultSupervisorReport = await SupervisorReport.findById(supervisorReport._id)

		updatedSupervisorReport = SupervisorReport.findByIdAndUpdate(supervisorReport._id, {
			$push: { adjustmentBalances: adjBalanceObj._id }
		}, { new: true })

		updatedEmployeeWeeklyBalance = await EmployeeWeeklyBalance.findByIdAndUpdate(employeeWeeklyBalance._id, {
			$push: { adjustmentBalances: adjBalanceObj._id },
			$inc: { balance: adjustmentBalance }
		}, { new: true })

		if (!updatedEmployeeWeeklyBalance) throw new Error("No se actualizó el balance semanal del empleado");

	} catch (error) {

		if (updatedEmployeeWeeklyBalance) {
			await EmployeeWeeklyBalance.findByIdAndUpdate(updatedEmployeeWeeklyBalance._id, employeeWeeklyBalance
				, { new: false })
		}

		if (updatedSupervisorReport) {
			await SupervisorReport.findByIdAndUpdate(updatedSupervisorReport._id, defaultSupervisorReport, { new: false })
		}

		console.error(error)
		throw new Error("Error al crear el ajuste de balance");
	}
}

const adjustBalanceBranchReport = async (branchReport, adjustmentBalance, currentWeekStart) => {

	let employeeWeeklyBalance = null
	let updatedEmployeeWeeklyBalance = null
	const defaultBranchReport = null
	const updatedBranchReport = null
	const adjBalanceObj = null
	const employeeId = branchReport.employee?._id ?? branchReport.employee

	try {

		employeeWeeklyBalance = await fetchEmployeeWeeklyBalanceByDailyBalance(employeeId, currentWeekStart)

		if (!employeeWeeklyBalance) throw new Error("No se encontró el balance semanal del empleado");

		const adjBalanceData = {
			employee: employeeId,
			date: branchReport.createdAt,
			concept: `${formatDate(new Date()).split('T')[0]}: modificación en reporte de pollería el día: ${formatDate(branchReport?.createdAt).split('T')[0]} por ${adjustmentBalance > 0 ? '+' : ''} ${toCurrency(adjustmentBalance)}`,
			amount: adjustmentBalance,
		}

		adjBalanceObj = await createAdjustmentBalance(adjBalanceData)

		if (!adjBalanceObj) throw new Error("No se pudo crear el ajuste de balance");

		defaultBranchReport = await BranchReport.findById(branchReport._id)

		updatedBranchReport = BranchReport.findByIdAndUpdate(branchReport._id, {
			$push: { adjustmentBalances: adjBalanceObj._id }
		}, { new: true })

		updatedEmployeeWeeklyBalance = await EmployeeWeeklyBalance.findByIdAndUpdate(employeeWeeklyBalance._id, {
			$push: { adjustmentBalances: adjBalanceObj._id },
			$inc: { balance: adjustmentBalance }
		}, { new: true })

		if (!updatedEmployeeWeeklyBalance) throw new Error("No se actualizó el balance semanal del empleado");

	} catch (error) {

		if (updatedEmployeeWeeklyBalance) {
			await EmployeeWeeklyBalance.findByIdAndUpdate(updatedEmployeeWeeklyBalance._id, employeeWeeklyBalance
				, { new: false })
		}

		if (updatedBranchReport) {
			await BranchReport.findByIdAndUpdate(updatedBranchReport._id, defaultBranchReport, { new: false })
		}

		console.error(error)
		throw new Error("Error al crear el ajuste de balance");
	}
}

const createAdjustmentBalance = async ({ amount, date, concept, employee }) => {

	try {

		return await EmployeeBalanceAdjustment.create({ amount, date, concept, employee })

	} catch (error) {
		console.log("Error al crear el ajuste de balance de semana actual", error)
		throw new Error("No se pudo crear el ajuste de balance de semana actual");
	}
}

export const fetchDailyBalance = async ({ companyId, employeeId, date }) => {

	let dailyBalance = null

	try {

		const { bottomDate, topDate } = getDayRange(date)

		dailyBalance = await EmployeeDailyBalance.findOne({
			company: companyId,
			employee: employeeId,
			createdAt: { $lt: topDate, $gte: bottomDate }
		})

		if (!dailyBalance) {
			dailyBalance = await createDailyBalance({ companyId, employeeId, date })
		}

		if (!dailyBalance) throw new Error("No se pudo crear el balance del empleado");

		if (!dailyBalance.weeklyBalance) {

			await addDailyBalanceInWeeklyBalance({ dailyBalance: dailyBalance })
		}

		return dailyBalance

	} catch (error) {

		console.log("Error al obtener el balance del empleado", error)
		throw new Error("No se encontró el balance del empleado");

	}
}

export const createDailyBalance = async ({ companyId, employeeId, date }) => {

	try {
		const { bottomDate } = getDayRange(date)
		return await EmployeeDailyBalance.create({ company: companyId, employee: employeeId, createdAt: bottomDate })

	} catch (error) {

		console.log('Error al crear el balance del empleado', error)
		throw new Error("No se pudo crear el balance del empleado")
	}
}

export const updateDailyBalancesBalance = async (branchReport, changedEmployee = false) => {

	try {
		let dailyBalance = await fetchOrCreateDailyBalance({ companyId: branchReport.company, employeeId: branchReport.employee, date: branchReport.createdAt })

		const updatedDailyBalance = await EmployeeDailyBalance.findByIdAndUpdate(dailyBalance._id, { accountBalance: changedEmployee ? 0 : branchReport.balance }, { new: true })

		if (!updatedDailyBalance) throw new Error("No se actualizó el balance del empleado")

		return updatedDailyBalance

	} catch (error) {

		console.log("Error al actualizar el balance del empleado", error)
		throw new Error("No se pudo actualizar el balance del empleado");
	}
}

export const createNewDailyBalance = async ({ employeeId, companyId }) => {

	try {

		const { bottomDate } = getDayRange(new Date())

		const dailyBalanceExists = await EmployeeDailyBalance.findOne({
			employee: employeeId,
			createdAt: bottomDate
		})

		if (dailyBalanceExists) return

		return await EmployeeDailyBalance.create({ employee: employeeId, createdAt: bottomDate, company: companyId })

	} catch (error) {

		console.log(error)
		throw error
	}
}

export const changeEmployeeActiveStatus = async (req, res, next) => {

	const { newStatus } = req.body
	const employeeId = req.params.employeeId

	let updatedEmployee = null

	try {

		updatedEmployee = await Employee.findByIdAndUpdate(employeeId, { active: newStatus }, { new: true }).populate({ path: 'role' })

		if (!updatedEmployee) throw new Error("No se actualizó el estado del empleado");


		if (updatedEmployee.active === true) {

			const dailyBalance = await fetchDailyBalance({ companyId: updatedEmployee.company, employeeId, date: new Date() })

			if (!dailyBalance) {

				const newEmployeeDailyBalance = await createNewDailyBalance({ employeeId, companyId: updatedEmployee.company })

				if (!newEmployeeDailyBalance) throw new Error("No se pudo crear el balance del empleado");
			}
		}

		res.status(200).json({ updatedEmployee })

	} catch (error) {

		if (updatedEmployee) {

			await Employee.findByIdAndUpdate(employeeId, {
				active: !newStatus
			})
		}

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

export const fetchSupervisorReportInfo = async ({ supervisorId = null, date = null, reportId = null }) => {

	const { bottomDate, topDate } = date ? getDayRange(date) : { bottomDate: null, topDate: null }

	const match = reportId ? { _id: new Types.ObjectId(reportId) } : { supervisor: new Types.ObjectId(supervisorId), createdAt: { $lt: new Date(topDate), $gte: new Date(bottomDate) } };

	try {
		const supervisorReport = await SupervisorReport.aggregate([
			{
				$match: match,
			},
			{
				$lookup: {
					from: 'incomecollecteds',
					localField: 'incomesArray',
					foreignField: '_id',
					as: 'incomesArray',
					pipeline: [
						branchLookup,
						unwindBranch,
						employeeLookup,
						unwindEmployee,
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
						{ $unwind: { path: '$employeePayment', preserveNullAndEmptyArrays: true } },
						{
							$lookup: {
								from: 'incometypes',
								localField: 'type',
								foreignField: '_id',
								as: 'type',
							},
						},
						{
							$unwind: {
								path: '$type',
								preserveNullAndEmptyArrays: true,
							},
						},
					],
				},
			},
			{
				$lookup: {
					from: 'outgoings',
					localField: 'extraOutgoingsArray',
					foreignField: '_id',
					as: 'extraOutgoingsArray',
					pipeline: [
						employeeLookup,
						unwindEmployee
					],
				},
			},
			{
				$lookup: {
					from: 'employees',
					localField: 'supervisor',
					foreignField: '_id',
					as: 'supervisor',
					pipeline: [
						{
							$project: {
								password: 0
							}
						}
					]
				},
			},
			{
				$unwind: {
					path: '$supervisor',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$project: {
					company: 1,
					balance: 1,
					supervisor: 1,
					incomesArray: 1,
					incomes: 1,
					extraOutgoingsArray: 1,
					extraOutgoings: 1,
					verifiedCash: 1,
					verifiedDeposits: 1,
					createdAt: 1,
				},
			},
		]);

		return supervisorReport.length > 0 ? supervisorReport[0] : null;
	} catch (error) {
		throw error;
	}
};

export const fetchSupervisorReport = async ({ reportId = null, supervisorId = null, date = null }) => {

	try {

		const { bottomDate, topDate } = date ? getDayRange(date) : { bottomDate: null, topDate: null }

		const match = reportId ? { _id: new Types.ObjectId(reportId) } : { supervisor: new Types.ObjectId(supervisorId), createdAt: { $gte: new Date(bottomDate), $lt: new Date(topDate) } }

		return await SupervisorReport.findOne(match)

	} catch (error) {

		throw error
	}
}