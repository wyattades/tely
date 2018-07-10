import React from 'react';

import * as db from '../../db';

export default class Settings extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      name: props.metaData.name,
    };
  }

  onChangeName = (e) => {

    const name = e.target.value;

    if (this.timeout !== null) {
      window.clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (name) {
      this.timeout = window.setTimeout(() => {
        db.lists.doc(this.props.meta.id).update({
          name,
        });
        this.timeout = null;
      }, 500);
    }

    this.setState({ name });
  }

  deleteList = () => {
    const { history, metaData, meta } = this.props;
    if (window.confirm(`Are you sure you want to delete "${metaData.name}?"`)) {
      history.push('/list');
      meta.delete()
      // .then(() => )
      .catch(console.error);
    }
  }

  timeout = null;

  render() {
    const { metaData } = this.props;
      
    return <>
      <p className="is-size-5 has-text-grey">Settings:</p>
      <h1 className="is-size-1">{this.state.name || metaData.name}</h1>
      <br/>
      <div className="field">
        <label className="label" htmlFor="name">List Name</label>
        <div className="control">
          <input id="name" type="text" className="input" value={this.state.name}
            maxLength={48} placeholder="Name cannot be empty" onChange={this.onChangeName}/>
        </div>
      </div>
      <br/>
      <div className="columns">
        <div className="column">
          <p>Put this list out of its misery. Remember that it cannot come back from the dead!</p>
        </div>
        <div className="column">
          <button className="button is-danger is-fullwidth" onClick={this.deleteList}>Delete List</button>
        </div>
      </div>
    </>;
  }
}
