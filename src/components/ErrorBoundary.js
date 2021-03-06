import React from 'react';
import { withRouter } from 'react-router-dom';

const getMessage = (code) => {
  switch (code) {
    case 'permission-denied':
    case 403:
      return [403, "You don't have access to this list!"];
    case 404:
      return [404, "Sorry, the thing you want isn't here."];
    case 501:
      return [501, 'Unimplemented! This feature will be available soon.'];
    default:
      return [500, 'Something unexpected occurred... Please try again'];
  }
};

class ErrorBoundary extends React.Component {
  state = {
    code: 0,
    message: '',
    hasError: false,
  };

  historyUnlisten = null;

  // TODO use mapErrorToState
  componentDidCatch(error) {
    let message,
      code = 500;

    if (typeof error === 'string') message = error;
    else {
      if (error && error.code) code = error.code;
      else if (error && error.status) code = error.status;
      [code, message] = getMessage(code);
    }

    this.setState({
      hasError: true,
      code,
      message,
    });

    this.resetOnRouteChange();
  }

  componentWillUnmount() {
    if (this.historyUnlisten) this.historyUnlisten();
  }

  // HACK
  resetOnRouteChange() {
    if (this.historyUnlisten) return;

    this.historyUnlisten = this.props.history.listen(() => {
      this.setState({ hasError: false });

      if (this.historyUnlisten) {
        this.historyUnlisten();
        this.historyUnlisten = null;
      }
    });
  }

  goBack = () => {
    this.historyUnlisten = null;

    // TODO: Somehow check if error is a result of navigating
    // this.props.history.goBack();
    this.props.history.push('/list');

    this.setState({
      hasError: false,
    });
  };

  render() {
    const { hasError, code, message } = this.state;

    return !hasError ? (
      this.props.children
    ) : (
      <section className="hero is-fullheight-flex">
        <div className="hero-body">
          <div className="container has-text-centered">
            <h1 className="big-error-code">{code}</h1>
            <h3 className="is-size-2">{message}</h3>
            <br />
            <br />
            <button
              className="button is-medium is-primary"
              onClick={this.goBack}
            >
              Go back from wence you came!
            </button>
          </div>
        </div>
      </section>
    );
  }
}

export default withRouter(ErrorBoundary);
