interface QuitConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function QuitConfirmDialog({
  onConfirm,
  onCancel,
}: QuitConfirmDialogProps) {
  return (
    <div className="quit-confirm-overlay">
      <div className="quit-confirm-dialog">
        <h2>Quit Workout?</h2>
        <p>Your progress will be lost</p>
        <div className="quit-confirm-buttons">
          <button className="confirm-yes" onClick={onConfirm}>
            Yes, Quit
          </button>
          <button className="confirm-no" onClick={onCancel}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
