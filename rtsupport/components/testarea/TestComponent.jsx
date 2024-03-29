import React, { Component } from 'react'
import { connect } from 'react-redux'
import Script from 'react-load-script'
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete'
import GoogleMapReact from 'google-map-react';
import { incrementAsync, decrementAsync } from './testActions.jsx'

const mapState = (state) => ({
    data: state.test.data,
    loading: state.test.loading
})

const actions = {
  incrementAsync,
  decrementAsync
}

const Marker = () => (
  <img src='/static/images/whazup-square-logo.png' className="map-marker rounded-circle" alt="..."/>
)
class TestComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      address: '',
      scriptLoaded: false
    };
  }

  static defaultProps = {
    center: {
      lat: 59.95,
      lng: 30.33
    },
    zoom: 11
  };
  handleScriptLoad = () => {
    this.setState({
      scriptLoaded: true
    })
  }

  handleChange = address => {
    this.setState({ address });
  };

  handleSelect = (address, placeId) => {
    this.setState({ address, placeId })
    geocodeByAddress(address)
      .then(results => getLatLng(results[0]))
      .then(latLng => console.log('Success', latLng))
      .catch(error => console.error('Error', error));
  };

  render() {
    const { incrementAsync, decrementAsync, data, loading } = this.props
    return (
      <div>
        <Script
          url='https://maps.googleapis.com/maps/api/js?key=AIzaSyA8xyoeTTfh5SOxWdF8C5J9oD0PrBQv3WQ&libraries=places'
          onLoad={this.handleScriptLoad}
        />
        <h1>Test Area</h1>
        <hr/>
        <button onClick={incrementAsync} type='button' className='btn btn-success'>Increment</button>
        <button onClick={decrementAsync} type='button' className='btn btn-danger'>Decrement</button>
        <h3>
          {
            loading
            ? <div>
                <span 
                  class="spinner-border spinner-border-sm h3 mr-2" 
                  role="status" 
                  aria-hidden="true">
                </span>
                Loading...
              </div>
            : <div>
                {data}
              </div>
          }          
        </h3>
        <hr/>
        {this.state.scriptLoaded &&
          <PlacesAutocomplete
            value={this.state.address}
            onChange={this.handleChange}
            onSelect={this.handleSelect}
          >
            {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
              <div>
                <input
                  {...getInputProps({
                    placeholder: 'Search Places ...',
                    className: 'location-search-input',
                  })}
                />
                <div className="autocomplete-dropdown-container">
                  {loading && <div>Loading...</div>}
                  {suggestions.map(suggestion => {
                    const className = suggestion.active
                      ? 'suggestion-item--active'
                      : 'suggestion-item';
                    // inline style for demonstration purpose
                    const style = suggestion.active
                      ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                      : { backgroundColor: '#ffffff', cursor: 'pointer' };
                    return (
                      <div
                        {...getSuggestionItemProps(suggestion, {
                          className,
                          style,
                        })}
                      >
                        <span>{suggestion.description}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </PlacesAutocomplete>
        }
        <div style={{ height: '100vh', width: '100%' }}>
          <GoogleMapReact
            bootstrapURLKeys={{ key: 'AIzaSyA8xyoeTTfh5SOxWdF8C5J9oD0PrBQv3WQ' }}
            defaultCenter={this.props.center}
            defaultZoom={this.props.zoom}
          >
            <Marker
              lat={59.955413}
              lng={30.337844}
            />
          </GoogleMapReact>
        </div>
      </div>
    )
  }
}

export default connect(mapState, actions)(TestComponent)