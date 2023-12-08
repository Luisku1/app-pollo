import Outgoing from "../models/accounts/outgoings/outgoing.model.js"
import { errorHandler } from "../utils/error.js"

export const newOutgoing = async (req, res, next) => {

  const {amount, concept, company, branch} = req.body

  try {

    const outgoing = new Outgoing({amount, concept, company, branch})
    await outgoing.save()

    res.status(201).json({message: 'New outgoing created successfully', outgoing: outgoing})


  } catch (error) {

    next(error)

  }
}

export const getDailyOutgoings = async (req, res, next) => {

  const date = new Date(req.params.date)
  const branchId = req.params.branchId
  const localeDate = date.toDateString('es-MX', {timeZone: 'US/Central'})
  const functionalDate = new Date(localeDate)
  const functionalDateMinusOneDay = new Date(localeDate)
  functionalDateMinusOneDay.setDate(functionalDateMinusOneDay.getDate() + 1)


  try {

    const outgoings = await Outgoing.find({

        $and: [{

          createdAt: {

            $gte: functionalDate.toISOString()
          }
        },
        {
          createdAt: {

            $lte: functionalDateMinusOneDay.toISOString()

          }
        },
        {
          branch: branchId
        }]
    })

    if(outgoings.length == 0) {

      next(errorHandler(404, 'Not found outgoings'))

    } else {

      res.status(200).json({outgoings: outgoings})
    }

  } catch (error) {

    next(error)
  }
}

export const deleteOutgoing = async(req, res, next) => {

  const outgoingId = req.params.id

  try {

    const deleted = await Outgoing.deleteOne({_id: outgoingId})

    if(!deleted.deletedCount == 0) {

      res.status(200).json('Outgoing deleted successfully')

    } else {

      next(errorHandler(404, 'Outgoing not founded'))
    }


  } catch (error) {

    next(error)
  }
}