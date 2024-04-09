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


export default function App() {
  return (
  <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/inicio-sesion" element={<InicioSesion />} />
        <Route path="/registro" element={<RegistroDueño />} />

        <Route element={<PrivateRoute/>}>

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
          <Route path="/registro-empleado" element={<RegistroEmpleado/>}/>
          <Route path="/registro-sucursal" element={<RegistroSucursal />} />
          <Route path="/supervision-diaria" element={<ControlSupervisor />} />
          <Route path="/supervision-diaria/:date" element={<ControlSupervisor />} />
          <Route path="/reporte" element={<Reporte />} />
          <Route path="/reporte/:date" element={<Reporte />} />

        </Route>

      </Routes>
    </BrowserRouter>
  )

}
