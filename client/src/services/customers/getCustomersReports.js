import axios from 'axios';

/**
 * Fetches customer reports for a specific company and date.
 * @param {string} companyId - The ID of the company.
 * @param {string} date - The date for which to fetch the reports.
 * @returns {Promise<Object>} - A promise that resolves to the customer reports data.
 */
export const getCustomersReports = async ({ companyId, date }) => {
  try {
    const response = await axios.get(`/api/customer/get-customers-reports/${companyId}/${date}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer reports:', error);
    throw error;
  }
};