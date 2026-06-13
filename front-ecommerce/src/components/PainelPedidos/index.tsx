import React, { useEffect, useState } from 'react'

export interface Pedido{
    numero_pedido: number;
    comprador: string;
    produto_comprado: string;
    quantidade: number;
    preco_unitario: number;
    valor_total: number;
}

export default function PainelPedidos(){
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [carregando, setCarregando] = useState<boolean>(true);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        async function carregarDados(){
            try{
                const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwidGlwbyI6ImNvbXByYWRvciIsImlhdCI6MTc4MTM3NzY2MiwiZXhwIjoxNzgxNDY0MDYyfQ.fgCRVeoENpHDaVyUs1SfGaMSPlbQisMNovwWIHCVJno";

                const response = await fetch('http://localhost:3000/pedidos', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                if(!response.ok){
                    throw new Error('Falha ao buscar pedidos. O token pode estar expirado ou o servidor desligado.');
                }

                const data: Pedido[] = await response.json();

                setPedidos(data);
                setErro(null);
            }catch(err: any){
                setErro(err.message);
            }finally{
                setCarregando(false);
            }
        }
        carregarDados();
    }, [])

  if (carregando) {
        return <div className="flex justify-center p-10 text-xl font-bold text-gray-600">Carregando pedidos do servidor...</div>;
    }

    if (erro) {
        return <div className="p-4 m-4 text-red-700 bg-red-100 rounded-lg font-medium">{erro}</div>;
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 tracking-tight">Histórico de Pedidos</h1>
            
            <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
                <table className="min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-5 text-left font-semibold text-gray-600 uppercase text-sm tracking-wider">Pedido</th>
                            <th className="p-5 text-left font-semibold text-gray-600 uppercase text-sm tracking-wider">Comprador</th>
                            <th className="p-5 text-left font-semibold text-gray-600 uppercase text-sm tracking-wider">Produto</th>
                            <th className="p-5 text-center font-semibold text-gray-600 uppercase text-sm tracking-wider">Qtd</th>
                            <th className="p-5 text-right font-semibold text-gray-600 uppercase text-sm tracking-wider">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {pedidos.map((pedido) => (
                            <tr key={pedido.numero_pedido} className="hover:bg-gray-50 transition-colors duration-200">
                                <td className="p-5 text-gray-800 font-medium">#{pedido.numero_pedido}</td>
                                <td className="p-5 text-gray-600">{pedido.comprador}</td>
                                <td className="p-5 text-gray-600">{pedido.produto_comprado}</td>
                                <td className="p-5 text-center text-gray-600 font-medium">
                                    <span className="bg-gray-100 px-3 py-1 rounded-full">{pedido.quantidade}</span>
                                </td>
                                <td className="p-5 text-right font-bold text-emerald-600">
                                    {Number(pedido.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
