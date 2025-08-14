
import ProviderPayment from "../../models/providers/payment.model.js";
import ProviderMovements from "../../models/providers/provider.movement.model.js";
import { employeeAggregate } from "../employee.controller.js";

export const getPayments = async (req, res, next) => {

  try {
    const { companyId } = req.params;
    const payments = await ProviderPayment.find({ companyId }).populate('provider', 'name lastName')

    res.status(200).json(payments);


  } catch (error) {
    console.error('Error fetching payments:', error);
    next(error);
  }
}

export const getProviderProductLastPrice = async (req, res, next) => {

  const { providerId, productId } = req.params;

  try {

    const lastMovementPrice = await ProviderMovements.aggregate([
      {
        $match: {
          provider: providerId,
          product: productId,
          isReturn: false
        }
      },
      {
        $sort: { createdAt: -1 } // Sort by date descending
      },
      {
        $limit: 1 // Get the most recent purchase
      },
      {
        $project: { price: 1, createdAt: 1 } // Return only the amount and date
      }
    ]);
    if (lastMovementPrice.length > 0) {
      res.status(200).json({
        lastPrice: lastMovementPrice[0].price || 0,
        date: lastMovementPrice[0].createdAt
      });
    } else {
      res.status(404).json({ message: 'No movements found for this provider and product.' });
    }

  } catch (error) {
    console.error('Error fetching last price:', error);
    next(error);
  }

}

export const getProviderPayments = async (req, res, next) => {
  try {
    const { providerId } = req.params;
    const payments = await ProviderPayment.aggregate([
      {
        $match: { provider: providerId }
      },
      ...employeeAggregate('employee', undefined, companyId),
    ])

    res.status(200).json(payments);

  } catch (error) {
    console.error('Error fetching provider payments:', error);
    next(error);
  }
}

export const newPayment = async (req, res, next) => {
  const { companyId, providerId, amount, comment } = req.body;

  try {
    // Validate input
    if (!companyId || !providerId || !amount) {
      return res.status(400).json({ message: 'Faltan datos requeridos.' });
    }

    // Create new payment
    const newPayment = new ProviderPayment({
      company: companyId,
      provider: providerId,
      amount,
      comment,
    });

    await newPayment.save();
    res.status(201).json(newPayment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Error al crear el pago.' });
  }
}