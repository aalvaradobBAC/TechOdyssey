import { useState, type FormEvent } from "react";
import {
  GamificationApiError,
  login,
  logout,
  recoverAdminAccount,
  register,
  resetUserPassword,
  type AuthResponse,
} from "./gamification-api";

type Props = {
  session: AuthResponse | null;
  loadingSession: boolean;
  sessionError: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSessionChange: (session: AuthResponse | null) => void;
  onAuthenticated: () => Promise<void>;
};

type AuthMode = "login" | "register" | "adminRecovery";

function describeError(error: unknown): string {
  if (error instanceof GamificationApiError) {
    if (error.status === 401) return "El email o la contraseña no son correctos.";
    if (error.status === 409) return "Ya existe una cuenta con ese email.";
    if (error.status === 429) return "Demasiados intentos. Espera un minuto y vuelve a probar.";
    if (error.status === 403) return "La clave secreta de administrador no es válida.";
    if (error.status === 404) return "No se encontró la cuenta administradora configurada.";
    if (error.status === 503) return "El administrador aún no está configurado en el servidor.";
    if (error.status >= 500) return "El servicio no está disponible. Inténtalo más tarde.";
    return error.message;
  }

  return error instanceof Error
    ? `No se pudo conectar con la API: ${error.message}`
    : "No se pudo conectar con la API.";
}

