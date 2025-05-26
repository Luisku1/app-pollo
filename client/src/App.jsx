import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainerComponent } from './helpers/toastify';
import { RolesProvider } from './context/RolesContext';
import ModalProvider from './context/ModalProvider';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import './index.css';
import { useSelector } from 'react-redux';
import { DateProvider } from './context/DateContext';
import React, { Suspense } from 'react';

// Importa los componentes de página de forma lazy
const ListadoDeCuentas = React.lazy(() => import('./pages/ListadoDeCuentas'));
const InicioSesion = React.lazy(() => import('./pages/InicioSesion'));
const Perfil = React.lazy(() => import('./pages/Perfil'));
const RegistroCuentaDiaria = React.lazy(() => import('./pages/RegistroCuentaDiaria'));
const RegistroDueño = React.lazy(() => import('./pages/RegistroDueño'));
const RegistroEmpleado = React.lazy(() => import('./pages/RegistroEmpleado'));
const RegistroEmpresa = React.lazy(() => import('./pages/RegistroEmpresa'));
const Empleados = React.lazy(() => import('./pages/Empleados'));
const RegistroSucursal = React.lazy(() => import('./pages/RegistroSucursal'));
const ControlSupervisor = React.lazy(() => import('./pages/ControlSupervisor'));
const Empresas = React.lazy(() => import('./pages/Empresas'));
const Productos = React.lazy(() => import('./pages/Productos'));
const Sucursales = React.lazy(() => import('./pages/Sucursales'));
const Precios = React.lazy(() => import('./pages/Precios'));
const Reporte = React.lazy(() => import('./pages/Reporte'));
const EntradaInicial = React.lazy(() => import('./pages/EntradaInicial'));
const Gastos = React.lazy(() => import('./pages/Gastos'));
const Nomina = React.lazy(() => import('./pages/Nomina'));
const Sobrante = React.lazy(() => import('./pages/Sobrante'));
const Graficos = React.lazy(() => import('./pages/Graficos'));
const PreciosSucursal = React.lazy(() => import('./pages/PreciosSucursal'));
const RegistroCliente = React.lazy(() => import('./pages/RegistroCliente'));
const RegistroProveedor = React.lazy(() => import('./pages/RegistroProveedor'));
const ControlProveedor = React.lazy(() => import('./pages/ControlProveedor'));

export default function App() {
  const currentUser = useSelector((state) => state.user);
  return (
    <RolesProvider>
      <DateProvider>
        <ModalProvider>
          <BrowserRouter>
            <Header />
            <ToastContainerComponent />
            <Suspense fallback={<div>Loading...</div>}>
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
                          (currentUser.role?._id ?? currentUser.role) == '65f4d02fac6002fac0321cd9' ?
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
                  <Route path="/registro-proveedor" element={<RegistroProveedor />} />
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
                  <Route path="/proveedores/:date" element={<ControlProveedor />} />
                  <Route path="/proveedores" element={<ControlProveedor />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ModalProvider>
      </DateProvider>
    </RolesProvider>
  );
}
