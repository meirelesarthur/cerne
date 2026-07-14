import { useState } from 'react'

/**
 * Extraído do padrão já usado em `EstoqueInicialForm.tsx` (isDirty +
 * showExitModal + ConfirmDialog) — evita descartar dados preenchidos sem
 * aviso ao fechar/cancelar um formulário.
 *
 * Uso:
 *   const guard = useUnsavedChangesGuard(onBack)
 *   // marcar sujo no onChange dos campos:
 *   guard.setIsDirty(true)
 *   // no botão de fechar/cancelar:
 *   <FormPageHeader onBack={guard.guardedBack} .../>
 *   // no fim do JSX:
 *   <ConfirmDialog
 *     open={guard.showExitModal}
 *     title="Alterações não salvas"
 *     message="Você tem alterações não salvas. Deseja sair sem salvar?"
 *     tone="destructive"
 *     confirmLabel="Sair sem salvar"
 *     cancelLabel="Ficar"
 *     onConfirm={guard.confirmExit}
 *     onCancel={guard.cancelExit}
 *   />
 */
export function useUnsavedChangesGuard(onBack: () => void) {
  const [isDirty, setIsDirty] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)

  const guardedBack = () => {
    if (isDirty) { setShowExitModal(true); return }
    onBack()
  }

  const confirmExit = () => { setShowExitModal(false); onBack() }
  const cancelExit = () => setShowExitModal(false)

  return { isDirty, setIsDirty, showExitModal, guardedBack, confirmExit, cancelExit }
}
