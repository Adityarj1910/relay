import PropTypes from "prop-types";
import "../styles/Button.css";

function Button({
    type = "button",
    variant = "primary",
    onClick,
    disabled = false,
    loading = false,
    fullWidth = false,
    children,
}) {
    const variantClass = `btn-${variant}`;
    const classes = [
        "btn",
        variantClass,
        fullWidth ? "full-width" : "",
    ].filter(Boolean).join(" ");

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={classes}
        >
            {loading ? (
                <span>
                    <span className="btn-spinner" />
                    Loading...
                </span>
            ) : (
                children
            )}
        </button>
    );
}

Button.propTypes = {
    type: PropTypes.oneOf(["button", "submit", "reset"]),
    variant: PropTypes.oneOf(["primary", "secondary", "danger", "success", "outline"]),
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    fullWidth: PropTypes.bool,
    children: PropTypes.node.isRequired,
};

export default Button;
