import React, { Component } from 'react';

class EnumStatusDisplay extends Component {
	constructor(props){
		super(props)
		this.dataCallback = this.dataCallback.bind(this);
    this.props.StreamingPageManager.RequestParameterWithCallback(this.props.parameter, this.dataCallback);
    this._isMounted = true;
    this.state = {
      stale: false,
      value: 0,
    }
	}

	componentWillUnmount() {
		this._isMounted = false;
		this.props.StreamingPageManager.destroy();
	}

  dataCallback(parameterData){
    if(this._isMounted)
    {
      if(isNaN(parameterData.Value)) {
        this.setState({value: parameterData.Value, stale: parameterData.IsStale});
      }
      else {
        this.setState({value: Number(parameterData.Value).toFixed(2), stale: parameterData.IsStale});
      }
    }
  }

	render() {
    let value = this.props.enumMap[this.state.value];
    let color = 'black';
    if (this.state.stale) {
      value = "STALE";
      color = 'red';
    }
    if (this.props.colorMap && !this.state.stale) {
      color = this.props.colorMap[this.state.value] || 'black';
    }
		return (
      <div className="form-group row" style={this.props.style}>
        <label className="col-sm-6" style={{fontWeight: 600}}>
          {this.props.name}
        </label>
        <div className="col-sm-6">
    			<div className="Generic-Value">
			      <span style={{color: color}}>{value}</span>
          </div>
        </div>
      </div>
		);
	}
}

export default EnumStatusDisplay;
