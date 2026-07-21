export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`display text-xl lowercase ${className}`}>
      yapped<span className="text-pink">.</span>
    </span>
  );
}
