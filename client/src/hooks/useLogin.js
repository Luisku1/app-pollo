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

      const employee = data.employee

      if (typeof employee.companyData?.[0]?.company === 'undefined') {
        await fetchCompanyByOwnerId(employee._id);
      } else {
        await fetchCompanyById(employee.defaultCompany);
      }
      dispatch(signInSuccess(employee));
      if (!employee.defaultCompany) {
        navigate('/registro-empresa');
        return;
      }
      if (isManager(employee.companyData?.[0].role?._id ?? employee.role)) {
        navigate('/reporte');
        return;
      }
      if (isSupervisor(employee.role?._id ?? employee.role)) {
        navigate('/supervision-diaria');
        return;
      }
      if (isJustSeller(employee.role?._id ?? employee.role)) {
        navigate('/formato');
        return;
      }
    } catch (error) {
      dispatch(signInFailiure(error.message));
    }
  };

  return { login };
}
