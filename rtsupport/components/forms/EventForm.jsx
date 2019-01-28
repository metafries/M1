import React, { Component } from 'react'
import Select from 'react-select'
import Script from 'react-load-script'
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete'
import { DateTimePicker, MuiPickersUtilsProvider } from 'material-ui-pickers';
import LuxonUtils from '@date-io/luxon';
import { DateTime } from "luxon";

const validInput = 'form-control rounded-0'
const invalidInput = 'form-control rounded-0 input-err'
const hideErrMsg = 'input-err-msg d-none'
const showErrMsg = 'input-err-msg d-block'

class EventForm extends Component {
  state = {
    selectedOption: null,    
    event: this.props.event,
    title_input: validInput,  
    title_err_msg: hideErrMsg,  
    titleInputLength: 0,
    address: '',
    scriptLoaded: false,
    addr_input: validInput,  
    addr_err_msg: hideErrMsg,  
    selectedStartDateError: false,
    selectedEndDateError: false,
    descInputLength: 0,
  }
  componentDidMount() {
    const {event, isManage} = this.props
    this.setState({
      selectedOption: { 
        label: event.hostedBy, 
        value: event.hostedBy 
      },
    })  
    this.setState({
      titleInputLength: event.title.trim().length
    })
    this.setState({
      descInputLength: event.description.trim().length
    })
    if (isManage) {
      this.isValidDateTime()      
    }
  }
  isNotEmptyTitle = (e) => {
    if (e.target.value.trim().length == 0) {      
      this.setState({
        title_err_msg: showErrMsg,
        title_input: invalidInput,        
      })  
    } else {
      this.setState({
        title_err_msg: hideErrMsg,
        title_input: validInput,                
      })  
    }
  }
  handleChange = (selectedOption) => {
    this.setState({ 
      selectedOption 
    });
    const update = this.state.event;
    update.hostedBy = selectedOption.value
    this.setState({
      event: update
    })
  }
  handleScriptLoad = () => {
    this.setState({
      scriptLoaded: true
    })
  }
  handleAddrChange = address => {
    this.setState({ address });
    const update = this.state.event;
    update.location = address
    this.setState({
      event: update
    })
    if (this.state.event.location.trim() == 0) {
      this.setState({
        addr_err_msg: showErrMsg,
        addr_input: invalidInput,        
      })  
    } else {
      this.setState({
        addr_err_msg: hideErrMsg,
        addr_input: validInput,                
      })  
    }
  };
  handleAddrSelect = (address, placeId) => {
    this.setState({ address, placeId })
    const update = this.state.event;
    update.location = address
    this.setState({
      event: update
    })
    geocodeByAddress(address)
      .then(results => getLatLng(results[0]))
      .then(latLng => {
        console.log('Success', latLng)
        const update = this.state.event;
        update.latlng = latLng
        this.setState({
          event: update
        })    
      })
      .catch(error => console.error('Error', error));
  };
  handlePermissionChange = (e) => {
    const update = this.state.event;
    update.permission = e.target.value
    this.setState({
      event: update
    })
  }
  handleStartDateChange = (date) => {
    const update = this.state.event;
    update.startDate = date.toFormat('yyyy/MM/dd, HH:mm')
    this.setState({
        event: update
    });
  };
  handleEndDateChange = (date) => {
    const update = this.state.event;
    update.endDate = date.toFormat('yyyy/MM/dd, HH:mm')
    this.setState({
        event: update
    });
  };
  isValidDateTime = () => {
    const {event, selectedStartDateError} = this.state
    const showStartDate = DateTime.fromFormat(event.startDate, 'yyyy/MM/dd, HH:mm')
    const showEndDate = DateTime.fromFormat(event.endDate, 'yyyy/MM/dd, HH:mm')

    this.setState({
      selectedStartDateError: showStartDate < DateTime.local(),
      selectedEndDateError: showEndDate < showStartDate.plus({minutes:1})
    })

    if (!selectedStartDateError) {
      if (showEndDate < showStartDate) {
        const update = this.state.event;
        update.endDate = update.startDate
        this.setState({
          event: update
        })
      }  
    }
  }
  onInputChange = (e) => {
    const userInput = this.state.event;
    userInput[e.target.name] = e.target.value;
    this.setState({
      event: userInput
    })
    if (e.target.name == 'title') {
      this.setState({
        titleInputLength: e.target.value.trim().length
      })
      this.isNotEmptyTitle(e)
    }
    if (e.target.name == 'description') {
      this.setState({
        descInputLength: e.target.value.trim().length
      })
    }
  }
  onFormSubmit = (e) => {
    e.preventDefault();
    const {
      event, 
      isEmptyTitle, 
      selectedStartDateError,
      selectedEndDateError, 
      titleInputLength,
    } = this.state
    if (titleInputLength == 0) {
      this.setState({
        title_err_msg: showErrMsg,
        title_input: invalidInput,        
      })  
      return
    } 
    if (event.location.trim() == 0) {
      this.setState({
        addr_err_msg: showErrMsg,
        addr_input: invalidInput,        
      })  
      return
    }
    const showStartDate = DateTime.fromFormat(event.startDate, 'yyyy/MM/dd, HH:mm')   
    if (showStartDate < DateTime.local()) {
      this.isValidDateTime()
      return
    }
    const showEndDate = DateTime.fromFormat(event.endDate, 'yyyy/MM/dd, HH:mm')    
    if (showEndDate < showStartDate.plus({minutes:1})) {
      this.isValidDateTime()
      return
    }
    if (this.props.isManage) {
      this.props.handleUpdateEvent(event)          
    } else {
      this.props.handleCreateEvent(event)                  
    }
  }
  render() {
    const {
      selectedOption, 
      event, 
      titleInputLength,
      title_err_msg, 
      title_input,       
      address,
      scriptLoaded,
      addr_err_msg,
      addr_input,      
      selectedStartDateError, 
      selectedEndDateError,
      descInputLength,
    } = this.state;
    const inputProps = {
      value: address,
      onChange: this.onChange,
    }
    const showStartDate = DateTime.fromFormat(event.startDate, 'yyyy/MM/dd, HH:mm')
    const showEndDate = DateTime.fromFormat(event.endDate, 'yyyy/MM/dd, HH:mm')
    return (
      <form onSubmit={this.onFormSubmit}>
        <Script
          url='https://maps.googleapis.com/maps/api/js?key=AIzaSyA8xyoeTTfh5SOxWdF8C5J9oD0PrBQv3WQ&libraries=places'
          onLoad={this.handleScriptLoad}
        />
        <div className="form-group">
          <h5 className='font-weight-bold'>Event Host</h5>
          <Select
            className='w-auto'
            value={selectedOption}
            onChange={this.handleChange}
            options={this.props.options}
            theme={(theme) => ({
              ...theme,
              borderRadius: 0,
              colors: {
              ...theme.colors,
                primary25: '#f5f5f5',
                primary50: '#f5f5f5',
                primary: '#303aa5',
              },
            })}
          />
        </div> 
        <div className="form-group">
          <h5 className='font-weight-bold'>
            Event Title
            <small className='float-right'>{titleInputLength}/128</small>
          </h5>
          <input 
            maxlength='128'
            name='title'                                                  
            onBlur={this.isNotEmptyTitle}                                                
            onChange={this.onInputChange}                                 
            value={event.title}            
            type="text" 
            className={title_input} 
            placeholder="Add a concise title"
          />
          <small className={title_err_msg}>Title is required.</small>
        </div>            
        <div class="form-group">
          <h5 className='font-weight-bold'>Location</h5>
          {scriptLoaded &&
            <PlacesAutocomplete
              value={event.location}
              onChange={this.handleAddrChange}
              onSelect={this.handleAddrSelect}
            >
              {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                <div>
                  <input
                    {...getInputProps({
                      placeholder: 'Include a place or address',                      
                    })}
                    className={addr_input}
                  />
                  <div className="autocomplete-dropdown-container">
                    {loading && <div>Loading...</div>}
                    {suggestions.map(suggestion => {
                      const className = suggestion.active
                        ? 'suggestion-item--active'
                        : 'suggestion-item';
                      // inline style for demonstration purpose
                      const style = suggestion.active
                        ? { backgroundColor: '#f5f5f5', cursor: 'pointer' }
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
          <small className={addr_err_msg}>Location is required.</small>
        </div>
        <div class="form-group">
          <h5 className='font-weight-bold'>Start Date, Time</h5>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <div className="picker ml-2">
              <DateTimePicker
                className='w-100'
                value={showStartDate}
                onChange={this.handleStartDateChange}    
                showTodayButton    
                minDate={DateTime.min(
                  DateTime.local().minus({days:1}),
                  showStartDate.minus({days:1})       
                )}                
                onFocus={this.isValidDateTime}                                
                error={selectedStartDateError}                        
                {...(selectedStartDateError ? 
                  { helperText: "An event start time must be greater than the current time." } : {}
                )}                
              />
            </div>
          </MuiPickersUtilsProvider>
        </div>
        <div class="form-group">
          <h5 className='font-weight-bold'>End Date, Time</h5>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <div className="picker ml-2">
              <DateTimePicker
                className='w-100'
                value={showEndDate}
                onChange={this.handleEndDateChange}    
                showTodayButton    
                minDate={DateTime.min(
                  showEndDate.minus({days:1}),
                  showStartDate.minus({days:1})
                )} 
                onFocus={this.isValidDateTime}
                error={this.state.selectedEndDateError}                        
                {...(selectedEndDateError ? 
                  { helperText: "The event end time must be greater than the start time." } : {}
                )}                 
              />
            </div>
          </MuiPickersUtilsProvider>
        </div>
        <div class="form-group">
          <h5 className='font-weight-bold'>
            Description
            <small className='float-right'>{descInputLength}/2048</small>            
          </h5>
          <textarea 
            maxlength='2048'
            name='description'
            onChange={this.onInputChange} 
            value={event.description}
            className="form-control rounded-0" 
            rows='3' 
            placeholder="Tell people more about the event"
          />
        </div>
        <hr/>
        <div class="form-check mb-3">
          <input 
            type="radio"
            name="permission"
            value={0}   
            checked={event.permission == 0}   
            onChange={this.handlePermissionChange}                              
            class="form-check-input"               
          />
          <h5 class="form-check-label font-weight-bold mx-2">Public</h5>
          <small class="text-muted ml-2">Anyone can join this event.</small>
        </div>
        <div class="form-check">
          <input 
            type="radio" 
            name="permission"
            value={1} 
            checked={event.permission == 1}
            onChange={this.handlePermissionChange}
            class="form-check-input" 
          />
          <h5 class="form-check-label font-weight-bold mx-2">Private</h5>
          <small class="text-muted ml-2">You choose who can join this event.</small>
        </div>
        <hr/>
        {
          this.props.isManage
          ? <button 
              type="submit" 
              class="btn btn-dark btn-lg rounded-0 text-ddc213 font-weight-bold">
              Update Event
            </button>
          : <button 
              type="submit" 
              class="btn btn-dark btn-lg rounded-0 text-ddc213 font-weight-bold">
              Create Event
            </button>          
        }
      </form>
    )
  }
}

export default EventForm