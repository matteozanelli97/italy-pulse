interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-[var(--grigio-chiaro)] bg-[var(--grigio-scuro)] p-5 transition-colors hover:border-[var(--grigio-testo)] ${className}`}
    >
      {children}
    </div>
  );
}
