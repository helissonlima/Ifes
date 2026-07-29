import { useRef, useState } from 'react';
import {
  Card, CardContent, Typography, Button, Box, Alert, Divider, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress,
} from '@mui/material';
import { FiDownload, FiUpload, FiDatabase, FiAlertTriangle } from 'react-icons/fi';
import { backupAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { friendlyError } from '../../utils/errorMessages';

const PALAVRA_CONFIRMACAO = 'RESTAURAR';

const ROTULOS = {
  usuarios: 'usuários',
  propriedades: 'propriedades',
  graos: 'grãos',
  propriedades_graos: 'grãos por propriedade',
  avaliacoes: 'avaliações',
  respostas_indicadores: 'respostas de indicadores',
};

// Só as tabelas com registros — listar meia dúzia de zeros só polui a mensagem.
const resumo = (totais = {}) => {
  const partes = Object.entries(totais)
    .filter(([, n]) => n > 0)
    .map(([tabela, n]) => `${n} ${ROTULOS[tabela] || tabela}`);
  return partes.length ? partes.join(' · ') : 'nenhum registro';
};

// Timestamp local no nome do arquivo (ex.: backup-sustentacafe-2026-07-29_1432.json)
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
  const [dialogo, setDialogo] = useState(null); // { arquivo, conteudo }
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
    e.target.value = ''; // permite reselecionar o mesmo arquivo depois
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
      // Os usuários do banco foram substituídos: a sessão atual pode não
      // existir mais, então volta pro login em vez de falhar tela a tela.
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
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <FiDatabase size={18} />
            <Typography variant="subtitle1" fontWeight={700}>Backup e restauração</Typography>
            <Chip label="Somente admin" size="small" sx={{ bgcolor: '#FFEBEE', color: '#C62828', fontWeight: 700 }} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Baixe um arquivo com todos os dados do sistema (usuários, propriedades, grãos,
            avaliações e respostas) ou restaure o sistema a partir de um backup anterior.
          </Typography>

          {erroArquivo && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErroArquivo('')}>{erroArquivo}</Alert>}

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="contained" startIcon={<FiDownload />}
              onClick={exportar} disabled={exportando}
            >
              {exportando ? 'Gerando backup...' : 'Baixar backup completo'}
            </Button>
            <Button
              variant="outlined" color="warning" startIcon={<FiUpload />}
              onClick={() => inputRef.current?.click()} disabled={restaurando}
            >
              Restaurar de um arquivo
            </Button>
            <input
              ref={inputRef} type="file" accept="application/json,.json"
              onChange={selecionarArquivo} hidden
              aria-label="Selecionar arquivo de backup para restaurar"
            />
          </Box>

          <Divider sx={{ my: 2 }} />
          <Alert severity="warning" icon={<FiAlertTriangle />}>
            A restauração <strong>apaga todos os dados atuais</strong> e os substitui pelos do
            arquivo. Gere um backup do estado atual antes de restaurar.
          </Alert>
        </CardContent>
      </Card>

      {/* ========= Confirmação de restauração ========= */}
      <Dialog open={Boolean(dialogo)} onClose={() => !restaurando && setDialogo(null)} fullWidth maxWidth="sm">
        <DialogTitle fontWeight={700} color="error">Restaurar backup</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Arquivo: <strong>{dialogo?.arquivo?.name}</strong>
          </Typography>
          {dialogo?.conteudo?.gerado_em && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Gerado em {new Date(dialogo.conteudo.gerado_em).toLocaleString('pt-BR')}
              {dialogo.conteudo.gerado_por ? ` por ${dialogo.conteudo.gerado_por}` : ''}
            </Typography>
          )}
          {totaisArquivo && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Conteúdo: {resumo(totaisArquivo)}.
            </Typography>
          )}

          <Alert severity="error" sx={{ mb: 2 }}>
            Todos os dados atuais do sistema serão apagados e substituídos. Esta ação
            não pode ser desfeita.
          </Alert>

          <TextField
            fullWidth autoFocus
            label={`Digite ${PALAVRA_CONFIRMACAO} para confirmar`}
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            disabled={restaurando}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDialogo(null)} disabled={restaurando}>Cancelar</Button>
          <Button
            variant="contained" color="error" onClick={restaurar}
            disabled={restaurando || confirmacao.trim().toUpperCase() !== PALAVRA_CONFIRMACAO}
          >
            {restaurando ? <CircularProgress size={20} /> : 'Restaurar agora'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
