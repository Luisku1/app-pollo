import SupervisorReportCard from "./SupervisorReportCard"

/* eslint-disable react/prop-types */
export default function SupervisorReportList({ supervisorReports, updateSupervisorReportGroup, updateSupervisorReportSingle }) {

  return (
    <div className="w-full relative">
      <div>
        {supervisorReports.map((report) => (
          <SupervisorReportCard
            key={report._id}
            supervisorReport={report}
            updateSupervisorReportGroup={updateSupervisorReportGroup}
            updateSupervisorReportSingle={updateSupervisorReportSingle}
          />
        ))}
      </div>
    </div>
  )
}
