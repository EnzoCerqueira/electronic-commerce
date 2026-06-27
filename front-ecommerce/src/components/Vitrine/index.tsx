import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Vitrine() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const token = localStorage.getItem("meu_token_ecommerce");
        const response = await fetch("http://localhost:3000/produtos", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setProdutos(data);
        }
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    }
    carregarProdutos();
  }, []);

  function handleLogout() {
    localStorage.removeItem("meu_token_ecommerce");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header da Loja */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-emerald-600">
          Loja de Eletrônicos
        </h1>
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
        >
          Sair da Conta
        </button>
      </header>

      {/* Lista de Produtos */}
      <main className="max-w-5xl mx-auto p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Produtos Disponíveis
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {produtos.length > 0 ? (
            produtos.map((produto) => (
              <div
                key={produto.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {produto.nome}
                  </h3>
                  <p className="text-2xl font-bold text-emerald-600 mt-2">
                    R$ {Number(produto.preco).toFixed(2)}
                  </p>
                </div>
                <button className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition-colors cursor-pointer">
                  Comprar
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">
              Nenhum produto cadastrado no momento.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
