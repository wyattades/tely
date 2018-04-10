import React from 'react';

import * as discord from '../discord';
import { MultiSelect } from './form';
import { SmallSection } from './misc';

// TODO: check discord id dynamically

const types = [
  { id: 'movies-tv', label: 'Movies & TV', className: 'is-warning',
    desc: 'Select from a large database of movies and television' },
  { id: 'spotify-music', label: 'Spotify Music', className: 'is-success',
    desc: 'Spotify\'s extensive music library' },
];

const done = () => {};

class NewMediaList extends React.Component {
  
  state = {
    type: null,
    shareDiscord: '',
    err: {},
    submitting: false,
  };

  handleSubmit = (event) => {
    event.preventDefault();
    
    const { type, shareDiscord } = this.state;
    let valid = true;
    const err = {};
    
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
      console.log(this.state);

      if (shareDiscord) {
        this.setState({ submitting: true });

        discord.getGuild(shareDiscord)
        .then((guild) => {
          console.log('guild', guild);
          done();
        })
        .catch((error) => {
          console.error('getGuild', error);
          if (error.code === 401) err.shareDiscord = 'You are not authorized to access this server';
          else err.shareDiscord = 'Please enter a valid server ID';
          this.setState({ submitting: false, err });
        });
      } else {
        done();
      }
    }
  }

  shareDiscordChange = (e) => {
    const val = e.target.value;
    this.setState({
      shareDiscord: val,
    });
  }

  typeChange = (type) => this.setState({ type })

  render() {
    const { type, shareDiscord, err, submitting } = this.state;

    return (
      <SmallSection>
        <h1 className="is-size-1">Create a New List</h1>
        <br/>
        <form onSubmit={this.handleSubmit}>
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
          </div>
        </form>
      </SmallSection>
    );
  }
}

export default NewMediaList;
