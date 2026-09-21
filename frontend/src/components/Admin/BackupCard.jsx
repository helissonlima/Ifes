import { useRef, useState } from 'react';
import { FiDownload, FiUpload, FiDatabase, FiAlertTriangle } from 'react-icons/fi';
import { backupAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { friendlyError } from '../../utils/errorMessages';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Badge from '../ui/Badge';
import Dialog from '../ui/Dialog';

const PALAVRA_CONFIRMACAO = 'RESTAURAR';

const ROTULOS = {
  usuarios: 'usuários',
  propriedades: 'propriedades',
  graos: 'grãos',
  propriedades_graos: 'grãos por propriedade',
  avaliacoes: 'avaliações',
  respostas_indicadores: 'respostas de indicadores',
};

const resumo = (totais = {}) => {
  const partes = Object.entries(totais)
    .filter(([, n]) => n > 0)
    .map(([tabela, n]) => `${n} ${ROTULOS[tabela] || tabela}`);
  return partes.length ? partes.join(' · ') : 'nenhum registro';
};

function nomeArquivo() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `backup-sustentacafe-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}.json`;
}

export default function BackupCard({ onRestaurado }) {
  const { notify, logout } = useApp();
  const inputRef = useRef(null);

  const [exportando, setExportando] = useState(false);
  const [restaurando, setRestaurando] = useState(false);
  const [dialogo, setDialogo] = useState(null);
  const [confirmacao, setConfirmacao] = useState('');
  const [erroArquivo, setErroArquivo] = useState('');

  const exportar = async () => {
    setExportando(true);
    try {
      const { data } = await backupAPI.exportar();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nomeArquivo();
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      notify(`Backup gerado: ${resumo(data.totais)}.`);
    } catch (err) {
      notify(friendlyError(err), 'error');
    } finally {
      setExportando(false);
    }
  };

  const selecionarArquivo = async (e) => {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    if (!arquivo) return;

    setErroArquivo('');
    try {
      const conteudo = JSON.parse(await arquivo.text());
      if (conteudo?.formato !== 'sustentacafe-backup') {
        setErroArquivo('Este arquivo não é um backup do SustentaCafé.');
        return;
      }
      setConfirmacao('');
      setDialogo({ arquivo, conteudo });
    } catch {
      setErroArquivo('Arquivo inválido: não foi possível ler o JSON do backup.');
    }
  };

  const restaurar = async () => {
    setRestaurando(true);
    try {
      const { data } = await backupAPI.restaurar(dialogo.conteudo);
      setDialogo(null);
      notify(`Backup restaurado: ${resumo(data.totais)}. Faça login novamente.`);
      onRestaurado?.();
      setTimeout(logout, 1500);
    } catch (err) {
      notify(friendlyError(err), 'error');
    } finally {
      setRestaurando(false);
    }
  };

  const totaisArquivo = dialogo?.conteudo?.totais;

  return (
    <>
      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FiDatabase className="h-5 w-5 text-caparao-700" />
            <CardTitle className="text-base font-bold text-slate-900">
              Backup e restauração
            </CardTitle>
            <Badge variant="danger" size="sm">
              Somente admin
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Baixe um arquivo com todos os dados do sistema ou restaure o sistema a partir de um backup anterior.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {erroArquivo && (
            <Alert variant="error">
              {erroArquivo}
            </Alert>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              icon={<FiDownload />}
              loading={exportando}
              onClick={exportar}
            >
              Baixar backup completo
            </Button>
            <Button
              variant="secondary"
              icon={<FiUpload />}
              disabled={restaurando}
              onClick={() => inputRef.current?.click()}
            >
              Restaurar de um arquivo
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept="application/json,.json"
              onChange={selecionarArquivo}
              hidden
              aria-label="Selecionar arquivo de backup para restaurar"
            />
          </div>

          <div className="border-t border-slate-100 pt-4">
            <Alert variant="warning" icon={<FiAlertTriangle className="h-4 w-4" />}>
              A restauração <strong>apaga todos os dados atuais</strong> e os substitui pelos do arquivo.
              Gere um backup do estado atual antes de restaurar.
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Confirmação de restauração */}
      <Dialog
        open={Boolean(dialogo)}
        onOpenChange={(open) => !open && !restaurando && setDialogo(null)}
        title="Restaurar backup"
        className="max-w-md"
        footer={
          <div className="flex w-full items-center justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setDialogo(null)}
              disabled={restaurando}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={restaurar}
              loading={restaurando}
              disabled={restaurando || confirmacao.trim().toUpperCase() !== PALAVRA_CONFIRMACAO}
            >
              Restaurar agora
            </Button>
          </div>
        }
      >
        <div className="space-y-3 py-1 text-xs">
          <p className="text-slate-700">
            Arquivo: <strong className="text-slate-900">{dialogo?.arquivo?.name}</strong>
          </p>
          {dialogo?.conteudo?.gerado_em && (
            <p className="text-slate-500">
              Gerado em {new Date(dialogo.conteudo.gerado_em).toLocaleString('pt-BR')}
              {dialogo.conteudo.gerado_por ? ` por ${dialogo.conteudo.gerado_por}` : ''}
            </p>
          )}
          {totaisArquivo && (
            <p className="text-slate-500">
              Conteúdo: {resumo(totaisArquivo)}.
            </p>
          )}

          <Alert variant="error">
            Todos os dados atuais do sistema serão apagados e substituídos. Esta ação não pode ser desfeita.
          </Alert>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Digite {PALAVRA_CONFIRMACAO} para confirmar:
            </label>
            <input
              type="text"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              disabled={restaurando}
              placeholder={PALAVRA_CONFIRMACAO}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs font-mono uppercase focus:border-red-600 focus:outline-hidden"
              autoFocus
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}
