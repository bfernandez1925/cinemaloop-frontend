"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { ICONS } from "@/design/icons";
import { auth } from "@/lib/firebase";
import { updateUsername } from "@/lib/auth/api";
import { getAuthErrorMessage } from "@/lib/auth/authErrors";

type AuthMode = "login" | "signup";

export function AuthModal({
  initialMode,
  onClose,
  onSuccess,
}: {
  initialMode: AuthMode;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const CloseIcon = ICONS.close;
  const PasswordVisibilityIcon = showPassword ? ICONS.hidePassword : ICONS.showPassword;

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: username });
        // Escritura explícita en Firestore (CIN-64): el trigger
        // onUserCreated puede correr antes o después de updateProfile,
        // así que no basta con fijar el displayName en Auth.
        await updateUsername(username);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSuccess();
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="bg-surface border-border relative w-full max-w-sm rounded-card border p-7">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="text-text-secondary absolute top-4 right-4"
        >
          <CloseIcon className="h-5 w-5" strokeWidth={1.8} />
        </button>

        <h2 id="auth-modal-title" className="font-display mb-6 text-xl font-medium">
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "signup" && (
            <label className="flex flex-col gap-1.5">
              <span className="text-text-secondary text-sm">Nombre de usuario</span>
              <input
                type="text"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="border-border bg-bg-primary text-text-primary rounded-control border px-4 py-3 text-sm"
              />
            </label>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-text-secondary text-sm">Email</span>
            <input
              ref={emailInputRef}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="border-border bg-bg-primary text-text-primary rounded-control border px-4 py-3 text-sm"
            />
          </label>

          <div className="flex flex-col gap-1.5">
            {/* htmlFor/id explícitos, no <label> envolviendo el campo: si el
                <label> envolviera también el botón de mostrar/ocultar, el
                nombre accesible del input arrastraría el aria-label del
                botón ("Contraseña Mostrar contraseña"), rompiendo cualquier
                localizador exacto por "Contraseña" (incluido en los tests). */}
            <label htmlFor="auth-modal-password" className="text-text-secondary text-sm">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="auth-modal-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="border-border bg-bg-primary text-text-primary rounded-control w-full border px-4 py-3 pr-11 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="text-text-secondary absolute inset-y-0 right-0 flex items-center px-3"
              >
                <PasswordVisibilityIcon className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </div>
          </div>

          {errorMessage && (
            <p role="alert" className="text-orange-tint-text text-sm">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-orange text-bg-primary rounded-control disabled:bg-orange-disabled mt-2 px-7 py-[15px] text-[15px] font-bold"
          >
            {submitting ? "Un momento…" : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setErrorMessage(null);
          }}
          className="text-text-secondary mt-5 text-sm underline"
        >
          {mode === "login" ? "¿No tienes cuenta? Crear una" : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </div>
    </div>
  );
}
