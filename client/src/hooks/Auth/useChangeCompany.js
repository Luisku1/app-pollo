//hook que gestiona la petición (con tanstank query) de el currentUser cuando hay un cambio de company. Con la intención de que traiga la información actualizada del usuario con su companyData
import { useDispatch } from 'react-redux';
import { signInStart, signInSuccess, signInFailiure, addCompany } from '../../redux/user/userSlice';
import { changeCompanyFetch } from '../../services/Auth/changeCompany';
import { ToastDanger, ToastInfo, ToastSuccess } from '../../helpers/toastify';

export const useChangeCompany = () => {
  const dispatch = useDispatch();

  const fetchCompanyById = async (companyId) => {
    try {
      const res = await fetch('/api/company/get-by-id/' + companyId);
      const data = await res.json();
      if (data.success === false) {
        throw new Error(data.message);
      }
      dispatch(addCompany(data));
    } catch (error) {
      ToastDanger(error.message);
    }
  };

  const changeCompany = async (companyId, userId) => {
    if (!companyId) {
      ToastInfo('Selecciona una empresa');
      return;
    }
    try {
      dispatch(signInStart());
      const employee = await changeCompanyFetch({ companyId, userId });
      await fetchCompanyById(companyId);
      dispatch(signInSuccess(employee));
      ToastSuccess('Empresa cambiada');
    } catch (error) {
      dispatch(signInFailiure(error.message));
      ToastDanger(error.message);
    }
  };

  return { changeCompany };
};
