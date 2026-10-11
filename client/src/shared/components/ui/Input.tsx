import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      required = false,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full space-y-2">

        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}

            {required && (
              <span className="ml-1 text-red-500">*</span>
            )}
          </label>
        )}

        <input
          ref={ref}
          className={`
            w-full
            rounded-lg
            border
            border-gray-300
            bg-white
            px-4
            py-3
            text-gray-800
            outline-none
            transition
            duration-200
            focus:border-blue-600
            focus:ring-2
            focus:ring-blue-200
            disabled:bg-gray-100
            disabled:cursor-not-allowed
            ${error ? "border-red-500" : ""}
            ${className}
          `}
          {...props}
        />

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}

      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;