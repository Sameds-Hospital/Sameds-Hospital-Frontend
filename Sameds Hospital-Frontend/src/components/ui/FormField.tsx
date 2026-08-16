import type { ChangeEvent } from 'react'

interface Option { value: string; label: string }

interface FormFieldProps {
  label: string
  name: string
  type?: 'text' | 'number' | 'email' | 'tel' | 'date' | 'time' | 'password' | 'textarea' | 'select'
  value: string | number
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  options?: Option[]
  required?: boolean
  placeholder?: string
  min?: string | number
  step?: string | number
  disabled?: boolean
}

export function FormField({
  label, name, type = 'text', value, onChange, options, required, placeholder, min, step, disabled,
}: FormFieldProps) {
  const id = `field-${name}`
  return (
    <div className="form-field">
      <label htmlFor={id} className="form-field__label">
        {label}{required && <span className="form-field__req" aria-hidden>*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          className="form-field__input form-field__textarea"
          rows={3}
        />
      ) : type === 'select' ? (
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className="form-field__input form-field__select"
        >
          <option value="">Select…</option>
          {options?.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          min={min}
          step={step}
          disabled={disabled}
          className="form-field__input"
        />
      )}
    </div>
  )
}
