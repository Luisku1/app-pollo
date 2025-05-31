
import BranchReportCard from "./BranchReportCard";

/* eslint-disable react/prop-types */
export default function TarjetaCuenta({ reportArray, updateBranchReportGroup, updateBranchReportSingle, defaultDetailsShowed = null }) {

  return (
    <div className="w-full relative">
      <div>
        {reportArray.map((reportData) => (
          <BranchReportCard
            key={reportData._id}
            reportData={reportData}
            updateBranchReportGroup={updateBranchReportGroup}
            updateBranchReportSingle={updateBranchReportSingle}
            defaultDetailsShowed={defaultDetailsShowed}
          />
        ))}
      </div>
    </div>
  )
}
