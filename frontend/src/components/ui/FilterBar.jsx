export function FilterBar({
  fields,
  values,
  onChange,
  onReset,
  onSubmit,
  submitLabel = 'Apply Filters',
}) {
  return (
    <form className="filter-bar" onSubmit={onSubmit}>
      <div className="field-grid">
        {fields.map((field) => (
          <label className="form-field" htmlFor={field.name} key={field.name}>
            <span>{field.label}</span>
            {field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                onChange={onChange}
                value={values[field.name] ?? ''}
              >
                <option value="">{field.placeholder}</option>
                {field.options.map((option) => (
                  <option key={`${field.name}-${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field.name}
                name={field.name}
                onChange={onChange}
                placeholder={field.placeholder}
                type={field.type || 'text'}
                value={values[field.name] ?? ''}
              />
            )}
          </label>
        ))}
      </div>
      <div className="filter-bar__actions">
        <button className="button" type="submit">
          {submitLabel}
        </button>
        <button className="button button--ghost" onClick={onReset} type="button">
          Reset
        </button>
      </div>
    </form>
  )
}
