import EmployeeDailyBalance from "../models/employees/employee.daily.balance.js"
import Employee from "../models/employees/employee.model.js"
import { errorHandler } from "../utils/error.js"

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

export const getEmployeesDailyBalances = async (req, res, next) => {

	const date = new Date(req.params.date)
	const companyId = req.params.companyId
	const tzoffset = (new Date(req.params.date)).getTimezoneOffset() * 60000; //offset in milliseconds
	const bottomRange = new Date(date - tzoffset)
	const topRange = new Date(date - tzoffset)

	topRange.setDate(topRange.getDate() + 1)

	try {

		let employeesDailyBalances = await EmployeeDailyBalance.find({

			$and: [
				{
          createdAt: { $gte: bottomRange.toISOString().slice(0, 10) }
        },
        {
          createdAt: { $lt: topRange.toISOString().slice(0, 10) }
        },
        {
          company: companyId
        }
			]
		}).populate({path: 'employee', select: 'name lastName'})

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
					createdAt: bottomRange
				}

				bulkOps.push({"insertOne": {'document': document}})
			})

			EmployeeDailyBalance.bulkWrite(bulkOps)
			.then(result => {

				employeesDailyBalances = Employee.find({_id: {$in: result.insertedIds}})
				res.status(200).json({employeesDailyBalances: result})
			})
		}

	} catch (error) {

		next(error)

	}
}

export const updateEmployeeDailyBalance = async (req, res, next) => {

	const body = req.body
	const balanceId = req.params.balanceId

	try {

		const updated = await EmployeeDailyBalance.updateOne({_id: balanceId}, body)

		if(updated.acknowledged) {

			res.status(200).json('Balance updated')

		} else {

			next(errorHandler(404, 'An error ocurred'))
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