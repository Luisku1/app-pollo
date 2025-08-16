import axios from 'axios';

export const getEmployeesBranchReports = async (employeeId, date, companyId) => {
  try {
    const response = await axios.get(`/api/employee/get-employee-branch-reports/${employeeId}`, {
      params: { date, companyId },
    });
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error('Error fetching employee branch reports:', error);
    throw error;
  }
};
