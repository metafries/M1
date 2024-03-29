import React, {Component} from 'react';
import { connect } from 'react-redux'
import { firestoreConnect } from 'react-redux-firebase'
import { Route, Switch, Redirect } from 'react-router-dom'
import Menu from './Menu.jsx'
import { STATUS_OPTS } from '../events/eventConstants.jsx'
import Recommended from '../useracct/Recommended.jsx'
import Subscriptions from '../useracct/Subscriptions.jsx'
import ActivityLog from '../useracct/ActivityLog.jsx'
import { 
  totalRecommended, 
  totalSubscriptions, 
  deleteEvent 
} from '../events/eventActions.jsx'
import Footer from '../nav/Footer.jsx'

const queryActivities = [
  {
    collection: 'activity',
    orderBy: ['timestamp', 'desc'],
  }
]

const mapState = (state) => ({
  loading: state.async.loading,   
  fbp: state.firebase.profile,
  fba: state.firebase.auth,
  activities: state.firestore.ordered.activity,  
})

const actions = {
  totalRecommended,
  totalSubscriptions,
  deleteEvent
}

class HomePage extends Component {
  state = {
    totalRecommended: 0,
    totalSubscriptions: 0,
  }
  async componentDidMount() {
    this.setState({
      totalRecommended: await this.props.totalRecommended(),
      totalSubscriptions: await this.props.totalSubscriptions(STATUS_OPTS[0]),
    })
  }
  handleDeleteEvent = (cancelEvent_id) => {
    this.props.deleteEvent(cancelEvent_id)
  }
  render() {
        const { totalRecommended, totalSubscriptions } = this.state
        const {loading, activities, fbp, fba} = this.props
        const authenticated = fba.isLoaded && !fba.isEmpty    
        return (
          <div>
            <div className='row'>
              <div className='col-lg-2'></div>
              <div className='col-lg-3 px-3'>
                <Menu 
                  loading={loading}
                  totalRecommended={totalRecommended}
                  totalSubscriptions={totalSubscriptions}
                  activities={activities}
                  fba={fba} 
                  fbp={fbp}
                />
                {
                  !authenticated &&
                  <div className='btn-group-vertical w-100 disabled'>
                    <button 
                      type="button" 
                      className="btn btn-lg btn-outline-dark rounded-0 font-weight-bold text-left px-2 my-1"
                      >
                      <i class="fas fa-minus mr-2"></i>
                      SUBSCRIPTIONS
                    </button>
                  </div>
                }
                {
                  !authenticated &&
                  <div className='btn-group-vertical w-100 disabled'>
                    <button 
                      type="button" 
                      className="btn btn-lg btn-outline-dark rounded-0 font-weight-bold text-left px-2 my-1"
                      >
                      <i class="fas fa-minus mr-2"></i>
                      ACTIVITY LOG
                    </button>
                  </div>
                }                
              </div>
              <div className='col-lg-5 px-0 mt-4'>
                <Switch>
                  <Redirect 
                    exact from={`/search/${fba.uid}`} to={`/search/${fba.uid}/recommended`}
                    />
                  <Route
                    path={`/search/${fba.uid}/recommended`}
                    render={() => <Recommended
                      type='Recommended'
                      handleDeleteEvent={this.handleDeleteEvent} 
                    />}
                  />
                  <Route
                    path={`/search/${fba.uid}/subscriptions`}
                    render={() => <Subscriptions                      
                      type='Subscribed'
                      statusOpts={STATUS_OPTS} 
                      handleDeleteEvent={this.handleDeleteEvent} 
                    />}
                  />
                  <Route
                    path={`/search/${fba.uid}/activity`}
                    render={() => <ActivityLog activity={activities}/>}
                  />
                </Switch>
              </div>
              <div className='col-lg-2'></div>
            </div>
            <Footer/>
          </div>
        )
  }
}

export default connect(mapState, actions)(
  firestoreConnect(queryActivities)(HomePage)
)