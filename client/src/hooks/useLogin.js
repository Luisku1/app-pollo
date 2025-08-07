import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signInStart, signInSuccess, signInFailiure, addCompany } from '../redux/user/userSlice';
import { useRoles } from '../context/RolesContext';

export function useLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isJustSeller, isSupervisor, isManager } = useRoles();

  const fetchCompanyByOwnerId = async (ownerId) => {
    try {
      const res = await fetch('/api/company/get-by-owner-id/' + ownerId);
      const data = await res.json();
      if (data.success === false) {
        dispatch(signInFailiure(data.message));
        return;
      }
      dispatch(addCompany(data));
    } catch (error) {
      dispatch(signInFailiure(error.message));
    }
  };

  const fetchCompanyById = async (companyId) => {
    try {
      const res = await fetch('/api/company/get-by-id/' + companyId);
      const data = await res.json();
      if (data.success === false) {
        dispatch(signInFailiure(data.message));
        return;
      }
      dispatch(addCompany(data));
    } catch (error) {
      dispatch(signInFailiure(error.message));
    }
  };

  const login = async (formData) => {
    try {
      dispatch(signInStart());
      if (!formData.phoneNumber || !formData.password) {
        dispatch(signInFailiure('Llena todos los campos'));
        return;
      }
      const res = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(signInFailiure(data.message));
        return;
      }
      if (typeof data.company === 'undefined') {
        await fetchCompanyByOwnerId(data._id);
      } else {
        await fetchCompanyById(data.defaultCompany);
      }
      dispatch(signInSuccess(data));
      if (!data.defaultCompany) {
        navigate('/registro-empresa');
        return;
      }
      if (isManager(data.role?._id ?? data.role)) {
        navigate('/reporte');
        return;
      }
      if (isSupervisor(data.role?._id ?? data.role)) {
        navigate('/supervision-diaria');
        return;
      }
      if (isJustSeller(data.role?._id ?? data.role)) {
        navigate('/formato');
        return;
      }
    } catch (error) {
      dispatch(signInFailiure(error.message));
    }
  };

  return { login };
}
