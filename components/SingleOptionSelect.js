import React from 'react';

const SingleOptionSelect = ({
  options,
  selectedOption,
  onChange,
  defaultOption,
}) => {
  return (
    <div className="single-option-select flex gap-1">
      {options.map((option) => (
        <div className="flex" key={option.value}>
          <input
            type="radio"
            id={option.value}
            name="single-option"
            value={option.value}
            checked={selectedOption === option.value}
            onChange={() => onChange(option.value)}
            className="peer hidden"
          />
          <label
            htmlFor={option.value}
            className="select-none cursor-pointer rounded border-2 bg-geeky-blue 
              py-2 px-4 text-white transition-colors duration-200 ease-in-out peer-checked:bg-dark-bg peer-checked:text-white"
          >
            {option.name}
          </label>
        </div>
      ))}
    </div>
  );
};

export default SingleOptionSelect;
