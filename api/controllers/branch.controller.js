import { Types } from 'mongoose';
import Price from '../models/accounts/price.model.js';
import Branch from '../models/branch.model.js'
import { errorHandler } from '../utils/error.js'
import BranchReport from '../models/accounts/branch.report.model.js';
import { dateFromYYYYMMDD } from '../../common/dateOps.js';

export const branchAggregate = (localField = 'branch') => {
	return [
		{
			$lookup: {
				from: 'branches',
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

export const changeBranchrResidualPricesUse = async (req, res, next) => {
	const branchId = req.body.branchId
	try {
		const branch = await Branch.findById(branchId)
		if (!branch) {
			return next(errorHandler(404, 'Branch not found'))
		}
		branch.residualPrices = !branch.residualPrices
		await branch.save()
		res.status(200).json({ success: true, message: 'Branch prices use updated successfully', data: branch.residualPrices })
	} catch (error) {
		console.error('Error updating branch prices use:', error)
		next(error)
	}
}

export const newBranch = async (req, res, next) => {

	const { branch, phoneNumber, location, p, rentAmount, zone, rentDay, company, position } = req.body
	const date = new Date().toISOString()

	try {

		const newBranch = await Branch.create({ branch, phoneNumber, location, p, rentAmount, zone, rentDay, company, position, createdAt: date })

		// const pricesDate = await setInitialBranchPrices(newBranch._id, company)

		// newBranch

		if (!newBranch) throw new Error('No se pudo crear la sucursal')

		res.status(201).json({ branch: newBranch })

	} catch (error) {

		next(error)
	}
}

export const updateBranch = async (req, res, next) => {

	const branchId = req.params.branchId
	const { branch, phoneNumber, location, p, rentAmount, zone, rentDay, company, position } = req.body

	try {

		const updatedBranch = await Branch.findByIdAndUpdate(branchId, { branch, phoneNumber, location, p, rentAmount, zone, rentDay, company, position }, { new: true })

		if (updatedBranch) {

			res.status(200).json({ branch: updatedBranch })

		} else {

			next(errorHandler(404, 'Branch not found'))
		}

	} catch (error) {

		next(error)
	}
}

export const getBranch = async (req, res, next) => {

	const branchId = req.params.branchId

	try {

		const branch = await Branch.findById(branchId)

		if (branch) {

			res.status(200).json(branch)

		} else {

			next(errorHandler(404, 'Branch not found'))
		}


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

			res.status(200).json({ branchPosition: 1 })
		}

	} catch (error) {

		next(error)

	}
}

export const getMonthBranchesIncomesQuery = async (req, res, next) => {

	const date = dateFromYYYYMMDD(req.params.date)
	const companyId = req.params.companyId

	try {

		const branchesIncomes = await getMonthBranchesIncomes(date, companyId)

		res.status(200).json(branchesIncomes)

	} catch (error) {

		next(error)
	}
}

export const getMonthBranchesIncomes = async (date, companyId) => {
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

export const getBranchSalesAverage = async (req, res, next) => {

	const branchId = req.params.branchId
	const date = new Date()

	date.setDate(date.getDate() - 7)

	try {


		const branchAvg = await BranchReport.aggregate([

			{
				$match: {
					"branch": new Types.ObjectId(branchId),
					"createdAt": { $gte: date }
				}
			},
			{
				$project: {
					outgoingsAndIncomes: { $sum: ['$outgoings', '$incomes'] }
				}
			},
			{
				$group: {
					_id: branchId,
					average: { $avg: '$outgoingsAndIncomes' }
				}
			}
		])

		if (branchAvg.length > 0) {

			res.status(201).json({ branchAvg: branchAvg[0].average })

		} else {

			next(errorHandler(404, 'No data found'))
		}

	} catch (error) {

		next(error)
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