import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withFirestore, isEmpty } from 'react-redux-firebase'
import { DateTime } from "luxon";
import Menu from './Menu.jsx'
import { Route, Switch, Redirect } from 'react-router-dom'
import EventForm from '../../forms/EventForm.jsx'
import Attendees from './Attendees.jsx'
import { updateEvent } from '../eventActions.jsx'
import Footer from '../../nav/Footer.jsx'

const mapState = (state, ownProps) => {
    const eventId = ownProps.match.params.id
    const {events} = state.firestore.ordered    
    let event = {}
    if (eventId && events && events.length > 0) {
      event = events.find(e => e.id === eventId)
    }
    return {event}
}  

const actions = {
    updateEvent
}

class Dashboard extends Component {
    async componentDidMount() {
        const {firestore, match} = this.props
        await firestore.get(`events/${match.params.id}`)        
    }
    handleUpdateEvent = (event) => {
        this.props.updateEvent(event)
        this.props.history.push(`/events/${event.id}`)
    }
    render() {
        const {event} = this.props 
        if (!isEmpty(event) && typeof event.startDate !== 'string') {
            event.startDate = DateTime.fromJSDate(event.startDate.toDate()).toFormat('yyyy/MM/dd, HH:mm')
            event.endDate = DateTime.fromJSDate(event.endDate.toDate()).toFormat('yyyy/MM/dd, HH:mm')        
        }
        const options = [
            { label: event.hostedBy, value: event.hostedBy },
        ]
        return (
            <div className='row'>
                <div className='col-lg-4'>
                    <Menu event={event}/>
                </div>    
                <div className='col-lg-8'>
                    <Switch>
                        <Redirect 
                            exact 
                            from={`/manage/events/${event.id}`} 
                            to={`/manage/events/${event.id}/info`}
                        />
                        <Route 
                            path={`/manage/events/${event.id}/info`} 
                            render={()=>
                                <EventForm 
                                    options={options}
                                    event={event} 
                                    handleUpdateEvent={this.handleUpdateEvent}
                                    isManage={true}
                                />
                            }
                        />
                        <Route 
                            path={`/manage/events/${event.id}/attendees`} 
                            render={()=><Attendees attendees={event.attendees}/>}
                        />
                    </Switch>
                </div>
                <Footer/>
            </div>
        )        
    }
}

export default withFirestore(connect(mapState, actions)(Dashboard))
