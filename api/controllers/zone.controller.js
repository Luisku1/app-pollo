import Zone from '../models/zone.model.js'

export const newZone = async (req, res, next) => {

	const name = req.body.name

	const newZone = new Zone({ name })

	try {

		await newZone.save()
		res.status(201).json('Zone created successfully')

	} catch (error) {

		next(error)
	}
}

export const getZones = async (req, res, next) => {

	const company = req.params.companyId

	try {

		const zones = await Zone.find({ company: company })

		res.status(200).json({ zones: zones })

	} catch (error) {

		next(error)
	}
}