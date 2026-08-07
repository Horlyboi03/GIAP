export default function AuthButtonLoader({ label }) {
  return (
    <span className="inline-flex items-center justify-center gap-3">
      <span className="auth-button-loader" aria-hidden="true">
        <span className="auth-button-loader__square auth-button-loader__square--offset" />
        <span className="auth-button-loader__square" />
        <span className="auth-button-loader__square auth-button-loader__square--offset" />
      </span>
      <span>{label}</span>
    </span>
  )
}
