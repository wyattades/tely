import React from 'react';

import * as discord from '../discord';
import * as db from '../db';
import { MultiSelect } from './form';
import { SmallSection } from './misc';
import services from '../services';

// TODO: check discord id dynamically

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
    shareDiscord: '',
    err: {},
    submitting: false,
  };

  createList = (name, type, optionalGuild) => 
    (optionalGuild ? discord.getGuild(optionalGuild) : Promise.resolve())
    .then((guild) => db.lists.add({
      owner: db.getUser().uid, // = db.getProfile().id
      created: Date.now(),
      name,
      type,
      share: guild ? { [guild.id]: guild } : {},
    }))
    .then((ref) => {
      this.props.history.push(`/list/${ref.id}`);
    })
    .catch((err) => {
      this.setState({ err: { submit: `Failed to create list. Error: ${err.code}` } });
    });

  handleSubmit = (event) => {
    event.preventDefault();
    
    const { listName, type, shareDiscord } = this.state;
    let valid = true;
    const err = {};

    if (!listName) {
      valid = false;
      err.listName = true;
    }
    
    if (shareDiscord && !/^[\d]{1,19}$/.test(shareDiscord)) {
      valid = false;
      err.shareDiscord = 'Please enter a valid server ID';
    }

    if (!type) {
      valid = false;
      err.type = true;
    }

    this.setState({ err });

    if (valid) {

      if (shareDiscord) {
        this.setState({ submitting: true });

        discord.getGuild(shareDiscord)
        .then((guild) => {
          this.createList(listName, type, guild);
        })
        .catch((error) => {
          console.error('getGuild', error);
          if (error.code === 401) err.shareDiscord = 'You are not authorized to access this server';
          else err.shareDiscord = 'Please enter a valid server ID';
          this.setState({ submitting: false, err });
        });
      } else {
        this.setState({ submitting: true });

        this.createList(listName, type)
        .catch((error) => {
          console.error(error);
          this.setState({
            submitting: false,
            err: { submit: 'Oops! Something went wrong' },
          });
        });
      }
    }
  }

  shareDiscordChange = (e) => this.setState({
    shareDiscord: e.target.value,
  });

  listNameChange = (e) => this.setState({
    listName: e.target.value,
  });

  typeChange = (type) => this.setState({ type })

  render() {
    const { listName, type, shareDiscord, err, submitting } = this.state;

    return (
      <SmallSection>
        <h1 className="is-size-1">Create a New List</h1>
        <br/>
        <form onSubmit={this.handleSubmit}>
          <div className="field">
            <label className="label" htmlFor="list-name">List Name</label>
            <div className="control">
              <input type="text" className="input" id="list-name" value={listName}
                maxLength={48} onChange={this.listNameChange}/>
            </div>
            { err.listName &&
              <p className="help is-danger">This is a required field</p>
            }
          </div>
          <div className="field">
            <label className="label" htmlFor="list-type">Select a List Type</label>
            <div className="control">
              <MultiSelect required options={types} name="list-type" value={type}
                onChange={this.typeChange}/>
            </div>
            { err.type &&
              <p className="help is-danger">This is a required field</p>
            }
          </div>
          <div className="field">
            <label className="label optional" htmlFor="share-discord">Share with a Discord Server ID</label>
            <div className="control has-icons-right">
              <input type="text" className="input" id="share-discord" value={shareDiscord}
                onChange={this.shareDiscordChange}/>
            </div>
            { err.shareDiscord &&
              <p className="help is-danger">{err.shareDiscord}</p>
            }
            <p className="help">To get your server's ID, right click the server's icon and select `Copy ID`</p>
          </div>
          <div className="field">
            <div className="control">
              <button className={`button is-primary is-medium ${submitting && 'is-loading'}`} 
                type="submit" disabled={this.state.checking}>
                Create
              </button>
            </div>
            { err.submit &&
              <p className="help is-danger">{err.submit}</p>
            }
          </div>
        </form>
      </SmallSection>
    );
  }
}

export default NewMediaList;
