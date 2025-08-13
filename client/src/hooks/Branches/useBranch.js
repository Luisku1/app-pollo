import { updateResidualsUse } from "../../services/branches/updateResidualUse";

export const useBranch = () => {

  const onUpdateResidualUse = async (branchId) => {
    try {

      const data = await updateResidualsUse(branchId);
      return data;

    } catch (error) {
      throw error
    }
  }

  return {
    onUpdateResidualUse,
  };
}