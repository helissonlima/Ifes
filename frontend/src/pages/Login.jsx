import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { MdOutlineEco } from 'react-icons/md';
import { FiLock, FiMail } from 'react-icons/fi';
import { friendlyError } from '../utils/errorMessages';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import loginBg from '../assets/login-bg.png';

export default function Login() {
  const navigate = useNavigate();
  const { login, notify, isAuthenticated } = useApp();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, senha);
      notify('Login realizado com sucesso!', 'success');
      navigate('/', { replace: true });
    } catch (err) {
      notify(friendlyError(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
      style={{
        backgroundImage: `linear-gradient(rgba(9, 30, 14, 0.52), rgba(9, 30, 14, 0.42)), radial-gradient(circle at top, rgba(76,175,80,0.25), transparent 40%), url(${loginBg})`,
      }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-2xl p-6 sm:p-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#1B4D24] text-white flex items-center justify-center shadow-md mb-3">
            <MdOutlineEco size={26} />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            SustentaCafé
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Instrumento digital de avaliação do ICSR · IFES
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block" htmlFor="email-input">
              E-mail
            </label>
            <Input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@ifes.edu.br"
              required
              autoComplete="email"
              startAdornment={<FiMail size={16} />}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block" htmlFor="senha-input">
              Senha
            </label>
            <Input
              id="senha-input"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              startAdornment={<FiLock size={16} />}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2 cursor-pointer font-bold"
            loading={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>

          <p className="text-[11px] text-slate-400 text-center leading-relaxed pt-2">
            Em caso de falha de acesso, confirme sua conexão e as permissões do seu perfil junto à administração.
          </p>
        </form>
      </div>
    </div>
  );
}
