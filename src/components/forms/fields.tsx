import { useId } from "react"
import { cn } from "@/lib/utils"

const control =
  "w-full rounded-md border border-stone-gray bg-white px-3 text-[14px] text-black placeholder:text-smoke-charcoal/50 transition-colors focus:border-carbon-ink focus:outline-none aria-invalid:border-[#d03b3b]"

type FieldProps = {
  label: string
  name: string
  required?: boolean
  hint?: string
  /** Mensaje de error del servidor para este campo */
  error?: string
  className?: string
}

function FieldShell({
  id,
  label,
  required,
  hint,
  error,
  className,
  children,
}: Omit<FieldProps, "name"> & { id: string; children: React.ReactNode }) {
  return (
    <div className={cn("block", className)}>
      <label htmlFor={id} className="label-caps">
        {label} {required && <span aria-hidden>*</span>}
      </label>
      {children}
      {error ? (
        <span id={`${id}-msg`} className="mt-1 block text-[12px] text-[#b42318]">
          {error}
        </span>
      ) : (
        hint && (
          <span id={`${id}-msg`} className="mt-1 block text-micro text-smoke-charcoal">
            {hint}
          </span>
        )
      )}
    </div>
  )
}

export function TextField({
  label,
  name,
  required,
  hint,
  error,
  className,
  ...props
}: FieldProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} className={className}>
      <input
        id={id}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-msg` : undefined}
        className={cn(control, "mt-2 h-11")}
        {...props}
      />
    </FieldShell>
  )
}

export function TextAreaField({
  label,
  name,
  required,
  hint,
  error,
  className,
  ...props
}: FieldProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} className={className}>
      <textarea
        id={id}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-msg` : undefined}
        className={cn(control, "mt-2 min-h-32 py-2.5")}
        {...props}
      />
    </FieldShell>
  )
}

export function SelectField({
  label,
  name,
  required,
  options,
  placeholder,
  hint,
  error,
  className,
  defaultValue,
  ...props
}: FieldProps & { options: readonly string[]; placeholder?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId()
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} className={className}>
      <select
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-msg` : undefined}
        className={cn(control, "mt-2 h-11")}
        {...props}
      >
        <option value="" disabled>
          {placeholder ?? "Selecciona"}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}

/** Campo trampa para bots: invisible y fuera del orden de tabulación */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        No llenar este campo
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  )
}
