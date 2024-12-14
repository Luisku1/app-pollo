import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ListadoDeCuentas from './pages/ListadoDeCuentas'
import InicioSesion from './pages/InicioSesion'
import Perfil from './pages/Perfil'
import RegistroCuentaDiaria from './pages/RegistroCuentaDiaria'
import Header from './components/Header'
import RegistroDueño from './pages/RegistroDueño'
import RegistroEmpleado from './pages/RegistroEmpleado'
import RegistroEmpresa from './pages/RegistroEmpresa'
import PrivateRoute from './components/PrivateRoute'
import Empleados from './pages/Empleados'
import RegistroSucursal from './pages/RegistroSucursal'
import ControlSupervisor from './pages/ControlSupervisor'
import Empresas from './pages/Empresas'
import Productos from './pages/Productos'
import Sucursales from './pages/Sucursales'
import Precios from './pages/Precios'
import Reporte from './pages/Reporte'
import EntradaInicial from './pages/EntradaInicial'
import Gastos from './pages/Gastos'
import Nomina from './pages/Nomina'
import Sobrante from './pages/Sobrante'
import Graficos from './pages/Graficos'
import PreciosSucursal from './pages/PreciosSucursal'
import RegistroCliente from './pages/RegistroCliente'
import RegistroProveedor from './pages/RegistroProveedor'
import { ToastContainerComponent } from './helpers/toastify'
// import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import ControlProveedor from './pages/ControlProveedor'
import { RolesProvider } from './context/RolesContext'


export default function App() {
  return (
    <RolesProvider>
      <BrowserRouter>
        <Header />
        <ToastContainerComponent />
        <Routes>
          <Route path="/inicio-sesion" element={<InicioSesion />} />
          <Route path="/registro" element={<RegistroDueño />} />
          <Route path="/precios-sucursal/:branchId" element={<PreciosSucursal />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<ListadoDeCuentas />} />
            <Route path="/perfil/:employeeId" element={<Perfil />} />
            <Route path="/formato" element={<RegistroCuentaDiaria />} />
            <Route path="/formato/:date/:branchId" element={<RegistroCuentaDiaria />} />
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
            <Route path="/reporte" element={<Reporte />} />
            <Route path="/reporte/:date" element={<Reporte />} />
            <Route path="/graficos/" element={<Graficos />} />
            <Route path="/graficos/:date" element={<Graficos />} />
            <Route path="/proveedores/:date" element={<ControlProveedor />} />
            <Route path="/proveedores" element={<ControlProveedor />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </RolesProvider>
  )

}
