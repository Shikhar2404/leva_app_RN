import React, { Component } from 'react';
import { Text, View, } from 'react-native';
import PropTypes from 'prop-types';

const formatTimeString = (time, showMsecs) => {
  let msecs = time % 1000;

  if (msecs < 10) {
    msecs = `00${msecs}`;
  } else if (msecs < 100) {
    msecs = `0${msecs}`;
  }

  let seconds = Math.floor(time / 1000);
  let minutes = Math.floor(time / 60000);
  let hours = Math.floor(time / 3600000);
  seconds = seconds - minutes * 60;
  minutes = minutes - hours * 60;
  let formatted;
  if (showMsecs) {
    formatted = `${hours < 10 ? 0 : ""}${hours}:${minutes < 10 ? 0 : ""
      }${minutes}:${seconds < 10 ? 0 : ""}${seconds}:${msecs}`;
  } else {
    formatted = `${hours < 10 ? 0 : ""}${hours}:${minutes < 10 ? 0 : ""
      }${minutes}:${seconds < 10 ? 0 : ""}${seconds}`;
  }

  return formatted;
}
class StopWatch extends Component {
  static propTypes = {
    start: PropTypes.bool,
    reset: PropTypes.bool,
    msecs: PropTypes.bool,
    options: PropTypes.object,
    laps: PropTypes.bool,
    getTime: PropTypes.func,
    startTime: PropTypes.number,
    getMsecs: PropTypes.func,
  }

  constructor(props) {
    super(props);
    const { startTime } = props;
    this.state = {
      startTime: null,
      stopTime: null,
      pausedTime: null,
      started: false,
      elapsed: startTime || 0,
    };
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.reset = this.reset.bind(this);
    this.formatTime = this.formatTime.bind(this);
    const width = props.msecs ? 220 : 150;
    this.defaultStyles = {
      container: {
        backgroundColor: '#000',
        padding: 5,
        borderRadius: 5,
        width: width,
      },
      text: {
        fontSize: 18,
        color: '#8C939C',
        // marginLeft: 7,
      }
    };
  }

  componentDidMount() {
    if (this.props.start) {
      this.start();
    }
  }

  componentWillReceiveProps(newProps) {
    this.setState({ elapsed: newProps.startTime ? newProps.startTime : 0 })
    if (newProps.start) {
      this.start();
    } else {
      this.stop();
    }
    if (newProps.reset) {
      this.reset();
    }
  }


  
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  start() {
    if (this.props.laps && this.state.elapsed) {
      let lap = new Date() - this.state.stopTime;
      this.setState({ stopTime: null, pausedTime: this.state.pausedTime + lap })
    }
    this.setState({ startTime: this.state.elapsed ? new Date() - this.state.elapsed : new Date(), started: true });

    this.interval = this.interval ? this.interval : setInterval(() => { this.setState({ elapsed: new Date() - this.state.startTime }); }, 1);
  }

  stop() {
    if (this.interval) {
      if (this.props.laps) {
        this.setState({ stopTime: new Date() })
      }

      clearInterval(this.interval);
      this.interval = null;
    }
    this.setState({ started: false });
  }

  reset() {
    const { startTime } = this.props;
    this.setState({
      elapsed: startTime || 0,
      startTime: null,
      stopTime: null,
      pausedTime: null
    });
  }

  formatTime() {
    const { getTime, getMsecs, msecs } = this.props;
    const now = this.state.elapsed;
    const formatted = formatTimeString(now, msecs);
    if (typeof getTime === "function") {
      getTime(formatted,now);
    }
    if (typeof getMsecs === "function") {
      getMsecs(now)
    }
    return formatted;
  }


  render() {
    const styles = this.props.options ? this.props.options : this.defaultStyles;
    return (
      <View ref="stopwatch" style={styles.container}>
        <Text style={styles.text}>{this.formatTime()}</Text>
      </View>
    );
  }
}

export default StopWatch;
