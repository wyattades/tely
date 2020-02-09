import React from 'react';
import { Switch, Link, Route } from 'react-router-dom';

import * as db from '../db';
import { ListItem } from './ListItem';
import LiveTextEdit from './form/LiveTextEdit';
import { confirm, prompt } from '../alert';

const colorMap = [
  ['is-link', 'Blue'],
  ['is-info', 'Light Blue'],
  ['is-primary', 'Turquoise'],
  ['is-success', 'Green'],
  ['is-warning', 'Yellow'],
  ['is-danger', 'Red'],
  ['is-dark', 'Dark Grey'],
];

export const labelColor = (colorId) => colorMap[colorId][0];

export class LabelEditor extends React.Component {
  toggleLabel = (labelId) => () => {
    const { item, listId, itemLabels } = this.props;

    if (labelId in itemLabels)
      db.removeItemLabel(item, labelId).catch(console.error);
    else db.addItemLabel(item, labelId, listId).catch(console.error);
  };

  render() {
    const { itemLabels, labelMap } = this.props;

    let amount = 0;
    const Content = [];
    if (labelMap) {
      for (const labelId in labelMap) {
        amount++;
        const { name, color } = labelMap[labelId];
        const assigned = labelId in itemLabels;
        Content.push(
          <button
            className={`tag ${labelColor(color)} ${
              assigned ? 'has-border' : ''
            }`}
            key={labelId}
            onClick={this.toggleLabel(labelId)}
            title={`${assigned ? 'Remove' : 'Add'} Label`}
          >
            {name}
          </button>,
        );
      }
    } else {
      for (const labelId in itemLabels) {
        amount++;
        const { name, color } = itemLabels[labelId];
        Content.push(
          <Link
            key={labelId}
            className={`tag ${labelColor(color)}`}
            to={`/labels/${labelId}`}
          >
            {name}
          </Link>,
        );
      }
    }

    return amount > 0 ? (
      <div className={`labels ${labelMap ? '' : 'low'}`}>{Content}</div>
    ) : null;
  }
}

export class FilteredLabelItems extends React.Component {
  state = {
    items: null,
    error: null,
  };

  componentDidMount() {
    this.subscribe();
  }

