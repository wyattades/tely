import React from 'react';
import { withRouter } from 'react-router-dom';

const getMessage = (code) => {
  switch (code) {
    case 404: return 'Sorry, the thing you want isn\'t here.';
    case 401: return 'You don\'t have access to this list!';
    default: return 'Something unexpected occurred... Please try again';
  }
};

class ErrorBoundary extends React.Component {

  state = {
    error: null,
    hasError: false,
  }

  componentDidCatch(error) {
    console.log('Caught Error:', error);
    this.setState({ hasError: true, error: error && error.code });
  }

  goBack = () => {
    this.setState({
      hasError: false,
    }, () => {
      this.props.history.goBack();
    });
  }

  render() {
    const { hasError, error } = this.state;

    return !hasError ? this.props.children : (
      <section className="hero is-fullheight">
        <div className="hero-body">
          <div className="container has-text-centered">
            <h1 className="big-error-code">{error || 500}</h1>
            <h3 className="is-size-2">{getMessage(error)}</h3>
            <br/>
            <br/>
            <button className="button is-medium is-primary"
              onClick={this.goBack}>Go back from wence you came!
            </button>
          </div>
        </div>
      </section>
    );
  }
}

export default withRouter(ErrorBoundary);
