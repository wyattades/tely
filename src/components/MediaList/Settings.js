import React from 'react';

export default ({ history, metaData, meta }) => {
  const deleteList = () => {
    if (window.confirm(`Are you sure you want to delete "${metaData.name}"`)) {
      meta.delete()
      .then(() => history.push('/list'))
      .catch(console.error);
    }
  };

  return <>
    <p className="is-size-5 has-text-grey">Settings:</p>
    <h1 className="is-size-1">{metaData.name}</h1>
    <br/>
    <div className="columns">
      <div className="column">
        <p>Put this list out of its misery. Remember that it cannot come back from the dead!</p>
      </div>
      <div className="column">
        <button className="button is-danger is-fullwidth" onClick={deleteList}>Delete List</button>
      </div>
    </div>
  </>;
};

