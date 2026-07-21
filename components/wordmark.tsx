export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-serif italic leading-none lowercase text-ink ${className}`}>
      yapped<span className="not-italic text-pink">.</span>
    </span>
  );
}
