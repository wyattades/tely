import React from 'react';

export default class MultiInput extends React.Component {
  state = {
    addValue: '',
    adding: false,
  };

  componentDidUpdate(prevProps) {
    if (prevProps.items !== this.props.items)
      this.setState({
        adding: false,
        addValue: '',
        valid: false,
      });
  }

  addItem = (e) => {
    e.preventDefault();

    if (this.props.items.includes(this.state.addValue)) {
      this.setState({ addValue: '' });
      return;
    }

    this.setState({ adding: true });
    this.props.onAddItem(this.state.addValue);
  };

  removeItem = (value) => (e) => {
    // Hack way to add waiting animation
    e.target.classList.add('is-loading');
    e.target.setAttribute('disabled', 'disabled');

    this.props.onRemoveItem(value);
  };

  addItemChange = (e) => {
    const val = e.target.value;

    if (this.props.type === 'number') {
      if (MultiInput.TEST_NUMBER.test(val)) {
        const valid = val.length >= (this.props.minLength || 0);
        this.setState({ addValue: val, valid });
      }
    } else if (this.props.type === 'url') {
      const valid = MultiInput.TEST_URL.test(val);
      this.setState({ addValue: val, valid });
    }
  };

  static TEST_URL = /^http(s)?:\/\/[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/;
  static TEST_NUMBER = /^\d*$/;

  render() {
    const { placeholder, minLength, maxLength, type, items } = this.props;
    const { addValue, adding, valid } = this.state;

    return (
      <>
        {items.map((value) => (
          <div className="field has-addons" key={value}>
            <div className="control is-expanded">
              <input className="input" type="text" value={value} disabled />
            </div>
            <div className="control">
              <button
                className="button is-danger"
                onClick={this.removeItem(value)}
                title="Remove"
              >
                <i className="fas fa-minus" />
              </button>
            </div>
          </div>
        ))}
        <form onSubmit={this.addItem}>
          <div className="field has-addons">
            <div className="control is-expanded">
              <input
                className="input"
                type={!type || type === 'number' ? 'text' : type}
                value={addValue}
                onChange={this.addItemChange}
                required
                minLength={minLength}
                disabled={adding}
                placeholder={placeholder}
                maxLength={maxLength}
              />
            </div>
            <div className="control">
              <button
                type="submit"
                className={`button is-success ${adding ? 'is-loading' : ''}`}
                disabled={adding || !valid}
                title="Add"
              >
                <i className="fas fa-plus" />
              </button>
            </div>
          </div>
        </form>
      </>
    );
  }
}
