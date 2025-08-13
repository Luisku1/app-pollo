// Servicio para obtener la diferencia neta de movimientos
import axios from 'axios';

export async function getNetDifference({ companyId, date }) {
  const { data } = await axios.get(`/api/input/get-net-difference/${companyId}/${date}`);
  return data;
}
