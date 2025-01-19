/* eslint-disable react/prop-types */
import './Switch.css';

const Switch = ({ isOn, handleToggle }) => {
  return (
    <div className="switch-container">
      <input
        checked={isOn}
        onChange={handleToggle}
        className="switch-checkbox"
        id={`react-switch-new`}
        type="checkbox"
      />
      <label
        className="switch-label"
        htmlFor={`react-switch-new`}
      >
        <span className={`switch-button`} />
      </label>
    </div>
  );
};

export default Switch;
