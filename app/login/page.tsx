/*
 * THESIS: Signing in should need no explanation. One familiar panel does the task; Folio's shapes on planner yellow carry the character around it.
 * OWN-WORLD: Planner yellow ground with Folio's mint disc, teal quarter, coral half-disc, lilac square and tilted planner bars; a white 12px panel with a soft yellow-tinted shadow, ink primary button, outlined secondary buttons, labelled 48px fields.
 * STORY: Fawaz sees where he is (Step 1 of 2), enters his email, then a password or code; honest notes say plainly when sign-in isn't connected, and sample data is one link away.
 * FIRST VIEWPORT: The panel centred on the yellow: wordmark, step marker, "Sign in to Folio", the email field, a full-width Continue button, then the other ways in under a divider.
 * FORM: Clear panel on planner yellow; user-directed distill of the ledger sheet (seed 88820fd9). Brief pins: planner yellow, shapes, one clear panel.
 * FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
 */
import Link from "next/link";
import LoginFlow from "../components/login-flow";

export const metadata = { title: "Sign in | Folio" };

export default function LoginPage() {
  return <main className="signin-page">
    <div className="signin-shapes" aria-hidden="true">
      <span className="shape-quarter" />
      <span className="shape-disc" />
      <span className="shape-square" />
      <span className="shape-half" />
      <span className="shape-planner"><i /><i /><i /><i /><i /></span>
    </div>
    <section className="signin-panel" aria-labelledby="auth-step-title">
      <Link className="wordmark" href="/" aria-label="Folio home"><span className="brand-mark"><span /><span /><span /></span>folio<span className="brand-period">.</span></Link>
      <LoginFlow />
    </section>
  </main>;
}
