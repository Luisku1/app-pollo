
import ProviderPayment from "../../models/providers/payment.model.js";
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

export const getProviderPayments = async (req, res, next) => {
  try {
    const { providerId } = req.params;
    const payments = await ProviderPayment.aggregate([
      {
        $match: { provider: providerId }
      },
      ...employeeAggregate()
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