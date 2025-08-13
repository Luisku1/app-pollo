import axios from "axios";

export const fetchBasicDailyResume = async (companyId, page = 1) => {
  try {
    const response = await axios.get(
      `/api/report/get-days-reports-data/${companyId}?page=${page}`
    );
    return response.data.data; // Retorna los datos de los resúmenes diarios
  } catch (error) {
    console.error("Error fetching daily resume:", error);
    throw error;
  }
};