import React from 'react';

import { roleClick, timeAgo, toDate } from '../utils';
import { servicesMap } from '../services';
import { SpotifyPlayer } from '../spotify_player';
import * as db from '../db';
import { userAvatar } from '../discord';
import { LabelEditor } from './Labels';

import './ListItem.scss';

const MediaContent = ({
  service,
  mediaBottom,
  mediaRight,
  item: { link, released, media_id, image, title, label, ...body },
}) => {
  const releaseDate = toDate(released);

  return (
    <article className="media">
      <div className="media-left">
        <figure className="image media-image">
          {/* TODO: use abstracted renderer */}
          {service.ID === 'spotify_music' ? (
            <SpotifyPlayer id={media_id} image={image} title={title} />
          ) : (
            image && <img src={image} alt={title} />
          )}
        </figure>
      </div>
      <div className="media-content">
        <div className="content">
          <p className="is-marginless">
            <strong>
              <a href={link}>{title}</a>
            </strong>
            &nbsp;
            <strong>
              <small>{label}</small>
            </strong>
            &nbsp;
            {releaseDate ? (
              <small>Released {releaseDate.toLocaleDateString()}</small>
            ) : null}
          </p>
          {service.renderBody(body)}
        </div>
        {mediaBottom}
      </div>
      {mediaRight ? <div className="media-right">{mediaRight}</div> : null}
    </article>
  );
};

// TODO
MediaContent.shouldComponentUpdate = () => false;

export class ListItem extends React.Component {
  state = {
    deleting: false,
    labelMap: null,
  };

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.state.deleting !== nextState.deleting ||
      this.props.item !== nextProps.item ||
      this.props.item.labels !== nextProps.item.labels ||
      this.state.labelMap !== nextState.labelMap
    );
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe();
  }

  delete = () => {
    this.setState({ deleting: true }, () => {
      this.props.toggle(this.props.item);
    });
  };

  toggleLabelEditor = () => {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
      this.setState({ labelMap: null });
    } else {
      this.unsubscribe = db.getLabels((err, labelArray) => {
        if (err) console.error(err);
        else {
          const labelMap = {};
          for (const label of labelArray) labelMap[label.id] = label;

          this.setState({ labelMap });
        }
      });
    }
  };

  share = () => {
    window.navigator
      .share({
        title: `Checkout some ${this.props.item.label} from Tely`,
        text: '',
        url: this.props.item.link || window.location.href,
      })
      .then(() => console.log('Successfully shared'))
      .catch((error) => console.error('Error sharing:', error));
  };

  render() {
    const { item, showLabels, canDelete, className, listId } = this.props;
    const { deleting, labelMap } = this.state;

    const userId = db.getProfile() && db.getProfile().id;

    const levelBottom = (
      <nav className="info-row">
        {item.creator && (
          <div className="info-left">
            <small className="has-text-grey has-text-right">
              {timeAgo(item.created)}&nbsp;
              {userId !== item.creator.id ? (
                <span className="text-tag">
                  by <em>{item.creator.username}</em>&nbsp;
                  <img
                    src={userAvatar(item.creator, 20)}
                    alt={item.creator.username}
                    width="20"
                    className="is-rounded"
                  />
                </span>
              ) : null}
            </small>
          </div>
        )}
        <div className="info-right">
          {canDelete && (
            <button
              className="button is-inverted is-link"
              onClick={this.delete}
              title="Delete from List"
              disabled={deleting}
            >
              <span className="icon">
                <i className="fas fa-trash" />
              </span>
            </button>
          )}
          {showLabels && (
            <button
              className={`button is-inverted ${
                labelMap ? 'is-dark' : 'is-link'
              }`}
              onClick={this.toggleLabelEditor}
              title="Edit Labels"
            >
              <span className="icon">
                <i className="fas fa-tags" />
              </span>
            </button>
          )}
          {window.navigator && window.navigator.share ? (
            <button
              className="button is-inverted is-link"
              onClick={this.share}
              title="Share"
            >
              <span className="icon">
                <i className="fas fa-share-alt" />
              </span>
            </button>
          ) : null}
        </div>
      </nav>
    );

    return (
      <div className={`box ${className || ''} list-item`}>
        <MediaContent
          item={item}
          service={servicesMap[item.service]}
          mediaBottom={levelBottom}
        />
        {(item.labels || labelMap) && (
          <LabelEditor
            listId={listId}
            labelMap={labelMap}
            item={item}
            itemLabels={item.labels || {}}
          />
        )}
      </div>
    );
  }
}

export class SearchItem extends React.Component {
  state = {
    hovered: false,
  };

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.state.hovered !== nextState.hovered ||
      this.props.item.id !== nextProps.item.id
    );
  }

  hoverEnter = () => this.setState({ hovered: true });

  hoverLeave = () => this.setState({ hovered: false });

  toggle = () => {
    this.props.toggle(this.props.item);
  };

  render() {
    const { item, canWrite } = this.props;
    const { hovered } = this.state;

    // TEMP
    const type =
      item.service || (item.label === 'Song' ? 'spotify_music' : 'movies_tv');

    let addIcon;
    if (canWrite) {
      if (item.id)
        addIcon = (
          <a
            className={`icon has-text-${hovered ? 'danger' : 'success'}`}
            onMouseEnter={this.hoverEnter}
            onMouseLeave={this.hoverLeave}
            onClick={this.toggle}
            role="button"
            tabIndex="0"
            onKeyPress={roleClick}
          >
            <i className={`fas ${hovered ? 'fa-times' : 'fa-check'}`} />
          </a>
        );
      else
        addIcon = (
          <a
            className="icon"
            onClick={this.toggle}
            role="button"
            tabIndex="0"
            onKeyPress={roleClick}
          >
            <i className="fas fa-plus" />
          </a>
        );
    } else if (item.id) {
      addIcon = (
        <a className="icon has-text-success is-unclickable">
          <i className="fas fa-check" />
        </a>
      );
    }

    return (
      <MediaContent
        item={item}
        service={servicesMap[type]}
        mediaRight={addIcon}
      />
    );
  }
}
