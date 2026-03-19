export default function Spinner({ size = 16, color = 'var(--muted)' }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.5"
      style={{ animation: 'spin .7s linear infinite', flexShrink: 0 }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="12" cy="12" r="10" strokeOpacity=".2" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  )
}
