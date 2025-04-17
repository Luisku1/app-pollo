import axios from 'axios';

export const getEmployeesBranchReports = async (employeeId, date) => {
  try {
    const response = await axios.get(`/api/employee/get-employee-branch-reports/${employeeId}`, {
      params: { date },
    });
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error('Error fetching employee branch reports:', error);
    throw error;
  }
};
