import Provider from "../models/providers/provider.model.js";
import ProviderPayment from "../models/providers/provider.payment.model.js";
import ProviderPurchase from "../models/providers/provider.purchase.model.js";
import ProviderReport from "../models/providers/provider.report.model.js";
import ProviderReturns from "../models/providers/provider.returns.model.js";
import ProviderMovements from "../models/providers/provider.movement.model.js";
import { getDayRange } from "../utils/formatDate.js";
import { Types } from "mongoose";
import { productAggregate } from "./product.controller.js";
import { employeeAggregate } from "./employee.controller.js";

export const providerAggregate = (localField, as) => {
  return [
    {
      $lookup: {
        from: "providers",
        localField,
        foreignField: "_id",
        as: as || localField,
      },
    },
    {
      $unwind: {
        path: `$${as || localField}`,
        preserveNullAndEmptyArrays: true,
      },
    },
  ];
};

export const newProvider = async (req, res, next) => {
  const { name, phoneNumber, location, company } = req.body;

  try {
    const newProvider = Provider({ name, phoneNumber, location, company });
    await newProvider.save();

    res.status(200).json("New provider created successfully");
  } catch (error) {
    next(error);
  }
};

export const getProviders = async (req, res, next) => {
  const companyId = req.params.companyId;

  try {
    const providers = await Provider.find({ company: companyId }).sort({
      position: 1,
    });

    res.status(200).json({ providers: providers });
  } catch (error) {
    next(error);
  }
};

