import React from 'react';
import { Link } from 'react-router-dom';

import { SmallSection } from './misc';
import services from '../services';

export default () => (
  <SmallSection>
    <h1 className="is-size-1">About</h1>
    <br/>
    <div className="content">
      <h3>Finding movies! Sharing songs! Discord servers! The internet!</h3>
      <p>
        If any of the above exclamations interest you, then you are in the
        right place. Tely is a media aggregation platform that integrates with your
        Discord friends and servers so you can share another aspect of your
        personal life!
      </p>
      <h4>
        Use features such as:
      </h4>
      <ul>
        <li>Creating lists of media</li>
        <li>Sharing lists of media</li>
        <li>Deleting lists of media</li>
      </ul>
      <h4>With the following media types:</h4>
      <ul>
        {services.asArray.map(({ ID, LABEL, DESCRIPTION }) => (
          <li key={ID}><strong>{LABEL}:</strong> {DESCRIPTION}</li>
        ))}
      </ul>
      <br/>
      <p>
        <i>This application is currently in development</i>, so many features are on the way.
        Please feel free to submit <a href="https://github.com/wyattades/tely/issues">issues and feature requests</a>.
        If you don't care, <Link to="/">log in</Link> to get started!
      </p>
      <br/>
      <pre style={{ whiteSpace: 'normal' }}>
        Tely is an <a href="https://github.com/wyattades/tely">Open Source</a> app
        created by <a href="https://wyattades.com">Wyatt Ades</a>.
        <br/>
        Copyright © 2018
      </pre>
    </div>
  </SmallSection>
);
