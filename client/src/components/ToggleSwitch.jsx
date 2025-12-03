import PropTypes from "prop-types";
import "../styles/ToggleSwitch.css";

export default function ToggleSwitch({ checked, onChange, disabled = false, label }) {
    const handleKeyPress = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!disabled) {
                onChange(!checked);
            }
        }
    };

    return (
        <label className={`toggle-switch ${disabled ? "toggle-switch-disabled" : ""}`}>
            {label && <span className="toggle-switch-label">{label}</span>}
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                className="toggle-switch-input"
            />
            <span
                className="toggle-switch-slider"
                role="switch"
                aria-checked={checked}
                aria-label={label || "Toggle"}
                tabIndex={disabled ? -1 : 0}
                onKeyPress={handleKeyPress}
            />
        </label>
    );
}

ToggleSwitch.propTypes = {
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    label: PropTypes.string,
};
