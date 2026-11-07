import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { emptyWorkspace, reduceWorkspace, restoreWorkspace, serializeWorkspace } from "../domain/workspace.js";
import { readSession, writeSession, removeSession } from "../services/session.js";

const WorkspaceContext = createContext(null);
export function WorkspaceProvider({ children }) {
  const [state, setState] = useState(() => restoreWorkspace(readSession("workspace-v2")));
  const stateRef = useRef(state);
  const [storageError, setStorageError] = useState(false);
  const transact = useCallback((action) => { const next = reduceWorkspace(stateRef.current, action); stateRef.current = next; setState(next); return next; }, []);
  useEffect(() => { setStorageError(!writeSession("workspace-v2", serializeWorkspace(state))); }, [state]);
  useEffect(() => {
    const draft = readSession("draft-request");
    if (draft?.kind === "preview" && draft.id && !stateRef.current.requests.some((item) => item.id === draft.id)) {
      try { transact({ type: "request/save", role: "shipper", data: draft }); } catch { /* An incomplete older draft remains available in its original form. */ }
    }
  }, [transact]);
  const reset = useCallback(() => { const next = emptyWorkspace(); removeSession("workspace-v2"); removeSession("draft-request"); stateRef.current = next; setState(next); }, []);
  return <WorkspaceContext.Provider value={{ state, transact, storageError, reset }}>{children}</WorkspaceContext.Provider>;
}
export function useWorkspace() { const value = useContext(WorkspaceContext); if (!value) throw new Error("WorkspaceProvider is required"); return value; }
