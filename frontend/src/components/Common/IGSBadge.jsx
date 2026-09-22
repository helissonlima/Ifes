import { COR_CLASSIFICACAO, COR_CLASSIFICACAO_TEXTO_SOBRE_FUNDO } from '../../utils/coresICSR';
import { formatarPercentual } from '../../utils/formatarNumero';
import { cn } from '../../utils/cn';

export default function IGSBadge({ classificacao, igs, size = 'medium', className }) {
  if (!classificacao) return null;

  const bgColor = COR_CLASSIFICACAO[classificacao] || '#9E9E9E';
  const textColor = COR_CLASSIFICACAO_TEXTO_SOBRE_FUNDO[classificacao] || '#ffffff';

  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-2.5 py-1 text-xs font-bold',
    large: 'px-3 py-1.5 text-sm font-bold',
  };

  return (
    <span
      style={{ backgroundColor: bgColor, color: textColor }}
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full font-bold shadow-xs transition-colors',
        sizeClasses[size] || sizeClasses.medium,
        className
      )}
    >
      {classificacao}
      {igs !== undefined ? ` (${formatarPercentual(igs)})` : ''}
    </span>
  );
}
