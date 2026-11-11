import { Cookie, Database, KeyRound, Lock, ShieldCheck, Users } from "lucide-react"

const CONTROLS = [
  {
    icon: Database,
    title: "Row-level ownership",
    body: "Every saved snippet, quote and scoring project is bound to your account id in the database. The policy is enforced by Postgres, not by the interface.",
  },
  {
    icon: Cookie,
    title: "HttpOnly session cookies",
    body: "The session token lives in an HttpOnly cookie with SameSite protection, so page scripts cannot read it and cross-site requests cannot ride on it.",
  },
  {
    icon: ShieldCheck,
    title: "Server-side route guards",
    body: "Protected routes are checked on the server before the page renders. There is no client-side flash of private content for a signed-out visitor.",
  },
  {
    icon: KeyRound,
    title: "Secrets stay on the server",
    body: "Model API keys and database credentials never reach the browser bundle. Requests are made through server routes that validate every input.",
  },
  {
    icon: Lock,
    title: "Rate limiting on auth routes",
    body: "Sign-in and callback endpoints are rate limited per client, which slows credential stuffing and automated abuse against a Google OAuth flow.",
  },
  {
    icon: Users,
    title: "No shared public database",
    body: "The only pages a visitor can read without an account are the landing page and the sign-in screens. Nothing else is publicly queryable.",
  },
]

export function SecuritySection() {
  return (
    <section id="security" className="scroll-mt-16 border-b border-border bg-surface-2">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">Security</p>
            <h2 className="mt-3 text-balance-tight text-3xl font-semibold tracking-tight sm:text-4xl">
              Your work is private by default, not by policy
            </h2>
            <p className="mt-4 text-pretty text-base leading-7 text-muted-foreground">
              A tool that holds your client code, your pricing and your roadmap decisions has to get access
              control right. These are the controls that are actually in place, stated plainly.
            </p>
            <div className="mt-6 rounded-lg border border-border bg-card p-4">
              <p className="text-sm font-medium">How it works</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                You sign in with Google. Supabase issues a session, the token is stored in an HttpOnly
                cookie, and every query to your data carries your user id. Access is granted by a database
                policy, so a bug in the interface cannot expose another account.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {CONTROLS.map((control) => {
              const Icon = control.icon
              return (
                <div
                  key={control.title}
                  className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20 sm:p-5"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-2">
                    <Icon className="h-4 w-4 text-brand" aria-hidden="true" />
                  </span>
                  <h3 className="mt-3 text-sm font-semibold">{control.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{control.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
