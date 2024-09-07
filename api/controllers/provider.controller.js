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

export const newProviderPurchase = async (req, res, next) => {

  const { weight, price, company, supervisor, product, createdAt } = req.body
  const amount = weight * price

  try {

    // const newProviderPurchase =

  } catch (error) {

  }
}