/* eslint-disable react/prop-types */
import SupervisorReport from "./SupervisorReport.jsx";

export default function SupervisorReports({ supervisorReports }) {
  return (
    <div>
      {supervisorReports && supervisorReports.length > 0 && supervisorReports.map((supervisorReport) => (
        <SupervisorReport key={supervisorReport._id} supervisorReport={supervisorReport}/>
      ))}
    </div>
  )
}
