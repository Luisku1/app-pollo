import { Types } from "mongoose";
import ProviderReport from "../../models/providers/provider.report.model";

export const getProvidersReports = async (req, res, next) => {

  const { companyId } = req.params;
  const { date } = req.query;

  try {

    const providerReports = await getProvidersReports({
      companyId,
      date: new Date(date)
    });

    if (providerReports.length < 0) {
      return next(errorHandler(404, 'No provider reports found'));
    }

    res.status(200).json({ providerReports });

  } catch (error) {

    next(error);
  }
}

export const providersReportsAggregate = async ({ companyId, date }) => {

  const bottomDate = getDayRange(date).bottomDate;

  try {

    const providerReports = await ProviderReport.aggregate([
      {
        $match: {
          company: new Types.ObjectId(companyId),
          createdAt: new Date(bottomDate)
        }
      },
      {
        $lookup: {
          from: 'providers',
          localField: 'provider',
          foreignField: '_id',
          as: 'provider'
        }
      },
      {
        $unwind: '$provider'
      },
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
          movements: 1,
          payments: 1,
          provider: 1,
          createdAt: 1
        }
      }
    ]);

    return providerReports;

  } catch (error) {

    next(error);
  }
}