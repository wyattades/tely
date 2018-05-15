import React from 'react';
import { withRouter } from 'react-router-dom';

const getMessage = (code) => {
  switch (code) {
    case 401: return 'You don\'t have access to this list!';
    case 404: return 'Sorry, the thing you want isn\'t here.';
    case 501: return 'Unimplemented! This feature will be available soon.';
    default: return 'Something unexpected occurred... Please try again';
  }
};

class ErrorBoundary extends React.Component {

  state = {
    code: 0,
    message: '',
    hasError: false,
  }

  componentDidCatch(error) {
    console.log('Caught Error:', error);
    let message,
        code = 500;
    
    if (typeof error === 'string') message = error;
    else {
      if (error && error.code) code = error.code;
      message = getMessage(code);
    }

    this.setState({
      hasError: true,
      code,
      message,
    });

    const unlisten = this.props.history.listen((location, action) => {
      this.setState({ hasError: false });
      unlisten();
    });
  }

  goBack = () => {
    // Somehow check if error is a result of navigating
    // this.props.history.goBack();
    this.props.history.push('/list');

    this.setState({
      hasError: false,
    });
  }

  render() {
    const { hasError, code, message } = this.state;

    return !hasError ? this.props.children : (
      <section className="hero is-fullheight">
        <div className="hero-body">
          <div className="container has-text-centered">
            <h1 className="big-error-code">{code}</h1>
            <h3 className="is-size-2">{message}</h3>
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
