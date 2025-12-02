import PropTypes from "prop-types";
import "../styles/Input.css";

function Input({
    type = "text",
    name,
    value,
    onChange,
    placeholder = "",
    label = "",
    error = "",
    required = false,
    maxLength,
    autoComplete,
    disabled = false,
}) {
    return (
        <div className="input-wrapper">
            {label && (
                <label htmlFor={name} className="input-label">
                    {label}
                    {required && <span className="input-required">*</span>}
                </label>
            )}
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                maxLength={maxLength}
                autoComplete={autoComplete}
                disabled={disabled}
                required={required}
                className={`input-field ${error ? "error" : ""}`}
            />
            {error && <span className="input-error-message">{error}</span>}
        </div>
    );
}

Input.propTypes = {
    type: PropTypes.string,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    label: PropTypes.string,
    error: PropTypes.string,
    required: PropTypes.bool,
    maxLength: PropTypes.number,
    autoComplete: PropTypes.string,
    disabled: PropTypes.bool,
};

export default Input;
