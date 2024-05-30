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
            className="select-none cursor-pointer rounded-lg border-2 bg-geeky-blue 
   py-3 px-6 font-bold text-white transition-colors duration-200 ease-in-out peer-checked:bg-dark-bg peer-checked:text-white peer-checked:bg-geeky-blue  "
          >
            {option}
          </label>
        </div>
      ))}
    </div>
  );
};

export default CheckboxGroup;
