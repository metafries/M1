import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withFirestore } from 'react-redux-firebase'
import { DateTime } from "luxon";
import Menu from './Menu.jsx'
import { Route, Switch, Redirect } from 'react-router-dom'
import Info from './Info.jsx'
import Attendees from './Attendees.jsx'
import Tags from './Tags.jsx'
import { updateEvent, updateStatus, setNewMainPoster } from '../eventActions.jsx'
import Footer from '../../nav/Footer.jsx'
import { objToArray } from '../../../app/common/util/shapers.js'

const mapState = (state, ownProps) => {
    const eventId = ownProps.match.params.id
    const {events} = state.firestore.ordered    
    let event = {}
    if (eventId && events && events.length > 0) {
      event = events.find(e => e.id === eventId)
    }
    return {
        fba: state.firebase.auth,        
        fbp: state.firebase.profile,
        loading: state.async.loading,
        informMsg: state.events,
        event
    }
}  

const actions = {
    updateEvent,
    updateStatus,
    setNewMainPoster,
}

class Dashboard extends Component {
    async componentDidMount() {
        const {firestore, match} = this.props
        await firestore.get(`events/${match.params.id}`)        
    }
    render() {
        const {fba, fbp, loading, updateEvent, updateStatus, setNewMainPoster, informMsg, event} = this.props 
        if (event.startDate && event.startDate.seconds) {
            event.startDate = DateTime.fromJSDate(event.startDate.toDate()).toFormat('yyyy/MM/dd, HH:mm')
            event.endDate = DateTime.fromJSDate(event.endDate.toDate()).toFormat('yyyy/MM/dd, HH:mm')        
        }
        const options = [
            { label: event.hostedBy, value: event.hostedBy },
        ]
        const convertedAttendees = event && event.attendees && objToArray(event.attendees)        
        return (
            <div>
                <div className='row'>
                    <div className='col-lg-2'></div>
                    <div className='col-lg-3 px-3'>
                        <Menu fbp={fbp} event={event}/>
                    </div>    
                    <div className='col-lg-5 px-3'>
                        <Switch>
                            <Redirect 
                                exact 
                                from={`/manage/events/${event.id}`} 
                                to={`/manage/events/${event.id}/info`}
                            />
                            <Route 
                                path={`/manage/events/${event.id}/info`} 
                                render={()=>
                                    <Info 
                                        loading={loading}
                                        updateEvent={updateEvent}                                    
                                        setNewMainPoster={setNewMainPoster}
                                        informMsg={informMsg}
                                        options={options}
                                        event={event} 
                                        isManage={true}
                                    />
                                }
                            />
                            <Route 
                                path={`/manage/events/${event.id}/attendees`} 
                                render={()=><Attendees 
                                    currentUser={fba} 
                                    hostUid={(event && event.hostUid) || {}}
                                    attendees={convertedAttendees}
                                />}
                            />
                            <Route
                                path={`/manage/events/${event.id}/tags`}
                                render={()=><Tags 
                                    event={event} 
                                    updateStatus={updateStatus}
                                    loading={loading}
                                    informMsg={informMsg}
                                />}
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

export default withFirestore(connect(mapState, actions)(Dashboard))
