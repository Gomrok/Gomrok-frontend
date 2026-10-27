import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Icon } from "./Icon.jsx";

const DialogContext = createContext(null);

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const value = {
    openDialog: (title, body, actions = []) =>
      setDialog({ title, body, actions }),
    closeDialog: () => setDialog(null),
  };

  return (
    <DialogContext.Provider value={value}>
      {children}
      <DesignDialog dialog={dialog} onClose={value.closeDialog} />
    </DialogContext.Provider>
  );
}

function DesignDialog({ dialog, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (dialog && !node.open) node.showModal();
    if (!dialog && node.open) node.close();
  }, [dialog]);

  return (
    <dialog
      ref={dialogRef}
      id="design-dialog"
      className="design-dialog"
      aria-labelledby="dialog-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dialog-top">
        <span className="demo-badge">پیش‌نمایش طراحی</span>
        <button
          className="icon-button"
          type="button"
          aria-label="بستن پنجره"
          onClick={onClose}
        >
          <Icon name="x" />
        </button>
      </div>
      {dialog && (
        <div id="dialog-body">
          <h2 id="dialog-title" className="dialog-title">
            {dialog.title}
          </h2>
          {typeof dialog.body === "string" ? (
            <p className="dialog-copy">{dialog.body}</p>
          ) : (
            dialog.body
          )}
          {!!dialog.actions?.length && (
            <div className="dialog-actions">
              {dialog.actions.map((action) => (
                <a
                  key={action.href + action.label}
                  className={`button ${action.primary ? "button-primary" : "button-outline"}`}
                  href={action.href}
                  onClick={onClose}
                >
                  {action.label}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) throw new Error("useDialog must be used inside DialogProvider");
  return context;
}