  componentDidUpdate(nextProps) {
    if (nextProps.match.params.labelId !== this.props.match.params.labelId) {
      this.unsubscribe();
      this.subscribe();
    } else if (nextProps.labelMap !== this.props.labelMap) {
      this.applyLabels();
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  applyLabels(initItems) {
    const { labelMap } = this.props;

    this.setState(({ items }) =>
      !initItems && !items
        ? {}
        : {
            items: (initItems || items).map((item) => {
              const newLabels = {}; // Need to recreate object to update React
              for (const itemLabelId in item.labels)
                newLabels[itemLabelId] = labelMap[itemLabelId];
              item.labels = newLabels;
              return { ...item };
            }),
          },
    );
  }

  unsubscribe = () => {};

  subscribe() {
    const {
      meta: { id },
    } = this.props;

    this.unsubscribe = db.selectByLabel(id, (error, items) => {
      if (error) this.setState({ error });
      else if (items) this.applyLabels(items);
    });
  }

  setColor = (color) => () => {
    const {
      meta: { id },
    } = this.props;

    db.updateLabel(id, { color }).catch(console.error);
  };

  setName = (name) => {
    const {
      meta: { id },
    } = this.props;

    db.updateLabel(id, { name }).catch(console.error);
  };

  delete = () => {
    const {
      meta: { id, name },
      history,
    } = this.props;

    confirm(
      <>
        Are you sure you want to delete the label <strong>{name}</strong>?
      </>,
    ).then((yes) => {
      if (yes) {
        history.replace('/labels');

        db.deleteLabel(id).catch(console.error);
      }
    });
  };

  render() {
    const { error, items } = this.state;
    const {
      meta: { name, color },
    } = this.props;

    if (error) throw error;

    let Items;
    if (!items) Items = <div>Loading filtered label items...</div>;
    else if (!items.length) Items = <div>No items!</div>;
    else
      Items = items.map((item) => (
        <ListItem key={item.id} item={item} listId={item.listId} showLabels />
      ));

    return (
      <div>
        <div className="level">
          <div className="level-left" style={{ flex: 1 }}>
            <div className="level-item" style={{ flex: 1 }}>
              <div style={{ flex: 1, marginRight: 16 }}>
                <p className="is-size-5 has-text-grey">Filtered By:</p>
                {/* <h2 className="is-size-2">{name}</h2> */}
                <LiveTextEdit
                  className="is-size-2 is-clipped"
                  maxLength={32}
                  onUpdate={this.setName}
                  value={name}
                  placeholder="Name cannot be empty"
                />
              </div>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              {colorMap.map(([colorClass, colorName], i) => (
                <button
                  className={`button is-rounded is-small ${colorClass} ${
                    color === i ? 'has-border' : ''
                  }`}
                  key={i}
                  onClick={this.setColor(i)}
                  style={{ marginRight: 8 }}
                  title={`Set color to ${colorName}`}
                />
              ))}
              <button
                className="button is-inverted"
                title="Delete Label"
                onClick={this.delete}
                style={{ marginLeft: 12 }}
              >
                <span className="icon is-small is-left">
                  <i className="fas fa-trash" />
                </span>
              </button>
            </div>
          </div>
        </div>
        <br />
        <div>{Items}</div>
      </div>
    );
  }
}

export class Labels extends React.Component {
  state = {
    labels: null,
    error: null,
  };

  componentDidMount() {
    this.unsubscribe = db.getLabels((error, labels) => {
      if (error) this.setState({ error });
      else {
        this.labelMap = {};
        for (const label of labels) {
          this.labelMap[label.id] = label;
        }
        this.setState({ labels });
      }
    }, true);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  create = () => {
    prompt('Enter a name for your label').then((name) => {
      if (name) {
        db.createLabel(name, 0)
          .then((doc) => this.props.history.push(`/labels/${doc.id}`))
          .catch(console.error);
      }
    });
  };

  renderItems = (props) => {
    if (!this.labelMap) return null; // loading...

    const labelId = props.match.params.labelId;
    const meta = this.labelMap[labelId];

    if (!meta) throw { code: 404 };

    return (
      <FilteredLabelItems {...props} meta={meta} labelMap={this.labelMap} />
    );
  };

  renderNoLabel = () => (
    <div>
      Please select a label or <a onClick={this.create}>create a new one</a>
    </div>
  );

  render() {
    const { error, labels } = this.state;

    if (error) throw error;

    let LabelContent;
    if (!labels) LabelContent = <div>Loading labels...</div>;
    else if (!labels.length) LabelContent = <div>No labels!</div>;
    else
      LabelContent = labels.map((label) => (
        <Link
          key={label.id}
          className={`button ${labelColor(label.color)}`}
          to={`/labels/${label.id}`}
        >
          {label.name}
        </Link>
      ));

    return (
      <section className="section">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-8-desktop">
              <div className="level">
                <div className="level-left">
                  <div className="level-item">
                    <h1 className="is-size-1">Labels</h1>
                  </div>
                </div>
                <div className="level-right">
                  <div className="level-item">
                    <button onClick={this.create} className="button is-light">
                      <span className="icon is-small is-left">
                        <i className="fas fa-plus" />
                      </span>
                      <span>Create New Label</span>
                    </button>
                  </div>
                </div>
              </div>
              <hr />
              <div className="multiline-items">{LabelContent}</div>
              <hr />
              {labels && (
                <Switch>
                  <Route
                    exact
                    path={this.props.match.url}
                    render={this.renderNoLabel}
                  />
                  <Route
                    exact
                    path={`${this.props.match.url}/:labelId`}
                    render={this.renderItems}
                  />
                  <Route
                    render={() => {
                      throw { code: 404 };
                    }}
                  />
                </Switch>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }
}