export default function GamificationAccountPanel({
  session,
  loadingSession,
  sessionError,
  open,
  onOpenChange,
  onSessionChange,
  onAuthenticated,
}: Props) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [resetSecret, setResetSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resetFormOpen, setResetFormOpen] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resettingPassword, setResettingPassword] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatusMessage(null);
    setSubmitting(true);

    try {
      if (mode === "adminRecovery") {
        if (password !== confirmedPassword) {
          setError("Las contraseñas nuevas no coinciden.");
          return;
        }

        const result = await recoverAdminAccount(password, resetSecret);
        setEmail(result.email);
        setPassword("");
        setConfirmedPassword("");
        setResetSecret("");
        setMode("login");
        setStatusMessage("Clave administradora actualizada. Inicia sesión con la nueva clave.");
        return;
      }

      const profile = mode === "register"
        ? await register(email, password)
        : await login(email, password);
      onSessionChange(profile);
      setPassword("");
      setStatusMessage(null);
      onOpenChange(false);
      await onAuthenticated();
    } catch (submitError) {
      setError(describeError(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  const signOut = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await logout();
      onSessionChange(null);
    } catch (logoutError) {
      if (logoutError instanceof GamificationApiError && logoutError.status === 401) {
        onSessionChange(null);
      } else {
        setError(describeError(logoutError));
      }
    } finally {
      setResetSecret("");
      setNewPassword("");
      setConfirmedPassword("");
      setResetFormOpen(false);
      setSubmitting(false);
    }
  };

  const resetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResetError(null);
    setResetMessage(null);

    if (newPassword !== confirmedPassword) {
      setResetError("Las contraseñas nuevas no coinciden.");
      return;
    }

    setResettingPassword(true);
    try {
      await resetUserPassword(targetEmail, newPassword, resetSecret);
      setTargetEmail("");
      setNewPassword("");
      setConfirmedPassword("");
      setResetSecret("");
      setResetMessage("Clave actualizada. El nivel y los puntos del usuario se conservaron.");
    } catch (resetFailure) {
      if (resetFailure instanceof GamificationApiError && resetFailure.status === 403) {
        setResetError("No se autorizó el reset. Verifica la sesión administradora y la clave secreta.");
      } else if (resetFailure instanceof GamificationApiError && resetFailure.status === 404) {
        setResetError("No existe una cuenta con ese email.");
      } else if (resetFailure instanceof GamificationApiError && resetFailure.status === 503) {
        setResetError("El administrador aún no está configurado en el servidor.");
      } else {
        setResetError(describeError(resetFailure));
      }
    } finally {
      setResettingPassword(false);
    }
  };

  if (loadingSession) {
    return <div className="gamificationAccountStatus">Cargando cuenta…</div>;
  }

  if (session) {
    return (
      <div className="gamificationAccountStatus">
        <div className="accountProfile">
          <div>
            <strong>{session.email}</strong>
            <span>Nivel {session.level} · {session.experiencePoints} XP</span>
          </div>
          <button
            className="accountActionButton"
            type="button"
            disabled={submitting}
            onClick={signOut}
          >
            Cerrar sesión
          </button>
        </div>
        {session.canResetPasswords && (
          <div className="adminResetControls">
            <button
              className="accountModeButton"
              type="button"
              aria-expanded={resetFormOpen}
              onClick={() => {
                setResetFormOpen((isOpen) => !isOpen);
                setResetError(null);
                setResetMessage(null);
              }}
            >
              Restablecer clave de otro usuario
            </button>
            {resetFormOpen && (
              <form className="accountForm adminResetForm" onSubmit={resetPassword}>
                <strong>Restablecer contraseña</strong>
                <label>
                  Email de la cuenta
                  <input
                    autoComplete="email"
                    type="email"
                    required
                    maxLength={254}
                    value={targetEmail}
                    onChange={(event) => setTargetEmail(event.target.value)}
                  />
                </label>
                <label>
                  Nueva contraseña
                  <input
                    autoComplete="new-password"
                    type="password"
                    required
                    minLength={12}
                    maxLength={128}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                  />
                </label>
                <label>
                  Confirmar contraseña
                  <input
                    autoComplete="new-password"
                    type="password"
                    required
                    minLength={12}
                    maxLength={128}
                    value={confirmedPassword}
                    onChange={(event) => setConfirmedPassword(event.target.value)}
                  />
                </label>
                <label>
                  Clave secreta de administrador
                  <input
                    autoComplete="off"
                    type="password"
                    required
                    value={resetSecret}
                    onChange={(event) => setResetSecret(event.target.value)}
                  />
                </label>
                {resetError && <p className="accountError" role="alert">{resetError}</p>}
                {resetMessage && <p className="accountSuccess" role="status">{resetMessage}</p>}
                <button
                  className="accountSubmitButton"
                  type="submit"
                  disabled={resettingPassword}
                >
                  {resettingPassword ? "Actualizando…" : "Actualizar clave"}
                </button>
                <small>
                  La clave secreta se valida en el servidor y no se guarda en el navegador.
                  La nueva contraseña debe tener entre 12 y 128 caracteres.
                </small>
              </form>
            )}
          </div>
        )}
        {error && <span className="accountError" role="alert">{error}</span>}
      </div>
    );
  }

  return (
    <div className="gamificationAccount">
      <button
        className="accountActionButton"
        type="button"
        aria-expanded={open}
        onClick={() => {
          if (open) {
            setPassword("");
            setConfirmedPassword("");
            setResetSecret("");
            setError(null);
          }
          onOpenChange(!open);
        }}
      >
        {open ? "Cerrar acceso" : "Iniciar sesión"}
      </button>

      {open && (
        <form className="accountForm" onSubmit={submit}>
          <strong>
            {mode === "register"
              ? "Crear cuenta"
              : mode === "adminRecovery"
                ? "Recuperar cuenta administradora"
                : "Iniciar sesión"}
          </strong>
          {mode !== "adminRecovery" && (
            <label>
              Email
              <input
                autoComplete="email"
                type="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
          )}
          <label>
            {mode === "adminRecovery" ? "Nueva contraseña" : "Contraseña"}
            <input
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              type="password"
              required
              minLength={12}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {mode === "adminRecovery" && (
            <>
              <label>
                Confirmar nueva contraseña
                <input
                  autoComplete="new-password"
                  type="password"
                  required
                  minLength={12}
                  maxLength={128}
                  value={confirmedPassword}
                  onChange={(event) => setConfirmedPassword(event.target.value)}
                />
              </label>
              <label>
                Clave secreta de administrador
                <input
                  autoComplete="off"
                  type="password"
                  required
                  minLength={32}
                  value={resetSecret}
                  onChange={(event) => setResetSecret(event.target.value)}
                />
              </label>
              <small>
                Se recuperará el email administrador configurado en el servidor.
                La clave secreta no se guarda en el navegador.
              </small>
            </>
          )}
          {sessionError && <p className="accountError" role="alert">{sessionError}</p>}
          {error && <p className="accountError" role="alert">{error}</p>}
          {statusMessage && <p className="accountSuccess" role="status">{statusMessage}</p>}
          <button className="accountSubmitButton" type="submit" disabled={submitting}>
            {submitting
              ? "Procesando…"
              : mode === "adminRecovery"
                ? "Recuperar cuenta"
                : mode === "register"
                  ? "Crear cuenta"
                  : "Entrar"}
          </button>
          {mode === "adminRecovery" ? (
            <button
              className="accountModeButton"
              type="button"
              onClick={() => {
                setMode("login");
                setPassword("");
                setConfirmedPassword("");
                setResetSecret("");
                setError(null);
              }}
            >
              Volver al inicio de sesión
            </button>
          ) : (
            <>
              <button
                className="accountModeButton"
                type="button"
                onClick={() => {
                  setMode((current) => current === "login" ? "register" : "login");
                  setPassword("");
                  setConfirmedPassword("");
                  setResetSecret("");
                  setError(null);
                  setStatusMessage(null);
                }}
              >
                {mode === "register"
                  ? "Ya tengo una cuenta"
                  : "Crear una cuenta nueva"}
              </button>
              {mode === "login" && (
                <button
                  className="accountModeButton"
                  type="button"
                  onClick={() => {
                    setMode("adminRecovery");
                    setPassword("");
                    setConfirmedPassword("");
                    setResetSecret("");
                    setError(null);
                    setStatusMessage(null);
                  }}
                >
                  ¿Olvidaste la clave administradora?
                </button>
              )}
              <small>La contraseña debe tener entre 12 y 128 caracteres.</small>
            </>
          )}
        </form>
      )}

      {!open && (sessionError || error) && (
        <span className="accountError" role="alert">{sessionError ?? error}</span>
      )}
    </div>
  );
}
