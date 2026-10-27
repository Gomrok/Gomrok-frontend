import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useDialog } from "./DialogContext.jsx";
import { Icon } from "./Icon.jsx";

const MobileMenuContext = createContext(null);

export function MobileMenuProvider({ children }) {
  const { openDialog } = useDialog();
  const dialogRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const close = () => setOpen(false);

  return (
    <MobileMenuContext.Provider value={{ open, setOpen, close }}>
      {children}
      <dialog
        id="mobile-menu"
        ref={dialogRef}
        className="mobile-menu"
        onClose={close}
      >
        <div className="mobile-menu-heading">
          <strong>گمرک‌دات‌کام</strong>
          <button
            className="icon-button"
            type="button"
            aria-label="بستن منو"
            onClick={close}
          >
            <Icon name="x" />
          </button>
        </div>
        <nav aria-label="ناوبری موبایل">
          <a href="#main" onClick={close}>
            صفحه اصلی
          </a>
          <a href="#quote" onClick={close}>
            استعلام حمل <Icon name="arrow-left" />
          </a>
          <a href="#customs" onClick={close}>
            ترخیص کالا
          </a>
          <a href="#ai" onClick={close}>
            هوش مصنوعی
          </a>
          <a href="#drivers" onClick={close}>
            رانندگان
          </a>
          <a href="#articles" onClick={close}>
            مقالات
          </a>
        </nav>
        <button
          className="button button-primary"
          type="button"
          onClick={() => {
            close();
            openDialog(
              "ورود به حساب",
              "این نما، پیش‌نمایش مسیر ورود است. ورود واقعی و دریافت اطلاعات حساب در این نمونهٔ طراحی فعال نیست.",
            );
          }}
        >
          ورود به حساب
        </button>
      </dialog>
    </MobileMenuContext.Provider>
  );
}

export function MobileMenuToggle({ className, ...props }) {
  const context = useContext(MobileMenuContext);
  if (!context) return null;

  return (
    <button
      {...props}
      type="button"
      className={className}
      aria-expanded={context.open}
      onClick={() => context.setOpen(true)}
    >
      <Icon name="menu" />
    </button>
  );
}

export function useMobileMenu() {
  const context = useContext(MobileMenuContext);
  return context || { close: () => {} };
}
