import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainerComponent } from './helpers/toastify';
import { RolesProvider } from './context/RolesContext';
import ModalProvider from './context/ModalProvider';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import ListadoDeCuentas from './pages/ListadoDeCuentas';
import InicioSesion from './pages/InicioSesion';
import Perfil from './pages/Perfil';
import RegistroCuentaDiaria from './pages/RegistroCuentaDiaria';
import RegistroDueño from './pages/RegistroDueño';
import RegistroEmpleado from './pages/RegistroEmpleado';
import RegistroEmpresa from './pages/RegistroEmpresa';
import Empleados from './pages/Empleados';
import RegistroSucursal from './pages/RegistroSucursal';
import ControlSupervisor from './pages/ControlSupervisor';
import Empresas from './pages/Empresas';
import Productos from './pages/Productos';
import Sucursales from './pages/Sucursales';
import Precios from './pages/Precios';
import Reporte from './pages/Reporte';
import EntradaInicial from './pages/EntradaInicial';
import Gastos from './pages/Gastos';
import Nomina from './pages/Nomina';
import Sobrante from './pages/Sobrante';
import Graficos from './pages/Graficos';
import PreciosSucursal from './pages/PreciosSucursal';
import RegistroCliente from './pages/RegistroCliente';
import MenuProveedor from './pages/MenuProveedor';
import ControlProveedor from './pages/ControlProveedores';
import './index.css';
import { useSelector } from 'react-redux';
import { DateProvider } from './context/DateContext';

export default function App() {

  const currentUser = useSelector((state) => state.user);

  return (
    <RolesProvider>
      <DateProvider> {/* Wrap with DateProvider */}
        <ModalProvider>
          <BrowserRouter>
            <Header />
            <ToastContainerComponent />
            <Routes>
              <Route path="/inicio-sesion" element={<InicioSesion />} />
              <Route path="/registro" element={<RegistroDueño />} />
              <Route path="/precios-sucursal/:branchId" element={<PreciosSucursal />} />
              <Route element={<PrivateRoute />}>
                <Route
                  path="/"
                  element={
                    (currentUser.role?._id ?? currentUser.role) == '65f4d024ac6002fac0321cd3' ?
                      <RegistroCuentaDiaria />
                      :
                      (currentUser.role?._id ?? currentUser.role) == '65f4d02bac6002fac0321cd7' ?
                        <ControlSupervisor />
                        :
                        (currentUser.role?._id ?? currentUser.role) == '65f4d02fac6002fac0321cd9'  ?
                          <Reporte />
                          :
                          <Reporte />
                  }
                />
                <Route path="/perfil/:employeeId" element={<Perfil />} />
                <Route path="/formato" element={<RegistroCuentaDiaria />} />
                <Route path="/formato/:date/:branchId" element={<RegistroCuentaDiaria />} />
                <Route path="/formato/:date" element={<RegistroCuentaDiaria />} />
                <Route path="/listado-de-cuentas" element={<ListadoDeCuentas />} />
                <Route path="/empleados" element={<Empleados />} />
                <Route path="/empresas" element={<Empresas />} />
                <Route path="/productos" element={<Productos />} />
                <Route path="/sucursales" element={<Sucursales />} />
                <Route path="/precios" element={<Precios />} />
                <Route path="/precios/:date" element={<Precios />} />
                <Route path="/registro-empresa" element={<RegistroEmpresa />} />
                <Route path="/registro-empleado" element={<RegistroEmpleado />} />
                <Route path="/registro-sucursal" element={<RegistroSucursal />} />
                <Route path="/control-proveedores" element={<ControlProveedor />} />
                <Route path="/registro-cliente" element={<RegistroCliente />} />
                <Route path="/supervision-diaria" element={<ControlSupervisor />} />
                <Route path="/supervision-diaria/:date" element={<ControlSupervisor />} />
                <Route path="/entrada-inicial/:productId/:productName" element={<EntradaInicial />} />
                <Route path="/entrada-inicial/:date/:productId/:productName" element={<EntradaInicial />} />
                <Route path="/nomina/" element={<Nomina />} />
                <Route path="/nomina/:date" element={<Nomina />} />
                <Route path="/reporte" element={<Reporte />} />
                <Route path="/reporte/:date" element={<Reporte />} />
                <Route path="/gastos" element={<Gastos />} />
                <Route path="/gastos/:date" element={<Gastos />} />
                <Route path="/sobrante" element={<Sobrante />} />
                <Route path="/sobrante/:date" element={<Sobrante />} />
                <Route path="/graficos/" element={<Graficos />} />
                <Route path="/graficos/:date" element={<Graficos />} />
                <Route path="/proveedores/:date" element={<MenuProveedor />} />
                <Route path="/proveedores" element={<MenuProveedor />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ModalProvider>
      </DateProvider>
    </RolesProvider>
  );
}
