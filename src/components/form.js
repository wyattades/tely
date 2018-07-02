import React from 'react';


export const TextInput = ({ leftIcon, rightIcon, placeholder }) => (
  <div className="field">
    <label htmlFor="sad" className="label">Username</label>
    <div className="control has-icons-left has-icons-right">
      <input id="sad" className="input is-success" type="text" placeholder={placeholder}/>
      { leftIcon && (
        <span className="icon is-small is-left">
          <i className={`fas fa-${leftIcon}`} />
        </span>
      )}
      { rightIcon && (
        <span className="icon is-small is-right">
          <i className={`fas fa-${rightIcon}`} />
        </span>
      )}
    </div>
    <p className="help is-success">This username is available</p>
  </div>
);

export const MultiSelect = ({ options, name, onChange, value }) => (
  <div className="box well">
    {options.map(({ id, label, desc, className }) => (
      <div key={id} className="buttons">
        <label className={`button multiline space-between has-text-left
          is-large is-fullwidth ${value === id && `${className} is-selected`}`} htmlFor={id}>
          <input type="radio" hidden name={name} id={id}
            onChange={() => onChange(id)} value={id} checked={value === id}/>
          <div>
            <p className="is-size-4">{label}</p>
            <p className="help">{desc}</p>
          </div>
        </label>
      </div>
    ))}
  </div>
);
