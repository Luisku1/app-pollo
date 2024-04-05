import Price from '../models/accounts/price.model.js';
import Branch from '../models/branch.model.js'
import { errorHandler } from '../utils/error.js'

export const newBranch = async (req, res, next) => {

	const { branch, phoneNumber, location, p, rentAmount, zone, rentDay, company, position } = req.body
  const tzoffset = (new Date(Date.now())).getTimezoneOffset() * 60000; //offset in milliseconds
  const functionalDate = new Date(Date.now() - tzoffset)

	const newBranch = new Branch({ branch, phoneNumber, location, p, rentAmount, zone, rentDay, company, position, createdAt: functionalDate })

	try {

		await newBranch.save()
		res.status(201).json({branch: newBranch})

	} catch (error) {

		next(error)
	}
}

export const getBranches = async (req, res, next) => {

	const companyId = req.params.companyId

	try {

		const branches = await Branch.find({company: companyId}).sort({position: 1})

		res.status(200).json({branches: branches})

	} catch (error) {

		next(error)
	}
}

export const getBranchesLastPosition = async (req, res, next) => {

	try {

		const branchLastPosition = await Branch.find({}).sort({position: -1}).limit(1).select('position')

		if(branchLastPosition) {

			res.status(200).json({branchLastPosition: branchLastPosition[0]})

		} else {

			next(errorHandler(404, 'Error'))
		}

	} catch (error) {

		next(error)

	}
}

export const deleteBranch = async (req, res, next) => {

	const branchId = req.params.branchId

	try {

		const deletedPrices = await  Price.deleteMany({branch: branchId})
		const deleted = await Branch.deleteOne({_id: branchId})

		if(deleted.acknowledged && deletedPrices.acknowledged) {

			res.status(200).json('Branch deleted successfully')

		} else {

			next(errorHandler(404, 'Something went wrong'))
		}

	} catch (error) {

		next(error)
	}
}