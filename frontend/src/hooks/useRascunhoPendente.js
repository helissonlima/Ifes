import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { temRascunhoLocal } from '../utils/avaliacaoCache';

/**
 * Indica se o usuário logado tem um rascunho de avaliação salvo localmente
 * (ver utils/avaliacaoCache.js) ainda não sincronizado com o servidor —
 * NovaAvaliacao.jsx só limpa o rascunho ao concluir/descartar com sucesso,
 * então "existe rascunho com conteúdo" já equivale a "pendente de sync".
 *
 * Leitura direta do localStorage a cada render (sem state/effect): é síncrona
 * e barata, e o Navbar (de onde isso é chamado) não remonta com a troca de
 * rota, então só re-renderiza quando algo muda — por isso o useLocation()
 * aqui, só pra assinar esse gatilho (não usamos o valor em si). Não é tempo
 * real dentro da MESMA tela (localStorage não dispara evento na aba que
 * escreveu), só recalcula a cada navegação — suficiente pra um lembrete.
 */
export function useRascunhoPendente() {
  const { user } = useApp();
  useLocation();
  return user?.id ? temRascunhoLocal(user.id) : false;
}
