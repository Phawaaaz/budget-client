"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, Info, Mail } from "lucide-react";
import { authenticate } from "../lib/auth";
import { initialAuthState, type AuthState, type AuthStep } from "../lib/auth-types";

const copy: Record<AuthStep, { title: string; lede: (email: string) => string }> = {
  email: { title: "Sign in to Folio", lede: () => "Enter your email to continue." },
  password: { title: "Enter your password", lede: email => `Signing in as ${email}.` },
  code: { title: "Check your email", lede: email => `We sent a 6-digit code to ${email}.` },
  "two-step": { title: "Two-step verification", lede: () => "Enter your 6-digit verification code." },
  forgot: { title: "Reset your password", lede: () => "Enter your email and we'll send you a reset link." },
  "reset-sent": { title: "Check your email", lede: email => `If there's a Folio account for ${email}, a reset link is on its way.` },
};
const stepLabel: Record<AuthStep, string> = { email: "Step 1 of 2", password: "Step 2 of 2", code: "Step 2 of 2", "two-step": "Extra security check", forgot: "Password reset", "reset-sent": "Password reset" };
const back: Partial<Record<AuthStep, AuthStep>> = { password: "email", code: "email", "two-step": "password", forgot: "password", "reset-sent": "email" };

function GoogleMark() {
  return <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p id={id} className="signin-error"><AlertCircle size={15} aria-hidden="true" />{message}</p> : null;
}

function CodeField({ value, onChange, error }: { value: string; onChange: (value: string) => void; error?: string }) {
  return <div className="signin-code" data-invalid={error ? "true" : undefined}>
    <input id="auth-code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={value} autoFocus aria-invalid={!!error} aria-describedby={error ? "auth-code-error" : "auth-step-lede"} onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))} />
    {Array.from({ length: 6 }, (_, i) => <span key={i} aria-hidden="true" className={i === Math.min(value.length, 5) ? "active" : undefined}>{value[i] ?? ""}</span>)}
  </div>;
}

