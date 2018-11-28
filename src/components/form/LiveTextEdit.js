import React from 'react';

export default class LiveTextEdit extends React.Component {

  state = {
    value: this.props.value,
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value)
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ value: this.props.value });
  }

  componentWillUnmount() {
    this.clearTimeout();
  }

  clearTimeout() {
    if (this.timeout !== null) {
      window.clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  timeout = null;

  onKeyPress = (e) => {
    if (e.which === 13) {
      e.target.blur();
    }
  }

  onBlur = () => {
    this.clearTimeout();
    this.props.onUpdate(this.state.value);
  }

  onChange = (e) => {
    const value = e.target.value;

    this.clearTimeout();

    if (value) {
      this.timeout = window.setTimeout(() => {
        this.props.onUpdate(value);
        this.timeout = null;
      }, 500);
    }

    this.setState({ value });
  }

  render() {
    const { value: _, onUpdate: __, className = '', ...inputProps } = this.props;
    const { value } = this.state;

    return <>
      <input type="text" {...inputProps} value={value} className={`live-text-edit ${className}`}
        onChange={this.onChange} onKeyPress={this.onKeyPress} onBlur={this.onBlur}/>
      {/* <span className="fas fa-edit"></span> */}
    </>;
  }
}
