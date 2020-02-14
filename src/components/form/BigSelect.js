import React from 'react';

import './BigSelect.scss';

export default ({ options, name, onChange, value }) => (
  <div className="box well big-select">
    {options.map(({ id, label, desc, className }) => (
      <div key={id} className="buttons">
        <label
          className={`button multiline space-between has-text-left is-large is-fullwidth ${value ===
            id && `${className} is-selected`}`}
          htmlFor={id}
        >
          <input
            type="radio"
            hidden
            name={name}
            id={id}
            onChange={() => onChange(id)}
            value={id}
            checked={value === id}
          />
          <div>
            <p className="is-size-4">{label}</p>
            <p className="help">{desc}</p>
          </div>
        </label>
      </div>
    ))}
  </div>
);