export const updateProvider = async (req, res, next) => {
  const provider = req.body;

  try {
    const updatedProvider = await Provider.findByIdAndUpdate(
      provider._id,
      provider
    );

    if (!updateProvider)
      throw new Error("No se pudo actualizar a ese proveedor");

    res.status(203).json({
      message: "Proveedor actualizado con éxito",
      success: true,
      data: updateProvider,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const deleteProvider = async (req, res, next) => {
  const companyId = req.params.companyId;

  try {
    const deleted = await Provider.deleteOne({ _id: companyId });

    if (deleted.acknowledged) {
      res.status(200).json("Provider deleted successfully");
    } else {
      next(errorHandler(404, "Something went wrong"));
    }
  } catch (error) {
    next(error);
  }
};

export const getProviderAverage = async (req, res, next) => {
  const providerId = req.params.providerId;
  const date = new Date();

  date.setDate(date.getDate() - 7);

  try {
    const providerAvg = await ProviderReport.aggregate([
      {
        $match: {
          branch: new Types.ObjectId(providerId),
          createdAt: { $gte: date },
        },
      },
      {
        $project: {
          outgoingsAndIncomes: { $sum: ["$outgoings", "$incomes"] },
        },
      },
      {
        $group: {
          _id: providerId,
          average: { $avg: "$outgoingsAndIncomes" },
        },
      },
    ]);

    if (providerAvg.length > 0) {
      res.status(201).json({ providerAvg: providerAvg[0].average });
    } else {
      next(errorHandler(404, "No data found"));
    }
  } catch (error) {
    next(error);
  }
};

export const updateReportsAndBalancesAccounts = async ({
  providerReport,
  updateInstructions = {},
  updatedFields,
}) => {
  let updatedProviderReport = null;

  try {
    updatedProviderReport = await ProviderReport.findByIdAndUpdate(
      providerReport._id,
      { ...updateInstructions },
      { new: true }
    );

    if (!updatedProviderReport)
      throw new Error("No se pudo modificar el reporte");

    return updatedProviderReport;
  } catch (error) {
    const hasDifferences = updatedFields.some(
      (field) => updatedProviderReport[field] !== providerReport[field]
    );

    if (updatedProviderReport && hasDifferences) {
      await ProviderReport.findByIdAndUpdate(
        providerReport._id,
        providerReport
      );
    }

    throw error;
  }
};

export const createDefaultProviderReport = async ({
  providerId,
  date,
  companyId,
}) => {
  const { bottomDate } = getDayRange(date);

  const lastProviderReport = await ProviderReport.findOne({
    createdAt: { $lt: bottomDate },
    provider: providerId,
  });

  const previousBalance = lastProviderReport.balance || 0;

  return await ProviderReport.create({
    provider: providerId,
    previousBalance,
    createdAt: bottomDate,
    company: companyId,
  });
};

export const fetchBasicProviderReport = async ({ providerId, date }) => {
  const { bottomDate, topDate } = getDayRange(date);

  try {
    return await ProviderReport.findOne({
      createdAt: { $gte: bottomDate, $lt: topDate },
      provider: providerId,
    });
  } catch (error) {
    throw error;
  }
};

export const fetchOrCreateProviderReport = async ({
  providerId,
  companyId,
  date,
}) => {
  let providerReport = null;

  try {
    providerReport = await fetchBasicProviderReport({ providerId, date });

    if (!providerReport) {
      providerReport = await createDefaultProviderReport({
        providerId,
        date,
        companyId,
      });
    }

    if (!providerReport)
      throw new Error("No se encontró ni se pudo crear el reporte");

    return providerReport;
  } catch (error) {
    throw error;
  }
};

export const pushOrPullProviderReportRecord = async ({
  providerId,
  date,
  record,
  affectsBalancePositively,
  operation,
  arrayField,
  amountField,
}) => {
  if (!["$addToSet", "$pull"].includes(operation))
    throw new Error("Parámetros inválidos, se espera '$addToSet' o '$pull'");
  if (!providerId || !date || !record || !arrayField || !amountField)
    throw new Error(
      "Parámetros requeridos faltantes en pushOrPullProviderReportRecord"
    );

  const providerReport = await fetchOrCreateProviderReport({
    providerId,
    companyId: record.company,
    date,
  });
  const adjustedBalanceInc = affectsBalancePositively
    ? record.amount
    : -record.amount;
  const balanceAdjustment =
    operation === "$addToSet" ? adjustedBalanceInc : -adjustedBalanceInc;
  const amountAdjustment =
    operation === "$addToSet" ? record.amount : -record.amount;

  const updateInstructions = {
    [operation]: { [arrayField]: record._id },
    $inc: { [amountField]: amountAdjustment, balance: balanceAdjustment },
  };

  return updateReportsAndBalancesAccounts({
    providerReport,
    updateInstructions,
    updatedFields: [arrayField, amountField],
  });
};

export const newMovement = async (req, res, next) => {
  const {
    isReturn,
    provider,
    product,
    weight,
    price,
    amount,
    comment,
    employee,
    company,
    createdAt,
    specialPrice,
  } = req.body;

  console.log(req.body);

  try {
    const movement = await ProviderMovements.create({
      isReturn,
      employee,
      company,
      provider,
      product,
      weight,
      price,
      amount: isReturn ? -amount : amount,
      comment,
      createdAt,
      specialPrice,
    });

    console.log(movement);

    res.status(201).json({
      data: movement,
      message: "transacción registrada correctamente",
      success: true,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const deleteMovement = async (req, res, next) => {
  const movementId = req.params.movementId;
  let deletedMovement = null;

  try {
    // Buscar y eliminar el movimiento por su ID
    deletedMovement = await ProviderMovements.findByIdAndDelete(movementId);

    if (!deletedMovement) {
      throw new Error("No se encontró el movimiento para eliminar");
    }

    res.status(200).json({
      message: "Movimiento eliminado con éxito",
      movement: deletedMovement,
    });
  } catch (error) {
    next(error);
  }
};

export const getMovements = async (req, res, next) => {
  const companyId = req.params.companyId;
  const date = req.params.date;

  const { bottomDate, topDate } = getDayRange(date);

  try {
    const movements = await ProviderMovements.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(bottomDate), $lt: new Date(topDate) },
          company: new Types.ObjectId(companyId),
        },
      },
      ...providerAggregate("provider"),
      ...productAggregate("product"),
      ...employeeAggregate("employee"),
    ]);

    res.status(200).json(movements);
  } catch (error) {
    next(error);
  }
};

export const getPurchases = async (req, res, next) => {
  const companyId = req.params.companyId;

  try {
    const purchases = await ProviderMovements.aggregate([
      {
        $match: {
          company: new Types.ObjectId(companyId),
          isReturn: false,
        },
      },
      ...providerAggregate("provider"),
      ...productAggregate("product"),
      ...employeeAggregate("employee"),
    ]);
    if (purchases.length === 0) {
      return res
        .status(404)
        .json({ message: "No hay compras registradas en este proveedor" });
    }

    res.status(200).json({ purchases: purchases });
  } catch (error) {
    next(error);
  }
};

export const newReturn = async (req, res, next) => {
  const {
    weight,
    price,
    amount,
    comment,
    specialPrice,
    product,
    branche,
    supervisor,
    provider,
  } = req.body;

  let createdReturn = null;

  try {
    createdReturn = await ProviderReturns.create({
      amount,
      price,
      weight,
      comment,
      specialPrice,
      branche,
      product,
      supervisor,
      provider,
    });

    if (!createdReturn) throw new Error("No se creó la devolución");

    await pushOrPullProviderReportRecord({
      providerId: createdReturn.provider,
      date: createdReturn.createdAt,
      record: createdReturn,
      affectsBalancePositively: true,
      operation: "$addToSet",
      arrayField: "returnsArray",
      amountField: "returnsAmount",
    });

    res.status(201).json({
      message: "Se registró la devolución",
      return: createdReturn,
    });
  } catch (error) {
    next(error);
  }
};

export const getReturns = async (req, res, next) => {
  const companyId = req.params.companyId;

  try {
    const returns = await ProviderReturns.find({ company: companyId }).sort({
      position: 1,
    });

    res.status(200).json({ retruns: returns });
  } catch (error) {
    next(error);
  }
};

export const deleteReturn = async (req, res, next) => {
  const returnId = req.params.returnId;
  let deletedReturn = null;

  try {
    deletedReturn = await ProviderReturns.findByIdAndDelete(returnId);

    if (!deletedReturn) throw new Error("No se eliminó la devolución");

    await pushOrPullProviderReportRecord({
      providerId: deletedReturn.provider,
      date: deletedReturn.createdAt,
      record: deletedReturn,
      affectsBalancePositively: true,
      operation: "$pull",
      arrayField: "returnsArray",
      amountField: "returnsAmount",
    });

    res.status(200).json({
      message: "Devolución eliminada",
      return: deletedRetur,
    });
  } catch (error) {
    next(error);
  }
};

export const newPayment = async (req, res, next) => {
  const { amount, provider, company } = req.body;
  let payment = null;

  try {
    payment = await ProviderPayment.create({ amount, company, provider });

    if (!payment) throw new Error("No se creó el pago a proveedor");

    await pushOrPullProviderReportRecord({
      providerId: payment.provider,
      date: payment.createdAt,
      record: payment,
      affectsBalancePositively: true,
      operation: "$addToSet",
      arrayField: "paymentsArray",
      amountField: "paymentsAmount",
    });

    res.status(200).json({
      message: "Se creó el pago a proveedor",
      payment,
    });
  } catch (error) {
    if (payment) {
      await ProviderPayment.findByIdAndDelete(payment._id);
    }

    next(error);
  }
};

/*
export const getPayments = async() =>{

}


export const getProviderPayments = async()=>{

}
*/
export const deletePayment = async (req, res, next) => {
  const paymentId = req.params.paymentId;
  let deletedPayment = null;

  try {
    deletedPayment = await ProviderPayment.findByIdAndDelete(paymentId);

    if (!deletedPayment) throw new Error("No se eliminó el pago a proveedor");

    await pushOrPullProviderReportRecord({
      providerId: deletedPayment.provider,
      date: deletedPayment.createdAt,
      record: deletedPayment,
      affectsBalancePositively: true,
      operation: "$pull",
      arrayField: "paymentsArray",
      amountField: "paymentsAmount",
    });

    res.status(200).json({
      message: "Se eliminó el pago a empleado",
      payment: deletedPayment,
    });
  } catch (error) {
    if (deletedPayment) {
      await ProviderPayment.create(deletedPayment);
    }

    next(error);
  }
};
