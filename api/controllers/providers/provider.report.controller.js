import { Types } from "mongoose";
import ProviderReport from "../../models/providers/provider.report.model.js";
import { getDayRange } from "../../utils/formatDate.js";
import { errorHandler } from "../../utils/error.js";
import { providerAggregate, updateReportsAndBalancesAccounts } from "./provider.controller.js";
import { dateFromYYYYMMDD, isYYYYMMDD } from "../../../common/dateOps.js";
import { productAggregate } from "../product.controller.js";
import { employeeAggregate } from "../employee.controller.js";

export const getProvidersReports = async (req, res, next) => {
  const { companyId } = req.params;
  const date = req.query?.date && isYYYYMMDD(req.query.date) ? dateFromYYYYMMDD(req.query.date) : null;

  if (!companyId) return next(errorHandler(400, 'companyId is required'));
  if (!date) return next(errorHandler(400, 'date is required'));

  try {
    const providerReports = await providersReportsAggregate({
      companyId,
      date
    });

    if (!providerReports || providerReports.length === 0) {
      return next(errorHandler(404, 'No provider reports found'));
    }

    res.status(200).json({ providerReports });
  } catch (error) {
    next(error);
  }
};

export const providersReportsAggregate = async ({ companyId, date }) => {
  const { bottomDate, topDate } = getDayRange(date);

  const pipeline = [
    {
      $match: {
        company: new Types.ObjectId(companyId),
        createdAt: { $gte: new Date(bottomDate), $lt: new Date(topDate) }
      }
    },
    {
      $lookup: {
        from: 'providermovements',
        localField: 'movementsArray',
        foreignField: '_id',
        as: 'movementsArray',
        pipeline: [
          ...productAggregate('product'),
          ...providerAggregate('provider'),
          ...employeeAggregate('employee', undefined, companyId),
        ]
      }
    },
    {
      $lookup: {
        from: 'providermovements',
        localField: 'returnsArray',
        foreignField: '_id',
        as: 'returnsArray',
        pipeline: [
          ...productAggregate('product'),
          ...providerAggregate('provider'),
          ...employeeAggregate('employee', undefined, companyId),
        ]
      }
    },
    {
      $lookup: {
        from: 'providerpayments',
        localField: 'paymentsArray',
        foreignField: '_id',
        as: 'paymentsArray',
        pipeline: [
          ...providerAggregate('provider'),
          ...employeeAggregate('employee', undefined, companyId),
        ]
      }
    },
    ...providerAggregate('provider'),
    {
      $match: {
        $or: [
          { payments: { $gt: 0 } },
          { movements: { $gt: 0 } },
          { returns: { $gt: 0 } },
          { previousBalance: { $gt: 0 } },
          { balance: { $gt: 0 } },
        ]
      }
    },
    {
      $project: {
        _id: 1,
        balance: 1,
        previousBalance: 1,
        returns: 1,
        returnsArray: 1,
        movementsArray: 1,
        movements: 1,
        payments: 1,
        paymentsArray: 1,
        provider: 1,
        createdAt: 1
      }
    }
  ];

  return await ProviderReport.aggregate(pipeline);
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

  const previousBalance = lastProviderReport?.balance || 0;

  return await ProviderReport.create({
    provider: providerId,
    previousBalance,
    createdAt: bottomDate,
    company: companyId,
    balance: previousBalance,
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
