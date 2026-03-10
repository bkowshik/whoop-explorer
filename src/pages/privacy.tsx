import { Link } from "react-router-dom"

export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: March 3, 2026
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2 className="text-lg font-semibold">Overview</h2>
          <p className="mt-2">
            WHOOP Explorer is a privacy-first application that lets you view and
            download your WHOOP health data. Your health data never leaves your
            browser and is never stored on any server.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Data We Access</h2>
          <p className="mt-2">
            When you connect your WHOOP account, we request read-only access to
            the following data through the WHOOP API:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Basic profile information (first name)</li>
            <li>Sleep records</li>
            <li>Physiological cycles</li>
            <li>Recovery scores</li>
            <li>Workout activities</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">How Your Data Is Handled</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Browser only:</strong> All health data is fetched directly
              into your browser and processed entirely on your device.
            </li>
            <li>
              <strong>No server storage:</strong> Our server acts as a
              pass-through proxy for authentication only. It forwards API
              requests to WHOOP without logging, storing, or caching any health
              data.
            </li>
            <li>
              <strong>Local caching:</strong> Data is cached in your browser's
              IndexedDB storage to reduce repeated API calls. This cache exists
              only on your device.
            </li>
            <li>
              <strong>Authentication tokens:</strong> OAuth tokens are stored in
              your browser's localStorage to keep you signed in across sessions.
              These are never sent to any third party.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Server-Side Processing</h2>
          <p className="mt-2">
            The only server-side components are stateless Vercel serverless
            functions that:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Exchange OAuth authorization codes for access tokens (required
              because WHOOP's API requires a client secret that cannot be
              exposed in browser code)
            </li>
            <li>Refresh expired access tokens</li>
            <li>
              Proxy API requests to WHOOP (adding the authorization header
              server-side)
            </li>
          </ul>
          <p className="mt-2">
            These functions are ephemeral — they have no persistent storage, no
            database, and no logging of request or response bodies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Data Sharing</h2>
          <p className="mt-2">
            We do not sell, share, or transmit your health data to any third
            party. The only external service your data is sent to is WHOOP's own
            API, from which it originated.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Data Deletion</h2>
          <p className="mt-2">
            You can disconnect your WHOOP account at any time using the
            "Disconnect" button. This immediately and permanently deletes all
            locally stored data, including:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>OAuth tokens (localStorage)</li>
            <li>Cached health data (IndexedDB)</li>
          </ul>
          <p className="mt-2">
            Since no data is stored on our servers, there is nothing to delete
            server-side.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Cookies and Analytics</h2>
          <p className="mt-2">
            WHOOP Explorer does not use cookies, tracking pixels, or any
            analytics services. We do not collect usage data.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Open Source</h2>
          <p className="mt-2">
            This application is open source. You can review the complete source
            code to verify these privacy claims.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="mt-2">
            If you have questions about this privacy policy, please open an
            issue on the project's GitHub repository.
          </p>
        </section>
      </div>

      <div className="mt-12">
        <Link to="/" className="text-sm text-muted-foreground hover:underline">
          &larr; Back to WHOOP Explorer
        </Link>
      </div>
    </div>
  )
}
