import Branch from '../models/branch.model.js'

export const newBranch = async (req, res, next) => {

	const { branch, phoneNumber, location, p, rentAmount, zone, rentDay, company } = req.body

	const newBranch = new Branch({ branch, phoneNumber, location, p, rentAmount, zone, rentDay, company })

	try {

		await newBranch.save()
		res.status(201).json('Branch created successfully')

	} catch (error) {

		next(error)
	}
}

export const getBranches = async (req, res, next) => {

	const companyId = req.params.id

	try {

		const branches = await Branch.find({company: companyId})

		res.status(200).json({branches: branches})

	} catch (error) {

		next(error)
	}
}