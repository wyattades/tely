import React from 'react';
import { EventEmitter } from 'events';

import { SmallSection } from './components/misc';

const ee = new EventEmitter();

export const alert = (msg) => {
  ee.emit('alert', msg);
};

export const confirm = (msg) =>
  new Promise((resolve) => {
    ee.once('prompted', resolve);
    ee.emit('prompt', msg);
  });

export const prompt = (msg) =>
  new Promise((resolve) => {
    ee.once('prompted', resolve);
    ee.emit('prompt', msg, true);
  });

const ALERT_TIMEOUT = 3000;

class Alert extends React.Component {
  state = {
    msg: null,
  };

  componentDidMount() {
    ee.on('alert', this.onAlert);
  }

  componentWillUnmount() {
    ee.off('alert', this.onAlert);
  }

  onAlert = (msg) => {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    this.setState({ msg }, () => {
      this.timeout = setTimeout(this.onClose, ALERT_TIMEOUT);
    });
  };

  onClose = () => {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    this.setState({ msg: null });
  };

  render() {
    const { msg } = this.state;

    return msg ? (
      <SmallSection
        style={{ position: 'absolute', bottom: 16, left: 0, right: 0 }}
      >
        <div className="notification is-info">
          <button className="delete" onClick={this.onClose} />
          {msg}
        </div>
      </SmallSection>
    ) : null;
  }
}

class Prompt extends React.Component {
  state = {
    msg: null,
    receiveInput: false,
  };

  componentDidMount() {
    ee.on('prompt', this.onPrompt);
  }

  componentWillUnmount() {
    ee.off('prompt', this.onPrompt);
  }

  onPrompt = (msg, receiveInput = false) => {
    this.setState({ msg, receiveInput });
  };

  onSubmit = (e) => {
    e.preventDefault();

    if (this.state.receiveInput) {
      const input = e.target.elements.input.value;
      ee.emit('prompted', input || false);
    } else {
      ee.emit('prompted', true);
    }

    this.setState({ msg: null });
  };

  onClose = (e) => {
    if (!e.target.dataset.close) return;

    ee.emit('prompted', false);

    this.setState({ msg: null });
  };

  render() {
    const { msg, receiveInput } = this.state;

    return msg ? (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 30,
          background: '#aaaaaa77',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={this.onClose}
        data-close="1"
      >
        <form
          className="box"
          onSubmit={this.onSubmit}
          style={{ maxWidth: 360, flex: 1, margin: '0 16px' }}
        >
          <p>{msg}</p>
          {receiveInput && (
            <input
              type="text"
              name="input"
              className="input"
              autoFocus
              style={{ display: 'block', marginTop: 8 }}
            />
          )}
          <br />
          <div className="buttons" style={{ justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="button"
              data-close="1"
              onClick={this.onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button is-primary"
              autoFocus={!receiveInput}
            >
              Confirm
            </button>
          </div>
          {/* <input className="input" type="text"/> */}
        </form>
      </div>
    ) : null;
  }
}

export const Alerts = () => (
  <>
    <Prompt />
    <Alert />
  </>
);
