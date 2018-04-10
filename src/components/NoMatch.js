import React from 'react';

export default ({ history }) => (
  <section className="hero is-fullheight">
    <div className="hero-body">
      <div className="container has-text-centered">
        <h1 className="text-404">404</h1>
        <h3 className="is-size-2">Sorry, the thing you want isn't here.</h3>
        <br/>
        <br/>
        <button className="button is-medium is-primary" onClick={history.goBack}>Go back from wence you came!</button>
      </div>
    </div>
  </section>
);
