export function FileInput({ id, label, accept = '.pdf', file, name, onChange, required = false }) {
  return (
    <label className="form-field" htmlFor={id}>
      <span>{label}</span>
      <input
        accept={accept}
        id={id}
        key={file?.name || `${id}-empty`}
        name={name}
        onChange={onChange}
        required={required}
        type="file"
      />
      {file ? <small className="form-field__hint">{file.name}</small> : null}
    </label>
  )
}
