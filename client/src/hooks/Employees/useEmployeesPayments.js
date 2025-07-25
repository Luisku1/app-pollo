import { useEffect, useMemo, useState } from "react"
import { getEmployeesPaymentsFetch } from "../../services/employees/employeesPayments"
import { useAddEmployeePayment } from "./useAddEmployeePayment"
import { useDeleteEmployeePayment } from "./useDeleteEmployeePayment"
import { getEmployeePayments } from "../../services/employees/employeePayments"
import { Types } from "mongoose";
import { useQueryClient } from '@tanstack/react-query';
import { optimisticUpdateReport, rollbackReport } from '../../helpers/optimisticReportUpdate';
import { addToArrayAndSum } from '../../helpers/reportActions';
import { getId } from '../../helpers/Functions';
import { formatDate } from "../../../../common/dateOps"

export const useEmployeesPayments = ({ companyId = null, date = null, employeeId = null, initialPayments = [] }) => {

  const [payments, setPayments] = useState(initialPayments)
  const [total, setTotal] = useState(
    initialPayments.reduce((acc, payment) => acc + payment.amount, 0)
  )
  const { addEmployeePayment, loading: addLoading } = useAddEmployeePayment()
  const { deleteEmployeePayment, loading: deleteLoading } = useDeleteEmployeePayment()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const queryClient = useQueryClient()

  const pushEmployeePayment = (employeePayment) => {

    setPayments((prevEmployeesPayments) => [employeePayment, ...prevEmployeesPayments])
    setTotal((prevTotal) => prevTotal + employeePayment.amount)
  }

  const spliceEmployeePaymentByIndex = (index) => {
    setPayments((prevPayments) => {
      const removedEmployeePayment = prevPayments[index]
      const newPayments = prevPayments.filter((_, i) => i !== index)
      setTotal((prevTotal) => prevTotal - removedEmployeePayment.amount)
      return newPayments
    })
  }

  const onAddEmployeePayment = async (employeePayment) => {
    const tempId = new Types.ObjectId().toHexString()
    const incomeId = new Types.ObjectId().toHexString()
    const date = new Date()

    const income = {
      _id: incomeId,
      amount: employeePayment.amount,
      branch: employeePayment.branch,
      employee: employeePayment.employee,
      partOfAPayment: true,
      createdAt: date,
    }
    const extraOutgoingId = new Types.ObjectId().toHexString()
    const extraOutgoing = {
      _id: extraOutgoingId,
      amount: employeePayment.amount,
      concept: employeePayment.detail,
      employee: employeePayment.employee,
      partOfAPayment: true,
      createdAt: date,
    }
    const tempEmployeePayment = { ...employeePayment, _id: tempId, income: employeePayment.branch ? incomeId : null, extraOutgoing: extraOutgoingId }

    // Snapshots para rollback
    let prevIncomes = null;
    let prevBranchReports = null;
    let prevSupervisorsReportsCash = null;
    let prevExtraOutgoings = null;
    let prevSupervisorsReportsExtra = null;
    try {
      // --- ACTUALIZACIÓN OPTIMISTA DE incomes y branchReports SI HAY branch ---
      if (employeePayment.branch) {
        // Incomes
        prevIncomes = queryClient.getQueryData(['incomes', employeePayment.company, date]);
        queryClient.setQueryData(['incomes', employeePayment.company, date], (old = []) => {
          if (old.find(i => getId(i) === getId(income))) return old;
          return [income, ...old];
        });
        // branchReports
        prevBranchReports = queryClient.getQueryData(['branchReports', employeePayment.company, date]);
        optimisticUpdateReport({
          queryClient,
          queryKey: ['branchReports', employeePayment.company, formatDate(date)],
          matchFn: (report, item) => getId(report.branch) === getId(item.branch),
          updateFn: (report, item) => addToArrayAndSum(report, 'incomesArray', 'incomes', item),
          item: income
        });
        // supervisorsReportInfo: income a cashArray y cash
        prevSupervisorsReportsCash = queryClient.getQueryData(['supervisorsReportInfo', employeePayment.company, date]);
        optimisticUpdateReport({
          queryClient,
          queryKey: ['supervisorsReportInfo', employeePayment.company, formatDate(date)],
          matchFn: (report, item) => getId(report.supervisor) && getId(report.supervisor) === getId(item.employee),
          updateFn: (report, item) => addToArrayAndSum(report, 'cashArray', 'cash', item),
          item: income
        });
      }
      // --- ACTUALIZACIÓN OPTIMISTA DE extraOutgoings ---
      prevExtraOutgoings = queryClient.getQueryData(['extraOutgoings', employeePayment.company, date]);
      queryClient.setQueryData(['extraOutgoings', employeePayment.company, formatDate(date)], (old = []) => {
        if (old.find(e => getId(e) === getId(extraOutgoing))) return old;
        return [extraOutgoing, ...old];
      });
      // --- supervisorsReportInfo: extraOutgoing a extraOutgoingsArray y extraOutgoings ---
      prevSupervisorsReportsExtra = queryClient.getQueryData(['supervisorsReportInfo', employeePayment.company, date]);
      optimisticUpdateReport({
        queryClient,
        queryKey: ['supervisorsReportInfo', employeePayment.company, formatDate(date)],
        matchFn: (report, item) => getId(report.supervisor) && getId(report.supervisor) === getId(item.employee),
        updateFn: (report, item) => addToArrayAndSum(report, 'extraOutgoingsArray', 'extraOutgoings', item),
        item: extraOutgoing
      });

      await addEmployeePayment(tempEmployeePayment)
    } catch (error) {
      // Rollback de todos los caches
      if (employeePayment.branch) {
        if (prevIncomes) queryClient.setQueryData(['incomes', employeePayment.company, date], prevIncomes);
        if (prevBranchReports) rollbackReport({
          queryClient,
          queryKey: ['branchReports', employeePayment.company, date],
          prevReports: prevBranchReports
        });
        if (prevSupervisorsReportsCash) rollbackReport({
          queryClient,
          queryKey: ['supervisorsReportInfo', employeePayment.company, date],
          prevReports: prevSupervisorsReportsCash
        });
      }
      if (prevExtraOutgoings) queryClient.setQueryData(['extraOutgoings', employeePayment.company, date], prevExtraOutgoings);
      if (prevSupervisorsReportsExtra) rollbackReport({
        queryClient,
        queryKey: ['supervisorsReportInfo', employeePayment.company, date],
        prevReports: prevSupervisorsReportsExtra
      });
      spliceEmployeePaymentByIndex(payments.findIndex((payment) => payment._id === tempId))
      console.log(error)
    }
  }

  const onDeleteEmployeePayment = async (employeePayment, spliceIncome, spliceExtraOutgoing) => {
    // Snapshots para rollback
    let prevIncomes = null;
    let prevBranchReports = null;
    let prevSupervisorsReportsCash = null;
    let prevExtraOutgoings = null;
    let prevSupervisorsReportsExtra = null;
    try {
      // --- ACTUALIZACIÓN OPTIMISTA DE incomes y branchReports SI HAY branch ---
      if (employeePayment.branch) {
        // Incomes
        prevIncomes = queryClient.getQueryData(['incomes', employeePayment.company, formatDate(employeePayment.createdAt || date)]);
        queryClient.setQueryData(['incomes', employeePayment.company, formatDate(employeePayment.createdAt || date)], (old = []) => {
          return old.filter(i => getId(i) !== getId(employeePayment.income));
        });
        // branchReports
        prevBranchReports = queryClient.getQueryData(['branchReports', employeePayment.company, formatDate(employeePayment.createdAt || date)]);
        optimisticUpdateReport({
          queryClient,
          queryKey: ['branchReports', employeePayment.company, formatDate(employeePayment.createdAt || date)],
          matchFn: (report, item) => getId(report.branch) === getId(item.branch),
          updateFn: (report, item) => {
            // Elimina income de incomesArray y resta incomes
            return {
              ...report,
              incomesArray: (report.incomesArray || []).filter(i => getId(i) !== getId(item)),
              incomes: (report.incomes || 0) - (item.amount || 0)
            };
          },
          item: employeePayment.income
        });
        // supervisorsReportInfo: income de cashArray y cash
        prevSupervisorsReportsCash = queryClient.getQueryData(['supervisorsReportInfo', employeePayment.company, formatDate(employeePayment.createdAt || date)]);
        optimisticUpdateReport({
          queryClient,
          queryKey: ['supervisorsReportInfo', employeePayment.company, formatDate(employeePayment.createdAt || date)],
          matchFn: (report, item) => getId(report.supervisor) && getId(report.supervisor) === getId(item.employee),
          updateFn: (report, item) => {
            return {
              ...report,
              cashArray: (report.cashArray || []).filter(i => getId(i) !== getId(item)),
              cash: (report.cash || 0) - (item.amount || 0)
            };
          },
          item: employeePayment.income
        });
      }
      // --- ACTUALIZACIÓN OPTIMISTA DE extraOutgoings ---
      prevExtraOutgoings = queryClient.getQueryData(['extraOutgoings', employeePayment.company, formatDate(employeePayment.createdAt || date)]);
      queryClient.setQueryData(['extraOutgoings', employeePayment.company, formatDate(employeePayment.createdAt || date)], (old = []) => {
        return old.filter(e => getId(e) !== getId(employeePayment.extraOutgoing));
      });
      // --- supervisorsReportInfo: extraOutgoing de extraOutgoingsArray y extraOutgoings ---
      prevSupervisorsReportsExtra = queryClient.getQueryData(['supervisorsReportInfo', employeePayment.company, formatDate(employeePayment.createdAt || date)]);
      optimisticUpdateReport({
        queryClient,
        queryKey: ['supervisorsReportInfo', employeePayment.company, formatDate(employeePayment.createdAt || date)],
        matchFn: (report, item) => getId(report.supervisor) && getId(report.supervisor) === getId(item.employee),
        updateFn: (report, item) => {
          return {
            ...report,
            extraOutgoingsArray: (report.extraOutgoingsArray || []).filter(e => getId(e) !== getId(item)),
            extraOutgoings: (report.extraOutgoings || 0) - (item.amount || 0)
          };
        },
        item: employeePayment.extraOutgoing
      });

      spliceEmployeePaymentByIndex(employeePayment.index)
      await deleteEmployeePayment(employeePayment)

      if (employeePayment.income) spliceIncome?.(employeePayment.income._id ? employeePayment.income._id : employeePayment.income)
      if (employeePayment.extraOutgoing) spliceExtraOutgoing?.(employeePayment.extraOutgoing._id ? employeePayment.extraOutgoing._id : employeePayment.extraOutgoing)

    } catch (error) {
      // Rollback de todos los caches
      if (employeePayment.branch) {
        if (prevIncomes) queryClient.setQueryData(['incomes', employeePayment.company, formatDate(employeePayment.createdAt || date)], prevIncomes);
        if (prevBranchReports) rollbackReport({
          queryClient,
          queryKey: ['branchReports', employeePayment.company, formatDate(employeePayment.createdAt || date)],
          prevReports: prevBranchReports
        });
        if (prevSupervisorsReportsCash) rollbackReport({
          queryClient,
          queryKey: ['supervisorsReportInfo', employeePayment.company, formatDate(employeePayment.createdAt || date)],
          prevReports: prevSupervisorsReportsCash
        });
      }
      if (prevExtraOutgoings) queryClient.setQueryData(['extraOutgoings', employeePayment.company, formatDate(employeePayment.createdAt || date)], prevExtraOutgoings);
      if (prevSupervisorsReportsExtra) rollbackReport({
        queryClient,
        queryKey: ['supervisorsReportInfo', employeePayment.company, formatDate(employeePayment.createdAt || date)],
        prevReports: prevSupervisorsReportsExtra
      });
      pushEmployeePayment(employeePayment)
      console.log(error)
    }
  }

  const sortedPayments = useMemo(() => {

    return payments.sort((a, b) => b.amount - a.amount)

  }, [payments])

  useEffect(() => {

    if ((!companyId && !employeeId)) return

    setLoading(true)

    setPayments([])
    setTotal(0.0)

    if (employeeId) {

      getEmployeePayments({ employeeId, date }).then((response) => {

        setPayments(response.employeePayments)
        setTotal(response.total)

      }).catch((error) => {

        setError(error)
      })

    } else {

      getEmployeesPaymentsFetch({ companyId, date }).then((response) => {

        setPayments(response.employeesPayments)
        setTotal(response.totalEmployeesPayments)

      }).catch((error) => {

        setError(error)
      })
    }

    setLoading(false)

  }, [companyId, date, employeeId])

  return {
    payments: sortedPayments,
    setPayments,
    total,
    pushEmployeePayment,
    onDeleteEmployeePayment,
    onAddEmployeePayment,
    loading: loading || addLoading || deleteLoading,
    error
  }
}