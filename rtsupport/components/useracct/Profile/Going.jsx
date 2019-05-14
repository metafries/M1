import React, { Component } from 'react'
import { connect } from 'react-redux'
import EventList from '../../events/EventList.jsx'
import { getTotalGoing, getGoingEvents } from '../../events/eventActions.jsx'
import Loader from '../../layout/Loader.jsx'

const mapState = (state) => ({
  events: state.events,
  loading: state.async.loading,
})

const actions = {
  getTotalGoing,
  getGoingEvents,
}

class Going extends Component {
  state = {
    loader: false,
    initialize: true,
    loadedEvents: [],
    total: 0,
  }
  async componentDidMount() {
    const {profileId} = this.props
    this.setState({
      total: await this.props.getTotalGoing(profileId)
    })
    let next = await this.props.getGoingEvents(profileId)
    if (next && next.docs && next.docs.length > 1) {      
      this.setState({
        loader: true,
        initialize: false,
      })
    }
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.events !== nextProps.events) {
      this.setState({
        loadedEvents: [...this.state.loadedEvents, ...nextProps.events]
      })
    }
  }
  loadMoreEvents = async() => {
    const {profileId, events} = this.props
    let lastEvent = events && events[events.length-1]
    let next = await this.props.getGoingEvents(profileId, lastEvent)
    if (next && next.docs && next.docs.length <= 1) {
      this.setState({
        loader: false
      })
    }
  }
  render() {
    const {loading, fba, fbp} = this.props  
    const {total, initialize, loadedEvents, loader} = this.state    
    const isCurrentUser = fba.uid === fbp.id  
    return (
      <div>
        <div class="input-group mb-2 px-3">
          <input 
            type="text" 
            class="form-control form-control-lg rounded-0 border-left-0 border-top-0 border-right-0 mr-2 font-weight-bold search-bar"
            placeholder='Sup? Search Events ...'
          />
          <div class="input-group-append">
            <button class="btn btn-link rounded-0 py-0 pl-2 pr-1 text-000 search-icon" type="button">
              <i class="fas fa-search h4"></i>
            </button>
          </div>
        </div>
        <h6 className='info-text-box mb-3 mx-3 p-2'>
          <i class="fas fa-info-circle mr-2"></i>
          The searching results are now limited to events that
          {
            isCurrentUser 
            ? <span className='mx-1'>you are</span> 
            : <span className='mx-1'>{fbp.displayName} is</span>
          }
          going to.
        </h6>
        <EventList 
            loadMoreEvents={this.loadMoreEvents}
            loader={loader}
            loading={loading}
            opts={total}
            events={loadedEvents} 
            fba={fba}
            initialize={initialize}
        />   
        {loading && !initialize && total != loadedEvents.length && <Loader/>}
      </div>
    )
  }
}

export default connect(mapState, actions)(Going)