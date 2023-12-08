import Employee from "../models/employees/employee.model.js"

export const getEmployees = async (req, res, next) => {

	try {

		const companyId = req.params.id
		const employees = await Employee.find({ company: companyId })

		res.status(200)
			.json({ employees: employees })


	} catch (error) {

		next(error)
	}
}