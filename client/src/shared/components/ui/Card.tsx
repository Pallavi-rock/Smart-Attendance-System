import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
  footer?: ReactNode;
  className?: string;
}

export default function Card({
  children,
  title,
  footer,
  className = "",
}: CardProps) {
  return (
    <div
      className={`
        rounded-2xl
        border
        border-gray-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:shadow-lg
        ${className}
      `}
    >
      {title && (
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {title}
          </h3>
        </div>
      )}

      <div className="p-6">
        {children}
      </div>

      {footer && (
        <div className="border-t border-gray-200 px-6 py-4">
          {footer}
        </div>
      )}
    </div>
  );
}