import React from 'react';

import * as db from '../../db';
import MultiInput from '../form/MultiInput';
import { confirm } from '../../alert';

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
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (name) {
      this.timeout = setTimeout(() => {
        this.props.meta.update({
          name,
        });
        this.timeout = null;
      }, 500);
    }

    this.setState({ name });
  }

  deleteList = () => {
    const { history, metaData, meta } = this.props;
    confirm(`Are you sure you want to delete "${metaData.name}"?`)
    .then((yes) => {
      if (yes) {
        history.push('/list');
        meta.delete()
        .catch(console.error);
      }
    });
  }

  addOrRemoveWebhook = (add) => (url) => {
    // Create a unique key for URL just by encoding it
    this.props.meta.update({
      [`webhooks.${encodeURIComponent(url).replace(/\./g, '%2E')}`]: add ? url : db.Helpers.FieldValue.delete(),
    })
    .catch(console.error);
  };

  timeout = null;

  render() {
    const { metaData: { name, webhooks } } = this.props;
      
    return (
      <>
        <p className="is-size-5 has-text-grey">Settings:</p>
        <h1 className="is-size-1 is-clipped">{this.state.name || name}</h1>
        <br/>
        <div className="field">
          <label className="label" htmlFor="name">List Name</label>
          <div className="control">
            <input id="name" type="text" className="input" value={this.state.name}
              maxLength={48} placeholder="Name cannot be empty" onChange={this.onChangeName}/>
          </div>
        </div>
        <div className="field">
          <label className="label" htmlFor="webhooks">Webhooks</label>
          <MultiInput items={Object.values(webhooks)} placeholder="Webhook URL" type="url"
            onAddItem={this.addOrRemoveWebhook(true)} onRemoveItem={this.addOrRemoveWebhook(false)}/>
          <p className="help">
            Go to your Discord server's settings to fetch a new webhook (must have role Server Manager).
            Add the webhook here to notify your server when list items are added!
          </p>
        </div>
        <br/>
        <hr/>
        <div className="columns">
          <div className="column">
            <p>Put this list out of its misery. Remember that it cannot come back from the dead!</p>
          </div>
          <div className="column">
            <button className="button is-danger is-fullwidth" onClick={this.deleteList}>Delete List</button>
          </div>
        </div>
      </>
    );
  }
}
