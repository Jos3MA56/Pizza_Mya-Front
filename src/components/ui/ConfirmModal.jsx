import Modal from "./Modal.jsx";
import Button from "./Button.jsx";

export default function ConfirmModal({
  open,
  title = "Confirmar acción",
  message = "¿Deseas continuar?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmVariant = "danger",
  loading = false,
  loadingText = "Procesando...",
  onConfirm,
  onClose,
}) {
  return (
    <Modal open={open} title={title} onClose={onClose} size="sm">
      <div>
        <p
          style={{
            margin: 0,
            color: "#475569",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 24,
          }}
        >
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>

          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            loading={loading}
            loadingText={loadingText}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
