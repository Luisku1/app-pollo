import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ListadoDeCuentas from './pages/ListadoDeCuentas'
import InicioSesion from './pages/InicioSesion'
import Registro from './pages/Registro'
import Perfil from './pages/Perfil'
import RegistroCuentaDiaria from './pages/RegistroCuentaDiaria'
import Header from './components/Header'


export default function App() {
  return (
  <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<ListadoDeCuentas />} />
        <Route path="/inicio-sesion" element={<InicioSesion />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/listado-de-cuentas" element={<ListadoDeCuentas />} />
        <Route path="/registro-cuenta-diaria" element={<RegistroCuentaDiaria />} />
      </Routes>
    </BrowserRouter>
  )

}
