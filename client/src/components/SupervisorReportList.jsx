import SupervisorReportCard from "./SupervisorReportCard"

/* eslint-disable react/prop-types */
export default function SupervisorReportList({ supervisorReports, replaceReport, externalIndex }) {

  return (
    <div className="w-full relative">
      <div>
        {supervisorReports.map((report) => (
          <SupervisorReportCard
            key={report._id}
            supervisorReport={report}
            replaceReport={replaceReport}
            externalIndex={externalIndex}
          />
        ))}
      </div>
    </div>
  )
}
