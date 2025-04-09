import axios from "axios";

export default async function getEmployeeSupervisorReports(employeeId, date) {
  try {
    const response = await axios.get(`/api/employee/get-employee-supervisor-reports/${employeeId}`, {
      params: { date },
    });
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error("Error fetching supervisor reports:", error);
    throw error;
  }
}
