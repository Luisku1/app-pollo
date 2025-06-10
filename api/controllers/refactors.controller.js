import { Types } from "mongoose";
import { getWeekRange } from "../utils/formatDate.js";
import Employee from "../models/employees/employee.model.js";
import EmployeeWeeklyBalance from "../models/employees/employee.weekly.balance.model.js";

export const recalculateCurrentNumina = async (req, res, next) => {

  const { companyId } = req.params;
  const date = new Date()

  try {

    const employees = await Employee.find({ company: companyId, active: true })

    const weekMatches = employees.map(employee => ({
      employee: new Types.ObjectId(employee._id),
      weekStart: new Date(getWeekRange(date, employee.payDay).weekStart)
    }));

    const weeklyBalances = await EmployeeWeeklyBalance.aggregate([

      {
        $match: {
          company: new Types.ObjectId(companyId),
          $or: weekMatches
        }
      },
      {
        $lookup: {
          from: 'employeedailybalances',
          localField: 'employeeDailyBalances',
          foreignField: '_id',
          as: 'employeeDailyBalances'
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee'
        }
      },
      {
        $unwind: '$employee'
      },
      {
        $project: {
          _id: 1,
          employeeId: '$employee._id',
          employeeName: { $concat: ['$employee.firstName', ' ', '$employee.lastName'] },
          weekStart: 1,
          weekEnd: 1,
          currentPayDay: 1,
          previousWeekBalance: 1,
          previousWeekBalance: 1,
          employeeDailyBalances: 1
        }
      }
    ])

    console.log(`weeklyBalances: ${weeklyBalances.length}`, weeklyBalances)


    for (const weeklyBalance of weeklyBalances) {

      let totalBalance = 0
      for (const dailyBalance of weeklyBalance.employeeDailyBalances ?? []) {

        totalBalance += dailyBalance.accountBalance ?? 0
        totalBalance += dailyBalance.supervisorBalance ?? 0
      }

      if (totalBalance !== 0) {
        await Employee.findByIdAndUpdate(weeklyBalance.employeeId, { balance: totalBalance })
      }
    }

  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error al calcular la nómina actual" })
  }
}