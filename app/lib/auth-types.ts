export type AuthStep = "email" | "password" | "code" | "two-step" | "forgot" | "reset-sent";

/**
 * What a sign-in attempt returns to the form.
 * - `ok`: move on to `next`.
 * - `preview`: sign-in isn't connected; the flow advances to `next` so the screen can be seen, but nothing was sent or checked.
 * - `not-connected`: the step can't finish until the backend exists.
 * - `error`: validation failed; `errors` holds field messages.
 */
export type AuthState = {
  status: "idle" | "ok" | "preview" | "not-connected" | "error";
  from?: AuthStep;
  next?: AuthStep;
  email?: string;
  message?: string;
  errors?: Partial<Record<"email" | "password" | "code", string>>;
};

export const initialAuthState: AuthState = { status: "idle" };
