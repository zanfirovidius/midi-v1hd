import React, { Component } from 'react';
// import logo from './logo.svg';
import 'semantic-ui-css/semantic.min.css';
import './App.css';

import WebMidi from 'webmidi';
import io from 'socket.io-client';

import { Button, Dropdown, Card } from 'semantic-ui-react';

const cameraOptions = [
  { text: 'Camera 1', value: 0 },
  { text: 'Camera 2', value: 1 },
  { text: 'Camera 3', value: 2 },
  { text: 'Camera 4', value: 3 },
  { text: 'Server', value: 99 }
];

document.addEventListener(
  'touchmove',
  function(event) {
    if (event.scale !== 1) {
      event.preventDefault();
    }
  },
  false
);

var lastTouchEnd = 0;
document.addEventListener(
  'touchend',
  function(event) {
    var now = new Date().getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  },
  false
);

var socket = io('192.168.1.35:8080'); //change to machineIp
// var socket = io('localhost:8080');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      select: null,
      buttonBankA: null,
      buttonBankB: null,
      switch: null,
      camera: null,
      messages: null
    };
  }

  addMessage(e) {
    if (this.state.camera !== 9999) {
      // debugger;
      console.log(e);

      if (e.type === 'controlchange') {
        if (e.controller.name === 'generalpurposeslider2') {
          this.setState({ switch: e.data[2] });
        } else {
          if (e.data[1] !== 32) {
            if (e.data[2] === 0) {
              this.setState({ bankA: e.data[2] });
            } else {
              this.setState({ bankB: e.data[2] });
            }
            this.setState({ select: e.data[2] });
          }
        }
      }

      if (e.type === 'programchange') {
        if (this.state.select === 0) {
          this.setState({ buttonBankA: e.value });
        } else {
          this.setState({ buttonBankB: e.value });
        }
      }
    }
  }

  sendMessage(e) {
    if (this.state.camera === 99) {
      socket.emit('SEND_MESSAGE', e);
    }
  }

  handleCameraChange = (e, { value }) => this.setState({ camera: value });

  componentDidMount() {
    socket.on('RECEIVE_MESSAGE', data => {
      this.addMessage(data);
    });

    WebMidi.enable(err => {
      if (err) {
        console.log('WebMidi could not be enabled.', err);
      } else {
        console.log('WebMidi enabled!');
        var input = WebMidi.inputs[0];
        if (input) {
          input.addListener('controlchange', 'all', e => {
            this.sendMessage(e);
          });
          input.addListener('programchange', 'all', e => {
            this.sendMessage(e);
          });
        }
      }
    }, true);
  }

  render() {
    let color = 'transparent';

    if (this.state.switch < 50) {
      if (this.state.buttonBankA === this.state.camera && this.state.buttonBankB === this.state.camera) {
        color = 'red';
      } else {
        if (this.state.buttonBankA === this.state.camera) {
          color = 'red';
        } else {
          if (this.state.buttonBankB === this.state.camera) {
            color = 'green';
          }
        }
      }
    } else {
      if (this.state.buttonBankA === this.state.camera && this.state.buttonBankB === this.state.camera) {
        color = 'red';
      } else {
        if (this.state.buttonBankA === this.state.camera) {
          color = 'green';
        } else {
          if (this.state.buttonBankB === this.state.camera) {
            color = 'red';
          }
        }
      }
    }

    let buttonClassName = `big-button big-button-${color}`;
    let cardClassName = `my-card my-card-${color}`;

    // just for DEBUGGING ///////////////////////////
    // <p>selected: {this.state.select}</p>
    // <p>switch: {this.state.switch}</p>
    // <p>buttonBankA: {this.state.buttonBankA}</p>
    // <p>buttonBankB: {this.state.buttonBankB}</p>
    // just for DEBUGGING ///////////////////////////

    return (
      <div className="App">
        <div className="container">
          <Card className={cardClassName}>
            <div
              className={buttonClassName}
              style={{
                backgroundColor: color
              }}
            />
            <Card.Content>
              <Card.Header>
                <Dropdown
                  onChange={this.handleCameraChange}
                  placeholder="Select camera"
                  fluid
                  selection
                  options={cameraOptions}
                />
              </Card.Header>
              <Card.Meta />
              <Card.Description />
            </Card.Content>
          </Card>
        </div>
      </div>
    );
  }
}

export default App;
