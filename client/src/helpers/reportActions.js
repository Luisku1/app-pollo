import { recalculateBranchReport } from "../services/BranchReports/updateBranchReport";


export function addToArrayAndSum(report, arrayKey, totalKey, item, valueKey = 'amount') {
  const updated = {
    ...report,
    [arrayKey]: [item, ...(report[arrayKey] || [])],
    [totalKey]: (report[totalKey] || 0) + (item[valueKey] || 0),
  };
  // Si es branchReport, recalcula balance
  return report.branch ? recalculateBranchReport(updated) : updated;
}

export function removeFromArrayAndSum(report, arrayKey, totalKey, item, valueKey = 'amount') {
  const updated = {
    ...report,
    [arrayKey]: (report[arrayKey] || []).filter(i => i._id !== item._id),
    [totalKey]: (report[totalKey] || 0) - (item[valueKey] || 0),
  };
  // Si es branchReport, recalcula balance
  return report.branch ? recalculateBranchReport(updated) : updated;
}
