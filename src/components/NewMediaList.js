import React from 'react';

import * as db from '../db';
import BigSelect from './form/BigSelect';
import { SmallSection } from './misc';
import services from '../services';

const types = services.asArray.map(({ ID, LABEL, DESCRIPTION, CLASS }) => ({
  id: ID,
  label: LABEL,
  desc: DESCRIPTION,
  className: CLASS,
}));

class NewMediaList extends React.Component {
  state = {
    listName: '',
    type: null,
    err: {},
    submitting: false,
  };

  createList = (name, type) =>
    db
      .createList(name, type)
      .then((ref) => {
        this.props.history.push(`/list/${ref.id}`);
      })
      .catch((err) => {
        this.setState({
          submitting: false,
          err: { submit: `Failed to create list. Error: ${err.code}` },
        });
      });

  handleSubmit = (event) => {
    event.preventDefault();

    const { listName, type } = this.state;
    let valid = true;
    const err = {};

    if (!listName) {
      valid = false;
      err.listName = true;
    }

    if (!type) {
      valid = false;
      err.type = true;
    }

    this.setState({ err });

    if (valid) {
      this.setState({ submitting: true });

      this.createList(listName, type).catch((error) => {
        console.error(error);
        this.setState({
          submitting: false,
          err: { submit: 'Oops! Something went wrong' },
        });
      });
    }
  };

  listNameChange = (e) =>
    this.setState({
      listName: e.target.value,
    });

  typeChange = (type) => this.setState({ type });

  render() {
    const { listName, type, err, submitting } = this.state;

    return (
      <SmallSection>
        <h1 className="is-size-1">Create a New List</h1>
        <br />
        <form onSubmit={this.handleSubmit}>
          <div className="field">
            <label className="label" htmlFor="list-name">
              List Name
            </label>
            <div className="control">
              <input
                type="text"
                className="input"
                id="list-name"
                value={listName}
                maxLength={48}
                onChange={this.listNameChange}
              />
            </div>
            {err.listName && (
              <p className="help is-danger">This is a required field</p>
            )}
          </div>
          <div className="field">
            <label className="label" htmlFor="list-type">
              Select a List Type
            </label>
            <div className="control">
              <BigSelect
                required
                options={types}
                name="list-type"
                value={type}
                onChange={this.typeChange}
              />
            </div>
            {err.type && (
              <p className="help is-danger">This is a required field</p>
            )}
          </div>
          <br />
          <div className="field">
            <div className="control">
              <button
                className={`button is-primary is-medium is-fullwidth ${submitting &&
                  'is-loading'}`}
                type="submit"
                disabled={this.state.checking}
              >
                Create
              </button>
            </div>
            {err.submit && <p className="help is-danger">{err.submit}</p>}
          </div>
        </form>
      </SmallSection>
    );
  }
}

export default NewMediaList;
