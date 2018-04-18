import React from 'react';

export const spinner = (
  <div className="spinner">
    <div className="bounce1"/>
    <div className="bounce2"/>
    <div className="bounce3"/>
  </div>
);

export const SmallSection = ({ children }) => (
  <section className="section">
    <div className="container">
      <div className="columns is-centered">
        <div className="column is-half">
          {children}
        </div>
      </div>
    </div>
  </section>
);

export const ContainerSection = ({ children }) => (
  <section className="section">
    <div className="container">
      {children}
    </div>
  </section>
);
