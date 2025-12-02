import PropTypes from "prop-types";
import "../styles/FormError.css";

function FormError({ message, type = "error" }) {
    if (!message) return null;

    const typeIcons = {
        error: "⚠️",
        success: "✓",
        warning: "⚡",
        info: "ℹ️",
    };

    const typeClass = `form-message-${type}`;

    return (
        <div className={`form-message ${typeClass}`} role="alert">
            <span className="form-message-icon">{typeIcons[type]}</span>
            <span className="form-message-text">{message}</span>
        </div>
    );
}

FormError.propTypes = {
    message: PropTypes.string,
    type: PropTypes.oneOf(["error", "success", "warning", "info"]),
};

export default FormError;
