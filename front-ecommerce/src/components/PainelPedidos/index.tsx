import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export interface Pedido {
  numero_pedido: number;
  comprador: string;
  produto_comprado: string;
  quantidade: number;
  preco_unitario: number;
  valor_total: number;
}

export default function PainelPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);
  const navigate = useNavigate();

  const [openModal, setOpenModal] = useState(false);
  const [openModalProduto, setOpenModalProduto] = useState(false);

  const [nomeProd, setNomeProd] = useState("");
  const [precoProd, setPrecoProd] = useState("");

  const [idUsuario, setIdUsuario] = useState("");
  const [idProduto, setIdProduto] = useState("");
  const [quantidade, setQuantidade] = useState("");

  const [listaUsuarios, setListaUsuarios] = useState<any[]>([]);
  const [listaProdutos, setListaProdutos] = useState<any[]>([]);

  const inputStyle =
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all";

  async function carregarDados() {
    try {
      const token = localStorage.getItem("meu_token_ecommerce");

      if (!token) {
        navigate("/login");
        return;
      }
      const response = await fetch("http://localhost:3000/pedidos", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(
          "Falha ao buscar pedidos. O token pode estar expirado ou o servidor desligado.",
        );
      }

      const data: Pedido[] = await response.json();

      setPedidos(data);
      setErro(null);
    } catch (err: any) {
      setErro(err.message);
      navigate("/login");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
    carregarFiltros();
  }, []);

  async function handleCadastrarProduto(e: React.FormEvent) {
    e.preventDefault();

    try {
      const token = localStorage.getItem("meu_token_ecommerce");
      const response = await fetch("http://localhost:3000/produtos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: nomeProd,
          preco: Number(precoProd),
          estoque: 10,
          id_loja: 3,
        }),
      });

      if (response.ok) {
        alert("Produto cadastrado com sucesso!");
        setOpenModalProduto(false);
        setNomeProd("");
        setPrecoProd("");
        carregarFiltros();
      }
    } catch (err) {
      console.error("Erro ao cadastrar produto:", err);
      alert(
        "Erro ao cadastrar produto. Verifique o console para mais detalhes.",
      );
    }
  }

  const carregarFiltros = async () => {
    try {
      const token = localStorage.getItem("meu_token_ecommerce");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      const resUsuarios = await fetch("http://localhost:3000/usuarios", {
        headers,
      });
      if (resUsuarios.ok) {
        const dataUsuarios = await resUsuarios.json();
        setListaUsuarios(dataUsuarios);
      }

      const resProdutos = await fetch("http://localhost:3000/produtos", {
        headers,
      });
      if (resProdutos.ok) {
        const dataProdutos = await resProdutos.json();
        setListaProdutos(dataProdutos);
      }
    } catch (err) {
      console.error("Erro ao carregar filtros:", err);
    }
  };

  function logout() {
    localStorage.removeItem("meu_token_ecommerce");
    navigate("/login");
  }

  async function salvarPedido(e: React.FormEvent) {
    e.preventDefault();

    try {
      const token = localStorage.getItem("meu_token_ecommerce");

      const novoPedido = {
        id_usuario: Number(idUsuario),
        id_produto: Number(idProduto),
        quantidade: Number(quantidade),
      };

      const response = await fetch("http://localhost:3000/pedidos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(novoPedido),
      });

      if (!response.ok) {
        throw new Error("Falha ao salvar pedido.");
      }
      setOpenModal(false);
      carregarDados();

      setIdUsuario("");
      setIdProduto("");
      setQuantidade("");
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (carregando) {
    return (
      <div className="flex justify-center p-10 text-xl font-bold text-gray-600">
        Carregando pedidos do servidor...
      </div>
    );
  }

  if (erro) {
    return (
      <div className="p-4 m-4 text-red-700 bg-red-100 rounded-lg font-medium">
        {erro}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 tracking-tight">
          Histórico de Pedidos
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setOpenModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg shadow-sm transition-colors duration-200 cursor-pointer"
          >
            Novo Pedido
          </button>
          <button
            onClick={() => setOpenModalProduto(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg shadow-sm transition-colors duration-200 cursor-pointer"
          >
            Novo Produto
          </button>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg shadow-sm transition-colors duration-200 cursor-pointer"
          >
            Sair
          </button>
        </div>
      </div>
      {carregando ? (
        <div className="bg-white shadow-xl rounded-xl p-10 text-center border border-gray-100">
          <p>Buscando pedidos no servidor...</p>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="bg-white shadow-xl rounded-xl p-10 text-center border border-gray-100">
          <p className="text-gray-500 text-lg font-medium">
            Nenhum pedido encontrado no momento.
          </p>
          <p>Assim que novas vendas ocorrerem, elas aparecerão aqui.</p>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-5 text-left font-semibold text-gray-600 uppercase text-sm tracking-wider">
                  Pedido
                </th>
                <th className="p-5 text-left font-semibold text-gray-600 uppercase text-sm tracking-wider">
                  Comprador
                </th>
                <th className="p-5 text-left font-semibold text-gray-600 uppercase text-sm tracking-wider">
                  Produto
                </th>
                <th className="p-5 text-center font-semibold text-gray-600 uppercase text-sm tracking-wider">
                  Qtd
                </th>
                <th className="p-5 text-right font-semibold text-gray-600 uppercase text-sm tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pedidos.map((pedido) => (
                <tr
                  key={pedido.numero_pedido}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="p-5 text-gray-800 font-medium">
                    #{pedido.numero_pedido}
                  </td>
                  <td className="p-5 text-gray-600">{pedido.comprador}</td>
                  <td className="p-5 text-gray-600">
                    {pedido.produto_comprado}
                  </td>
                  <td className="p-5 text-center text-gray-600 font-medium">
                    <span className="bg-gray-100 px-3 py-1 rounded-full">
                      {pedido.quantidade}
                    </span>
                  </td>
                  <td className="p-5 text-right font-bold text-emerald-600">
                    {Number(pedido.valor_total).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {openModalProduto && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Cadastrar Produto</h2>

            <form onSubmit={handleCadastrarProduto} className="space-y-4">
              <input
                className={inputStyle}
                placeholder="Nome do Produto"
                value={nomeProd}
                onChange={(e) => setNomeProd(e.target.value)}
                required
              />
              <input
                className={inputStyle}
                type="number"
                step="0.01"
                placeholder="Preço"
                value={precoProd}
                onChange={(e) => setPrecoProd(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpenModalProduto(false)}
                  className="px-4 py-2 text-gray-600 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg cursor-pointer"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {openModal && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Cadastrar Novo Pedido
            </h2>

            <form onSubmit={salvarPedido} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Comprador
                </label>
                <select
                  value={idUsuario}
                  onChange={(e) => setIdUsuario(e.target.value)}
                  className="suas-classes-css-aqui" // Mantenha as classes que você usava no input
                >
                  <option value="">Selecione um cliente...</option>
                  {listaUsuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produto
                </label>
                <select
                  value={idProduto}
                  onChange={(e) => setIdProduto(e.target.value)}
                  className="suas-classes-css-aqui"
                >
                  <option value="">Selecione um produto...</option>
                  {listaProdutos.map((produto) => (
                    <option key={produto.id} value={produto.id}>
                      {produto.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    required
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition-colors cursor-pointer"
                >
                  Salvar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
