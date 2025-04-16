
import BranchReportCard from "./BranchReportCard";

/* eslint-disable react/prop-types */
export default function TarjetaCuenta({ reportArray, replaceReport, defaultDetailsShowed = null, payrollIndex = null }) {

  return (
    <div className="w-full relative">
      <div>
        {reportArray.map((reportData) => (
          <BranchReportCard
            key={reportData._id}
            reportData={reportData}
            replaceReport={replaceReport}
            defaultDetailsShowed={defaultDetailsShowed}
            externalIndex={payrollIndex}
          />
        ))}
      </div>
    </div>
  )
}