export default function LoginFlow() {
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<AuthState | null>(null);
  const [delivered, setDelivered] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [, formAction, pending] = useActionState(async (previous: AuthState, formData: FormData) => {
    const result = await authenticate(previous, formData);
    if (result.email) setEmail(result.email);
    if (result.next) { setCode(""); setShowPassword(false); setDelivered(result.status === "ok"); setStep(result.next); }
    setNotice(result);
    return result;
  }, initialAuthState);
  const heading = useRef<HTMLHeadingElement>(null);
  const shown = useRef(step);
  // Steps with a field autofocus it; the confirmation step has none, so focus its heading instead.
  useEffect(() => { if (shown.current !== step) { shown.current = step; if (step === "reset-sent") heading.current?.focus(); } }, [step]);
  useEffect(() => { if (notice?.status === "error") document.querySelector<HTMLElement>(".signin-panel [aria-invalid=true]")?.focus(); }, [notice]);

  function show(next: AuthStep) { setNotice(null); setCode(""); setStep(next); }
  const errors = notice?.status === "error" && notice.from === step ? notice.errors ?? {} : {};
  const formError = notice?.status === "error" && notice.from === step && !notice.errors ? notice.message : undefined;
  // "Check your email" is only true when something was actually sent; until then the step says what really happened.
  const undelivered = (step === "code" || step === "reset-sent") && !delivered;
  const previewMessage = notice?.status === "preview" && notice.next === step ? notice.message : undefined;
  const title = undelivered ? (step === "code" ? "Enter your code" : "Reset your password") : copy[step].title;
  const lede = undelivered ? previewMessage ?? (step === "code" ? `Enter the 6-digit code for ${email}.` : "No reset email was sent.") : copy[step].lede(email);
  const info = notice && ((notice.status === "preview" && notice.next === step && !undelivered) || (notice.status === "not-connected" && notice.from === step)) ? notice.message : undefined;
  const backTo = back[step];
  const formProps = { action: formAction, noValidate: true, className: "signin-form", "aria-busy": pending, "aria-labelledby": "auth-step-title", "aria-describedby": "auth-step-lede" } as const;
  const submit = (intent: string, label: string, busyLabel: string, className = "signin-primary", icon?: React.ReactNode) =>
    <button className={className} name="intent" value={intent} disabled={pending} onClick={() => setBusy(intent)}>
      {pending && busy === intent ? <span className="spinner" aria-hidden="true" /> : icon}{pending && busy === intent ? busyLabel : label}
    </button>;

  return <>
    <div className="signin-nav">
      {backTo ? <button type="button" className="signin-back" onClick={() => show(backTo)}><ArrowLeft size={16} aria-hidden="true" /> Back</button> : <span />}
      <span className="signin-step">{stepLabel[step]}</span>
    </div>
    <div key={step} className="signin-step-body">
      <h1 id="auth-step-title" ref={heading} tabIndex={-1}>{title}</h1>
      <p id="auth-step-lede" className="signin-lede">{lede}{step === "password" && <> <button type="button" className="signin-link" onClick={() => show("email")}>Change</button></>}</p>
      <div role="status" aria-live="polite">{info && <p className="signin-notice"><Info size={16} aria-hidden="true" /><span>{info}</span></p>}</div>
      {formError && <p className="signin-error" role="alert"><AlertCircle size={15} aria-hidden="true" />{formError}</p>}

      {step === "email" && <form {...formProps}>
        <input type="hidden" name="origin" value={step} />
        <div>
          <label className="signin-label" htmlFor="auth-email">Email</label>
          <input id="auth-email" className="signin-input" name="email" type="email" inputMode="email" autoComplete="username" placeholder="name@example.com" defaultValue={email} autoFocus aria-invalid={!!errors.email} aria-describedby={errors.email ? "auth-email-error" : undefined} />
          <FieldError id="auth-email-error" message={errors.email} />
        </div>
        {submit("continue", "Continue", "Checking…")}
        <div className="signin-divider">or</div>
        {submit("send-code", "Email me a sign-in code", "Sending…", "signin-secondary", <Mail size={17} aria-hidden="true" />)}
        {submit("google", "Continue with Google", "Opening Google…", "signin-secondary", <GoogleMark />)}
      </form>}

      {step === "password" && <form {...formProps}>
        <input type="hidden" name="origin" value={step} />
        <input type="email" name="email" autoComplete="username" value={email} readOnly hidden />
        <div>
          <div className="signin-label-row"><label className="signin-label" htmlFor="auth-password">Password</label><button type="button" className="signin-link" onClick={() => show("forgot")}>Forgot password?</button></div>
          <div className="signin-password">
            <input id="auth-password" className="signin-input" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" autoFocus aria-invalid={!!errors.password} aria-describedby={errors.password ? "auth-password-error" : undefined} />
            <button type="button" className="signin-reveal" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
          <FieldError id="auth-password-error" message={errors.password} />
        </div>
        <label className="signin-check"><input type="checkbox" name="remember" /> Keep me signed in</label>
        {submit("password", "Sign in", "Signing in…")}
        <div className="signin-divider">or</div>
        {submit("send-code", "Email me a code instead", "Sending…", "signin-secondary", <Mail size={17} aria-hidden="true" />)}
      </form>}

      {(step === "code" || step === "two-step") && <form {...formProps}>
        <input type="hidden" name="origin" value={step} />
        <input type="hidden" name="email" value={email} />
        <div>
          <label className="signin-label" htmlFor="auth-code">6-digit code</label>
          <CodeField value={code} onChange={setCode} error={errors.code} />
          <FieldError id="auth-code-error" message={errors.code} />
        </div>
        {submit(step === "code" ? "verify-code" : "verify-two-step", "Verify code", "Checking…")}
        {step === "code" && <div className="signin-row">
          <button className="signin-link" name="intent" value="send-code" disabled={pending} onClick={() => setBusy("resend")}>{delivered ? "Send a new code" : "Email me a code"}</button>
          <button type="button" className="signin-link" onClick={() => show("password")}>Use password instead</button>
        </div>}
      </form>}

      {step === "forgot" && <form {...formProps}>
        <input type="hidden" name="origin" value={step} />
        <div>
          <label className="signin-label" htmlFor="auth-reset-email">Email</label>
          <input id="auth-reset-email" className="signin-input" name="email" type="email" inputMode="email" autoComplete="username" placeholder="name@example.com" defaultValue={email} autoFocus aria-invalid={!!errors.email} aria-describedby={errors.email ? "auth-reset-error" : undefined} />
          <FieldError id="auth-reset-error" message={errors.email} />
        </div>
        {submit("reset", "Send reset link", "Sending…")}
      </form>}

      {step === "reset-sent" && <div className="signin-form"><button type="button" className="signin-primary" onClick={() => show("email")}>Back to sign in</button></div>}
    </div>
    <p className="signin-foot"><span>Sign-in isn&apos;t connected yet.</span><Link className="signin-link" href="/">Explore with sample data <ArrowRight size={15} aria-hidden="true" /></Link></p>
  </>;
}
