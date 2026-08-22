import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordField({
  id,
  leftIcon = null,
  wrapperClassName = "pmya-inputWrap pmya-passwordField",
  inputClassName = "pmya-input",
  toggleButtonClassName = "pmya-passwordToggle",
  showLabel = "Mostrar contraseña",
  hideLabel = "Ocultar contraseña",
  ...inputProps
}) {
  const generatedId = useId();
  const [visible, setVisible] = useState(false);
  const resolvedId = id || generatedId;
  const label = visible ? hideLabel : showLabel;

  return (
    <div className={wrapperClassName}>
      {leftIcon}
      <input
        {...inputProps}
        id={resolvedId}
        className={inputClassName}
        type={visible ? "text" : "password"}
      />
      <button
        type="button"
        className={toggleButtonClassName}
        onClick={() => setVisible((prev) => !prev)}
        aria-label={label}
        aria-pressed={visible}
        title={label}
      >
        <span className="sr-only">{label}</span>
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
