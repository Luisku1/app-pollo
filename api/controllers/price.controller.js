import Price from "../models/accounts/price.model.js";

export const newPrice = async (req, res, next) => {

  const {price, product, branch} = req.body

  const newPrice = new Price({price, product, branch})

  try {

    await newPrice.save()
    res.status(200).json('New price created')

  } catch (error) {

    next(error)
  }
}

export const getPrices = async (req, res, next) => {

  const branch = req.params.branchId

  try {

    const prices = await Price.find({branch})
    res.status(200).json({prices: prices})

  } catch (error) {

    next(error)
  }
}