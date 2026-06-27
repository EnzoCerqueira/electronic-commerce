import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import PainelPedidos from "./components/PainelPedidos";
import CadastroCliente from "./components/CadastroCliente";
import Vitrine from "./components/Vitrine";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/pedidos" element={<PainelPedidos />} />
        <Route path="/cadastro" element={<CadastroCliente />} />
        <Route path="/" element={<Vitrine />} />
      </Routes>
    </BrowserRouter>
  );
}
