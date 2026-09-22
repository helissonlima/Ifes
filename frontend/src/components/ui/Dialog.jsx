import * as DialogPrimitive from '@radix-ui/react-dialog';
import { FiX } from 'react-icons/fi';
import { cn } from '../../utils/cn';

export const DialogRoot = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export function DialogOverlay({ className, ...props }) {
  return (
    <DialogPrimitive.Overlay
      className={cn('fixed inset-0 z-50 bg-slate-900/50', className)}
      {...props}
    />
  );
}

export function DialogContent({ className, children, ...props }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          // Mobile: folha de tela cheia. sm+: caixa centralizada.
          'fixed inset-0 z-50 flex w-full flex-col bg-white shadow-xl',
          'sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[85vh] sm:w-[calc(100%-2rem)] sm:max-w-lg',
          'sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:border-slate-200',
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function DialogHeader({ className, ...props }) {
  return (
    <div
      className={cn(
        'flex shrink-0 flex-col gap-1 border-b border-slate-200 px-5 py-4 pr-12',
        className
      )}
      {...props}
    />
  );
}

export function DialogBody({ className, ...props }) {
  return <div className={cn('min-h-0 flex-1 overflow-y-auto px-5 py-4', className)} {...props} />;
}

export function DialogFooter({ className, ...props }) {
  return (
    <div
      className={cn(
        'flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-end',
        className
      )}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }) {
  return (
    <DialogPrimitive.Title
      className={cn('text-base font-bold leading-tight tracking-tight text-slate-900', className)}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }) {
  return (
    <DialogPrimitive.Description className={cn('text-sm text-slate-500', className)} {...props} />
  );
}

export function DialogCloseButton({ className, ...props }) {
  return (
    <DialogPrimitive.Close
      className={cn(
        'absolute right-3 top-3 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caparao-700 focus-visible:ring-offset-2 disabled:pointer-events-none',
        className
      )}
      {...props}
    >
      <FiX className="h-5 w-5" aria-hidden="true" />
      <span className="sr-only">Fechar</span>
    </DialogPrimitive.Close>
  );
}

/**
 * Dialog padrão do sistema: monta overlay, caixa, cabeçalho com título,
 * corpo rolável e rodapé fixo com as ações.
 *
 * O cabeçalho e o rodapé não rolam — só o corpo — para que os botões de
 * ação continuem visíveis em formulários longos (propriedade, usuário).
 */
export default function Dialog({
  open,
  onOpenChange,
  title,
  description,
  footer,
  className,
  bodyClassName,
  children,
  ...props
}) {
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={className}
        aria-describedby={description ? undefined : undefined}
        {...props}
      >
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        <DialogBody className={bodyClassName}>{children}</DialogBody>
        {footer && <DialogFooter>{footer}</DialogFooter>}
        <DialogCloseButton />
      </DialogContent>
    </DialogRoot>
  );
}
