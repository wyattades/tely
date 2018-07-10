import React from 'react';

// TODO: abstract this class from Discord User IDs in case we want to use it for something else

export default class MultiInput extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      items: props.items,
      addValue: '',
      adding: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.items !== this.props.items)
      this.setState({
        items: nextProps.items,
        adding: false,
        addValue: '',
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
  }

  removeItem = (value) => (e) => {
    // Hack way to add waiting animation
    e.target.classList.add('is-loading');
    e.target.setAttribute('disabled', 'disabled');

    this.props.onRemoveItem(value);
  }

  addItemChange = (e) => {
    if (this.props.type !== 'number' || /^\d*$/.test(e.target.value))
      this.setState({ addValue: e.target.value });
  }

  render() {
    const { placeholder, minLength, maxLength, type } = this.props;
    const { items, addValue, adding } = this.state;

    return <>
      {items.map((value) => (
        <div className="field has-addons" key={value}>
          <div className="control is-expanded">
            <input className="input has-text-mono" type="text" value={value} disabled/>
          </div>
          <div className="control">
            <button className="button is-danger" onClick={this.removeItem(value)}
              title="Remove">
              <i className="fas fa-minus"/>
            </button>
          </div>
        </div>
      ))}
      <form onSubmit={this.addItem}>
        <div className="field has-addons">
          <div className="control is-expanded">
            <input className="input has-text-mono" type={(!type || type === 'number') ? 'text' : type}
              value={addValue} onChange={this.addItemChange} required minLength={minLength}
              disabled={adding} placeholder={placeholder} maxLength={maxLength}/>
          </div>
          <div className="control">
            <button type="submit" className={`button is-success ${adding ? 'is-loading' : ''}`}
              disabled={adding} title="Add">
              <i className="fas fa-plus"/>
            </button>
          </div>
        </div>
      </form>
    </>;
  }
}
