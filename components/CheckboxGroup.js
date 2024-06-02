import React from 'react';

const CheckboxGroup = ({ options, selectedOptions, onChange }) => {
  const handleCheckboxChange = (option) => {
    const newSelectedOptions = selectedOptions.includes(option)
      ? selectedOptions.filter((o) => o !== option)
      : [...selectedOptions, option];

    onChange(newSelectedOptions);
  };

  return (
    <div className="checkbox-group flex gap-1">
      {options.map((option) => (
        <div className="flex" key={option}>
          <input
            type="checkbox"
            id={option}
            checked={selectedOptions.includes(option)}
            onChange={() => handleCheckboxChange(option)}
            className="peer hidden"
          />
          <label
            htmlFor={option}
            className="select-none cursor-pointer rounded border-2 bg-dark-bg
            py-1 px-2 text-white text-sm transition-colors duration-200 ease-in-out peer-checked:bg-geeky-blue peer-checked:text-white"
          >
            {option}
          </label>
        </div>
      ))}
    </div>
  );
};

export default CheckboxGroup;
