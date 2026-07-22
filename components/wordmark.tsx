export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`}>
      yapped
      <span className="wordmark-dot" aria-hidden />
    </span>
  );
}
