import Provider from "../models/providers/provider.model.js"

export const newProvider = async (req, res, next) => {

  const {name, phoneNumber, location, company} = req.body

  try {

    const newProvider = Provider({name, phoneNumber, location, company})
    await newProvider.save()

    res.status(200).json('New provider created successfully')

  } catch (error) {

    next(error)
  }
}