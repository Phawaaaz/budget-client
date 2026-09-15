"use server";

import { redirect } from "next/navigation";
import type { AuthState, AuthStep } from "./auth-types";

export async function signOut() {
  // TODO(backend): end the session before leaving.
  redirect("/login");
}

/**
 * The single integration point for sign-in. Every intent is validated here on the server, then handed to the
 * backend at each TODO(backend). Until those exist the flow runs as a preview: steps advance so each screen can
 * be seen, but nothing is sent, checked, or stored, and the final steps report that sign-in isn't connected.
 */
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const codePattern = /^\d{6}$/;
const notConnected = "Sign-in isn't connected yet, so nothing was checked. You can explore with sample data for now.";
const fromIntent: Record<string, AuthStep> = { continue: "email", google: "email", password: "password", "send-code": "email", "verify-code": "code", "verify-two-step": "two-step", reset: "forgot" };

export async function authenticate(_previous: AuthState, formData: FormData): Promise<AuthState> {
  const intent = String(formData.get("intent") ?? "");
  const origin = String(formData.get("origin") ?? "");
  const from = (origin || fromIntent[intent] || "email") as AuthStep;
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const emailError = emailPattern.test(email) ? undefined : "Enter the email address you use for Folio, like name@example.com.";

  switch (intent) {
    case "continue":
      if (emailError) return { status: "error", from, email, errors: { email: emailError } };
      // TODO(backend): look up which sign-in methods this account has and route to them.
      return { status: "ok", from, next: "password", email };

    case "password": {
      const password = String(formData.get("password") ?? "");
      if (!password) return { status: "error", from, email, errors: { password: "Enter your password." } };
      // TODO(backend): verify the credentials. Create a session, long-lived when formData.get("remember") === "on".
      // Return { status: "ok", next: "two-step" } when the account has two-step verification.
      return { status: "preview", from, next: "two-step", email, message: "Preview: your password wasn't checked. Once sign-in is connected, accounts with two-step verification land here." };
    }

    case "send-code":
      if (emailError) return { status: "error", from, email, errors: { email: emailError } };
      // TODO(backend): email a single-use 6-digit code to `email`.
      return { status: "preview", from, next: "code", email, message: `Preview: no code was sent. Once sign-in is connected, a 6-digit code arrives at ${email}.` };

    case "verify-code":
    case "verify-two-step": {
      const code = String(formData.get("code") ?? "").trim();
      if (!codePattern.test(code)) return { status: "error", from, email, errors: { code: "Enter all 6 digits of the code." } };
      // TODO(backend): check the code, then create the session.
      return { status: "not-connected", from, email, message: notConnected };
    }

    case "reset":
      if (emailError) return { status: "error", from, email, errors: { email: emailError } };
      // TODO(backend): email a password-reset link. Respond the same way whether or not the account exists.
      return { status: "preview", from, next: "reset-sent", email, message: `Preview: no email was sent. Once sign-in is connected, a reset link goes to ${email} if there's an account for it.` };

    case "google":
      // TODO(backend): start the Google OAuth redirect.
      return { status: "not-connected", from, email, message: "Google sign-in isn't connected yet. It needs Google OAuth on your backend." };

    default:
      return { status: "error", from, email, message: "That didn't work. Try again." };
  }
}
