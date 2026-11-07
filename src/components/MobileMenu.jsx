import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Icon } from "./Icon.jsx";
import { HOME_SECTION_ORDER } from "../config/platform.js";

const MobileMenuContext = createContext(null);

export function MobileMenuProvider({ children }) {
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
        aria-label="منوی ناوبری"
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
          {HOME_SECTION_ORDER.map((id) => <a href={`#${id}`} key={id} onClick={close}>{id === "ai" ? "هوش مصنوعی" : "ترخیص کالا"}</a>)}
          <a href="#market" onClick={close}>نبض بازار</a>
          <a href="#drivers" onClick={close}>
            رانندگان
          </a>
          <a href="#articles" onClick={close}>
            مقالات
          </a>
        </nav>
        <a
          className="button button-primary"
          href="?view=login"
          onClick={close}
        >
          ورود به حساب
        </a>
        <a className="button button-outline" href="?view=signup" onClick={close}>انتخاب نقش و ثبت‌نام</a>
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
