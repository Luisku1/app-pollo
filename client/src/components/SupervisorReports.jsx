import SupervisorReport from "./SupervisorReportComp";

/* eslint-disable react/prop-types */
export default function SupervisorReports({ supervisorReports }) {
  return (
    <div>
      {supervisorReports && supervisorReports.length > 0 && supervisorReports.map((supervisorReport) => (
        <SupervisorReport key={supervisorReport._id} supervisorReport={supervisorReport}/>
      ))}
    </div>
  )
}
