import { Types } from 'mongoose';
import Price from '../models/accounts/price.model.js';
import Branch from '../models/branch.model.js'
import { errorHandler } from '../utils/error.js'
import { getMonthRange } from '../utils/formatDate.js';

export const newBranch = async (req, res, next) => {

	const { branch, phoneNumber, location, p, rentAmount, zone, rentDay, company, position } = req.body
	const date = new Date().toISOString()

	const newBranch = new Branch({ branch, phoneNumber, location, p, rentAmount, zone, rentDay, company, position, createdAt: date })

	try {

		await newBranch.save()
		res.status(201).json({ branch: newBranch })

	} catch (error) {

		next(error)
	}
}

export const getBranches = async (req, res, next) => {

	const companyId = req.params.companyId

	try {

		const branches = await Branch.find({ company: companyId }).sort({ position: 1 })

		res.status(200).json({ branches: branches })

	} catch (error) {

		next(error)
	}
}

export const getBranchesLastPosition = async (req, res, next) => {

	const companyId = req.params.companyId

	try {

		const branchLastPosition = await Branch.findOne({ company: companyId }).sort({ position: -1 }).select('position')

		if (branchLastPosition) {

			res.status(200).json({ branchPosition: branchLastPosition.position + 1 })

		} else {

			res.status(200).json({branchPosition: 1})
		}

	} catch (error) {

		next(error)

	}
}

export const getMonthBranchesIncomesQuery = async (req, res, next) => {

	const date = new Date(req.params.date)
	const companyId = req.params.companyId

	try {

		const branchesIncomes = await getMonthBranchesIncomes(date, companyId)

		res.status(200).json(branchesIncomes)

	} catch (error) {

		next(error)
	}
}

export const getMonthBranchesIncomes = async (date, companyId) => {

	const { bottomDate, topDate } = getMonthRange(date)

	try {

		const branchesIncomes = await Branch.aggregate([

			{
				$match: {
					"company": new Types.ObjectId(companyId)
				}
			},

			{
				$sort: {
					'position': 1
				}
			},

			{
				$lookup: {

					from: 'branchreports',
					localField: '_id',
					foreignField: 'branch',
					as: 'branchReports',
					pipeline: [
						// {$match: {createdAt: {$gte: bottomDate}}}
						{ $sort: { createdAt: 1 } }
					]
				}
			},

			// {
			// 	$unwind: {

			// 		path: '$incomes'
			// 	}
			// },

			// {
			// 	$group: {
			// 		_id: {
			// 			branchId: '$_id'
			// 		}
			// 	}
			// }

			{
				$project: {
					_id: 1,
					branch: 1,
					branchReports: 1
				}
			}


		])

		return branchesIncomes

	} catch (error) {

		throw error
	}

}

export const deleteBranch = async (req, res, next) => {

	const branchId = req.params.branchId

	try {

		const deletedPrices = await Price.deleteMany({ branch: branchId })
		const deleted = await Branch.deleteOne({ _id: branchId })

		if (deleted.acknowledged && deletedPrices.acknowledged) {

			res.status(200).json('Branch deleted successfully')

		} else {

			next(errorHandler(404, 'Something went wrong'))
		}

	} catch (error) {

		next(error)
	}
}