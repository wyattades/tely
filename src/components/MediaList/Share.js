import React from 'react';

import * as discord from '../../discord';

export default class Share extends React.Component {

  state = {
    guilds: null,
    error: null,
  }

  componentDidMount() {
    discord.getGuilds()
    .then((guilds) => this.setState({ guilds }))
    .catch((error) => this.setState({ error }));
  }

  // <span>{shared && 'shared'}</span>
  renderItem = (shared) => (guild) => (
    <div key={guild.id} className="buttons">
      <button className="button is-discord">
        <div>
          <p className="">{guild.name}</p>
          {/* <p></p> */}
        </div>
      </button>
    </div>
  );

  render() {
    const { metaData } = this.props;
    const { guilds, error } = this.state;
    const share = metaData.share;

    return <>
      <p className="is-size-5 has-text-grey">Share:</p>
      <h1 className="is-size-1">{metaData.name}</h1>
      <h2>Currently shared with:</h2>
      <div>
        { share ? share.map(this.renderItem(false)) : <p>Loading...</p> }
      </div>
      { error && <p>{error}</p> }
      <h2>You can share with:</h2>
      <div className="">
        {guilds ? guilds.map(this.renderItem(true)) : <p>Loading...</p> }
      </div>
    </>;
  }
}
