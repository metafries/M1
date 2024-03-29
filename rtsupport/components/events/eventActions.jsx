import { DateTime } from "luxon";
import cuid from 'cuid'
import { 
    SUCCESS,
    ERROR,
    UPDATE_EVENT, 
    UPDATE_STATUS,
    SET_NEW_MAIN_POSTER,
    DELETE_EVENT,
    FETCH_EVENTS,
} from './eventConstants.jsx'

import {
    startPhotoAction, 
    finishPhotoAction, 
    startAsyncAction,
    finishAsyncAction,
    asyncActionError,
} from '../async/asyncActions.jsx'

import { fetchSampleData } from '../../app/data/mockApi.js'
import { shapeNewEvent } from '../../app/common/util/shapers.js'
import firebase from '../../app/config/firebase.js'

export const getTotalLiked = (evtStatus, userId) =>
    async (dispatch) => {
        const firestore = firebase.firestore()
        const queryBase = firestore
            .collection('event_like')
            .where('userId', '==', userId)
        let eventsQuery = null
        const today = new Date(Date.now())
        switch (evtStatus.value) {
            case 'Active':
                eventsQuery = queryBase
                    .where('eventEndDate', '>=', today)
                    .where('status', '==', 0)    
                break;
            case 'Canceled':
                eventsQuery = queryBase
                    .where('status', '==', 1)                
                break;
            case 'Past':
                eventsQuery = queryBase
                    .where('eventEndDate', '<', today)
                    .where('status', '==', 0)    
                break;
            default:
                eventsQuery = queryBase
        }
        try {
            dispatch(startAsyncAction())
            let eventsQuerySnap = await eventsQuery.get()
            return eventsQuerySnap.docs.length
        } catch (e) {
            console.log(e)
        } finally {
            dispatch(finishAsyncAction())
        }        
    }

export const getLikedEvents = (evtStatus, userId, lastEvent) =>
    async (dispatch, getState) => {
        const firestore = firebase.firestore()
        const eventsRef = firestore
            .collection('event_like')
            .where('userId', '==', userId)
        try {
            dispatch(startAsyncAction())
            let lastEventSnap = lastEvent 
                && await firestore
                    .collection('event_like')
                    .doc(lastEvent.compositeId)
                    .get()
            let query = null
            const today = new Date(Date.now())
            switch (evtStatus.value) {
                case 'Active':
                    query = lastEvent
                        ? eventsRef
                            .where('eventEndDate', '>=', today)
                            .where('status', '==', 0)          
                            .orderBy('eventEndDate')                                  
                            .startAfter(lastEventSnap)
                            .limit(2)
                        : eventsRef
                            .where('eventEndDate', '>=', today)
                            .where('status', '==', 0)          
                            .orderBy('eventEndDate')                                  
                            .limit(2)            
                    break;
                case 'Canceled':
                    query = lastEvent
                    ? eventsRef
                        .where('status', '==', 1) 
                        .orderBy('eventEndDate')                              
                        .startAfter(lastEventSnap)
                        .limit(2)
                    : eventsRef
                        .where('status', '==', 1) 
                        .orderBy('eventEndDate')                                                      
                        .limit(2)            
                    break;
                case 'Past':
                    query = lastEvent
                        ? eventsRef
                            .where('eventEndDate', '<', today)
                            .where('status', '==', 0)
                            .orderBy('eventEndDate', 'desc')                                  
                            .startAfter(lastEventSnap)
                            .limit(2)
                        : eventsRef
                            .where('eventEndDate', '<', today)
                            .where('status', '==', 0) 
                            .orderBy('eventEndDate', 'desc')                                  
                            .limit(2)            
                            break;
                default:
                    query = lastEvent
                        ? eventsRef
                            .startAfter(lastEventSnap)
                            .limit(2)
                        : eventsRef                           
                            .limit(2)
            }
            let querySnap = await query.get()
            if (querySnap.docs.length === 0) {
                dispatch(finishAsyncAction())            
                return querySnap               
            }
            let events = []
            for (let i=0; i<querySnap.docs.length; i++) {
                const fields = querySnap.docs[i].data()
                let evt = await firestore
                    .collection('events')
                    .doc(fields.eventId)
                    .get()
                events.push({
                    ...evt.data(), 
                    id: fields.eventId,
                    compositeId: `${fields.eventId}_${fields.userId}`
                })
            }
            dispatch({
                type: FETCH_EVENTS,
                payload: {
                    events,
                }        
            })
            return querySnap
        } catch (e) {
            console.log(e)
        } finally {
            dispatch(finishAsyncAction())            
        }
    }
    
export const getTotalSaved = (evtStatus, userId) =>
    async (dispatch) => {
        const firestore = firebase.firestore()
        const queryBase = firestore
            .collection('event_save')
            .where('userId', '==', userId)
        let eventsQuery = null
        const today = new Date(Date.now())        
        switch (evtStatus.value) {
            case 'Active':
                eventsQuery = queryBase
                    .where('eventEndDate', '>=', today)
                    .where('status', '==', 0)    
                break;
            case 'Canceled':
                eventsQuery = queryBase
                    .where('status', '==', 1)                
                break;
            case 'Past':
                eventsQuery = queryBase
                    .where('eventEndDate', '<', today)
                    .where('status', '==', 0)    
                break;
            default:
                eventsQuery = queryBase
        }
        try {
            dispatch(startAsyncAction())
            let eventsQuerySnap = await eventsQuery.get()
            return eventsQuerySnap.docs.length
        } catch (e) {
            console.log(e)
        } finally {
            dispatch(finishAsyncAction())
        }
    }

export const getSavedEvents = (evtStatus, userId, lastEvent) => 
    async (dispatch, getState) => {
        const firestore = firebase.firestore()
        const eventsRef = firestore
            .collection('event_save')
            .where('userId', '==', userId)            
        try {
            dispatch(startAsyncAction())
            let lastEventSnap = lastEvent 
                && await firestore
                    .collection('event_save')
                    .doc(lastEvent.compositeId)
                    .get()
            let query = null
            const today = new Date(Date.now()) 
            switch (evtStatus.value) {
                case 'Active':
                    query = lastEvent
                        ? eventsRef
                            .where('eventEndDate', '>=', today)
                            .where('status', '==', 0)          
                            .orderBy('eventEndDate')                                  
                            .startAfter(lastEventSnap)
                            .limit(2)
                        : eventsRef
                            .where('eventEndDate', '>=', today)
                            .where('status', '==', 0)          
                            .orderBy('eventEndDate')                                  
                            .limit(2)            
                    break;
                case 'Canceled':
                    query = lastEvent
                    ? eventsRef
                        .where('status', '==', 1) 
                        .orderBy('eventEndDate')                              
                        .startAfter(lastEventSnap)
                        .limit(2)
                    : eventsRef
                        .where('status', '==', 1) 
                        .orderBy('eventEndDate')                                                      
                        .limit(2)            
                    break;
                case 'Past':
                    query = lastEvent
                        ? eventsRef
                            .where('eventEndDate', '<', today)
                            .where('status', '==', 0)
                            .orderBy('eventEndDate', 'desc')                                  
                            .startAfter(lastEventSnap)
                            .limit(2)
                        : eventsRef
                            .where('eventEndDate', '<', today)
                            .where('status', '==', 0) 
                            .orderBy('eventEndDate', 'desc')                                  
                            .limit(2)            
                            break;
                default:
                    query = lastEvent
                        ? eventsRef
                            .startAfter(lastEventSnap)
                            .limit(2)
                        : eventsRef
                            .limit(2)
            }
            let querySnap = await query.get()
            if (querySnap.docs.length === 0) {
                dispatch(finishAsyncAction())            
                return querySnap               
            }
            let events = []
            for (let i=0; i<querySnap.docs.length; i++) {
                let evt = await firestore
                    .collection('events')
                    .doc(querySnap.docs[i].data().eventId)
                    .get()
                    events.push({
                        ...evt.data(), 
                        id: querySnap.docs[i].data().eventId,
                        compositeId: 
                            querySnap.docs[i].data().eventId 
                                + '_'
                                + querySnap.docs[i].data().userId
                    })
            }
            dispatch({
                type: FETCH_EVENTS,
                payload: {
                    events,
                }        
            })
            return querySnap
        } catch (e) {
            console.log(e)
        } finally {
            dispatch(finishAsyncAction())            
        }
    }
    
export const getTotalAttended = (userId) =>
    async (dispatch) => {
        let today = new Date(Date.now())
        const firestore = firebase.firestore()
        const eventsQuery = firestore
            .collection('event_attendee')
            .where('userId', '==', userId)
            .where('eventEndDate', '<', today)
            .where('status', '==', 0)
        try {
            dispatch(startAsyncAction())
            let eventsQuerySnap = await eventsQuery.get()
            return eventsQuerySnap.docs.length
        } catch (e) {
            console.log(e)
        } finally {
            dispatch(finishAsyncAction())
        }
    }

export const getAttendedEvents = (userId, lastEvent) => 
    async (dispatch, getState) => {
        let today = new Date(Date.now())        
        const firestore = firebase.firestore()
        const eventsRef = firestore.collection('event_attendee')
        try {
            dispatch(startAsyncAction())
            let lastEventSnap = lastEvent 
                && await firestore
                    .collection('event_attendee')
                    .doc(lastEvent.compositeId)
                    .get()
            let query = lastEvent
                ? eventsRef
                    .where('userId', '==', userId)
                    .where('eventEndDate', '<', today)
                    .where('status', '==', 0)  
                    .orderBy('eventEndDate', 'desc')      
                    .startAfter(lastEventSnap)
                    .limit(2)
                : eventsRef
                    .where('userId', '==', userId)
                    .where('eventEndDate', '<', today)
                    .where('status', '==', 0)        
                    .orderBy('eventEndDate', 'desc')
                    .limit(2)
            let querySnap = await query.get()
            if (querySnap.docs.length === 0) {
                dispatch(finishAsyncAction())            
                return querySnap               
            }
            let events = []
            for (let i=0; i<querySnap.docs.length; i++) {
                let evt = await firestore
                    .collection('events')
                    .doc(querySnap.docs[i].data().eventId)
                    .get()
                    events.push({
                        ...evt.data(), 
                        id: querySnap.docs[i].data().eventId,
                        compositeId: 
                            querySnap.docs[i].data().eventId 
                                + '_'
                                + querySnap.docs[i].data().userId
                    })
                }
            dispatch({
                type: FETCH_EVENTS,
                payload: {
                    events,
                }        
            })
            return querySnap
        } catch (e) {
            console.log(e)
        } finally {
            dispatch(finishAsyncAction())            
        }
    }

export const getTotalGoing = (evtStatus, userId) =>
    async (dispatch) => {
        let today = new Date(Date.now())
        const firestore = firebase.firestore()
        const queryBase = firestore
            .collection('event_attendee')
            .where('userId', '==', userId)
            .where('eventEndDate', '>=', today)
        let eventsQuery = null
        switch (evtStatus.value) {
            case 'Active':
                eventsQuery = queryBase
                    .where('status', '==', 0)    
                break;
            case 'Canceled':
                eventsQuery = queryBase
                    .where('status', '==', 1)    
                break;
            default:
                eventsQuery = queryBase
        }
        try {
            dispatch(startAsyncAction())
            let eventsQuerySnap = await eventsQuery.get()
            return eventsQuerySnap.docs.length
        } catch (e) {
            console.log(e)
        } finally {
            dispatch(finishAsyncAction())
        }
    }

export const getGoingEvents = (evtStatus, userId, lastEvent) => 
    async (dispatch, getState) => {
        let today = new Date(Date.now())        
        const firestore = firebase.firestore()
        const eventsRef = firestore
            .collection('event_attendee')
            .where('userId', '==', userId)
            .where('eventEndDate', '>=', today)
        try {
            dispatch(startAsyncAction())
            let lastEventSnap = lastEvent 
                && await firestore
                    .collection('event_attendee')
                    .doc(lastEvent.compositeId)
                    .get()
            let query = null
            switch (evtStatus.value) {
                case 'Active':
                    query = lastEvent
                        ? eventsRef
                            .where('status', '==', 0) 
                            .orderBy('eventEndDate')
                            .startAfter(lastEventSnap)
                            .limit(2)
                        : eventsRef
                            .where('status', '==', 0) 
                            .orderBy('eventEndDate')                            
                            .limit(2)
                    break;
                case 'Canceled':
                    query = lastEvent
                        ? eventsRef
                            .where('status', '==', 1)   
                            .orderBy('eventEndDate')                                                        
                            .startAfter(lastEventSnap)
                            .limit(2)
                        : eventsRef
                            .where('status', '==', 1) 
                            .orderBy('eventEndDate')                                                        
                            .limit(2)
                    break;
                default:
                    query = lastEvent
                        ? eventsRef
                            .startAfter(lastEventSnap)
                            .limit(2)
                        : eventsRef
                            .limit(2)
            }
            let querySnap = await query.get()
            if (querySnap.docs.length === 0) {
                dispatch(finishAsyncAction())            
                return querySnap               
            }
            let events = []
            for (let i=0; i<querySnap.docs.length; i++) {
                let evt = await firestore
                    .collection('events')
                    .doc(querySnap.docs[i].data().eventId)
                    .get()
                    events.push({
                        ...evt.data(), 
                        id: querySnap.docs[i].data().eventId,
                        compositeId: 
                            querySnap.docs[i].data().eventId 
                                + '_'
                                + querySnap.docs[i].data().userId
                    })
                }
            dispatch({
                type: FETCH_EVENTS,
                payload: {
                    events,
                }        
            })
            return querySnap
        } catch (e) {
            console.log(e)
        } finally {
            dispatch(finishAsyncAction())            
        }
    }
    
export const getTotalHosting = (evtStatus, userId) =>
    async (dispatch) => {
        let today = new Date(Date.now())
        const firestore = firebase.firestore()
        const queryBase = firestore
            .collection('event_attendee')
            .where('userId', '==', userId)
            .where('host', '==', true)
            .where('eventEndDate', '>=', today)            
        let eventsQuery = null
        switch (evtStatus.value) {
            case 'Active':
                eventsQuery = queryBase.where('status', '==', 0)                 
                break;
            case 'Canceled':
                eventsQuery = queryBase.where('status', '==', 1) 
                break;
            default:
                eventsQuery = queryBase
        }
        try {
            dispatch(startAsyncAction())
            let eventsQuerySnap = await eventsQuery.get()
            return eventsQuerySnap.docs.length
        } catch (e) {
            console.log(e)
        } finally {
            dispatch(finishAsyncAction())
        }
    }

export const getHostingEvents = (evtStatus, userId, lastEvent) => 
    async (dispatch, getState) => {
        let today = new Date(Date.now())        
        const firestore = firebase.firestore()
        const eventsRef = firestore
            .collection('event_attendee')
            .where('userId', '==', userId)
            .where('host', '==', true)
            .where('eventEndDate', '>=', today)
        try {
            dispatch(startAsyncAction())
            let lastEventSnap = lastEvent 
                && await firestore
                    .collection('event_attendee')
                    .doc(lastEvent.compositeId)
                    .get()
            let query = null
            switch (evtStatus.value) {
                case 'Active':
                    query = lastEvent
                        ? eventsRef
                            .where('status', '==', 0) 
                            .orderBy('eventEndDate')                                                        
                            .startAfter(lastEventSnap)
                            .limit(2)
                        : eventsRef
                            .where('status', '==', 0) 
                            .orderBy('eventEndDate')                                                        
                            .limit(2)
                    break;
                case 'Canceled':
                    query = lastEvent
                        ? eventsRef
                            .where('status', '==', 1)   
                            .orderBy('eventEndDate')                                                        
                            .startAfter(lastEventSnap)
                            .limit(2)
                        : eventsRef
                            .where('status', '==', 1) 
                            .orderBy('eventEndDate')                                                        
                            .limit(2)
                    break;
                default:
                    query = lastEvent
                        ? eventsRef                            
                            .startAfter(lastEventSnap)
                            .limit(2)
                        : eventsRef
                            .limit(2)
            }
            let querySnap = await query.get()
            if (querySnap.docs.length === 0) {
                dispatch(finishAsyncAction())            
                return querySnap               
            }
            let events = []
            for (let i=0; i<querySnap.docs.length; i++) {
                let evt = await firestore
                    .collection('events')
                    .doc(querySnap.docs[i].data().eventId)
                    .get()
                    events.push({
                        ...evt.data(), 
                        id: querySnap.docs[i].data().eventId,
                        compositeId: 
                            querySnap.docs[i].data().eventId 
                                + '_'
                                + querySnap.docs[i].data().userId
                    })
            }
            console.log(events)
            dispatch({
                type: FETCH_EVENTS,
                payload: {
                    events,
                }        
            })
            return querySnap
        } catch (e) {
            console.log(e)
        } finally {
            dispatch(finishAsyncAction())            
        }
    }
    
export const totalRecommended = () =>
    async (dispatch) => {
        let today = new Date(Date.now())
        const firestore = firebase.firestore()
        const eventsQuery = firestore
            .collection('events')
            .where('status', '==', 0) 
            .where('endDate', '>=', today)
        try {
            dispatch(startAsyncAction())
            let eventsQuerySnap = await eventsQuery.get()
            return eventsQuerySnap.docs.length
        } catch (e) {
            console.log(e)
        } finally {
            dispatch(finishAsyncAction())
        }
    }

export const recommendedEvents = (lastEvent) => 
    async (dispatch, getState) => {
        let today = new Date(Date.now())
        const firestore = firebase.firestore()
        const eventsRef = firestore.collection('events')
        try {
            dispatch(startAsyncAction())
            let lastEventSnap = lastEvent 
                && await firestore.collection('events').doc(lastEvent.id).get()
            let query = lastEvent
                ? eventsRef
                    .where('status', '==', 0)                
                    .where('endDate', '>=', today)
                    .orderBy('endDate')
                    .startAfter(lastEventSnap)
                    .limit(2)
                : eventsRef
                    .where('status', '==', 0)                                    
                    .where('endDate', '>=', today)
                    .orderBy('endDate')
                    .limit(2)
            let querySnap = await query.get()
            if (querySnap.docs.length === 0) {
                dispatch(finishAsyncAction())            
                return querySnap               
            }
            let events = []
            for (let i=0; i<querySnap.docs.length; i++) {
                let evt = {
                    ...querySnap.docs[i].data(),
                    id: querySnap.docs[i].id,
                }
                events.push(evt)
            }
            dispatch({
                type: FETCH_EVENTS,
                payload: {
                    events,
                }        
            })
            return querySnap
        } catch (e) {
            console.log(e)
        } finally {
            dispatch(finishAsyncAction())            
        }
    }

export const getTotalOfContinent = (status, continentCode) =>
    async (dispatch) => {
        const firestore = firebase.firestore()
        const queryBase = firestore
            .collection('events')
            .where('continent', '==', continentCode)  
        let eventsQuery = null
        const today = new Date(Date.now())                
        switch (status.value) {
            case 'Active':
                eventsQuery = queryBase
                    .where('endDate', '>=', today)
                    .where('status', '==', 0)   
                break;
            case 'Canceled':
                eventsQuery = queryBase
                    .where('status', '==', 1)
                break;
            case 'Past':
                eventsQuery = queryBase
                    .where('endDate', '<', today)
                    .where('status', '==', 0)   
                break;
            default:
                eventsQuery = queryBase
        }
        try {
            dispatch(startAsyncAction())
            let eventsQuerySnap = await eventsQuery.get()
            return eventsQuerySnap.docs.length
        } catch (e) {
            console.log(e)
        } finally {
            dispatch(finishAsyncAction())
        }
    }

export const getEventsByContinent = (status, continentCode, lastEvent) => 
    async (dispatch, getState) => {
        const firestore = firebase.firestore()
        const eventsRef = firestore
            .collection('events')
            .where('continent', '==', continentCode)
        try {
            dispatch(startAsyncAction())
            let lastEventSnap = lastEvent 
                && await firestore.collection('events').doc(lastEvent.id).get()
            let query = null
            const today = new Date(Date.now())                            
            switch (status.value) {
                case 'Active':
                    query = lastEvent
                        ? eventsRef
                            .where('endDate', '>=', today)
                            .where('status', '==', 0)   
                            .orderBy('endDate')
                            .startAfter(lastEventSnap)
                            .limit(2)              
                        : eventsRef
                            .where('endDate', '>=', today)
                            .where('status', '==', 0)   
                            .orderBy('endDate')
                            .limit(2)
                    break;   
                case 'Canceled':
                    query = lastEvent
                        ? eventsRef
                            .where('status', '==', 1)
                            .orderBy('createdAt', 'desc')
                            .startAfter(lastEventSnap)
                            .limit(2)                    
                        : eventsRef
                            .where('status', '==', 1)                            
                            .orderBy('createdAt', 'desc')
                            .limit(2)    
                    break;     
                case 'Past':
                    query = lastEvent
                        ? eventsRef
                            .where('endDate', '<', today)
                            .where('status', '==', 0)   
                            .orderBy('endDate', 'desc')
                            .startAfter(lastEventSnap)
                            .limit(2)              
                        : eventsRef
                            .where('endDate', '<', today)
                            .where('status', '==', 0)   
                            .orderBy('endDate', 'desc')
                            .limit(2)            
                    break;                       
                default:
                    query = lastEvent
                        ? eventsRef
                            .orderBy('createdAt', 'desc')
                            .startAfter(lastEventSnap)
                            .limit(2)                    
                        : eventsRef
                            .orderBy('createdAt', 'desc')
                            .limit(2)     

            }            
            let querySnap = await query.get()
            if (querySnap.docs.length === 0) {
                dispatch(finishAsyncAction())
                return querySnap
            }
            let events = []
            for (let i=0; i<querySnap.docs.length; i++) {
                let evt = {
                    ...querySnap.docs[i].data(),
                    id: querySnap.docs[i].id,
                }
                events.push(evt)
            }
            dispatch({
                type: FETCH_EVENTS,
                payload: {
                    events,
                }
            })
            return querySnap
        } catch (e) {
            console.log(e)
        } finally {
            dispatch(finishAsyncAction())
        }
    }

export const totalSubscriptions = (status) =>
    async (dispatch) => {
        const firestore = firebase.firestore()
        const queryBase = firestore.collection('events')
        let eventsQuery = null
        const today = new Date(Date.now())
        switch (status.value) {
            case 'Active':
                eventsQuery = queryBase
                    .where('endDate', '>=', today)
                    .where('status', '==', 0)   
                break;
            case 'Canceled':
                eventsQuery = queryBase
                    .where('status', '==', 1)
                break;   
            case 'Past':
                eventsQuery = queryBase
                    .where('endDate', '<', today)
                    .where('status', '==', 0)   
                break;         
            default:
                eventsQuery = queryBase
        }
        try {
            dispatch(startAsyncAction())
            let eventsQuerySnap = await eventsQuery.get()
            return eventsQuerySnap.docs.length
        } catch (e) {
            console.log(e)
        } finally {
            dispatch(finishAsyncAction())
        }
    }

export const subscribedEvents = (status, lastEvent) => 
    async (dispatch, getState) => {
        const firestore = firebase.firestore()
        const eventsRef = firestore.collection('events')
        try {
            dispatch(startAsyncAction())
            let lastEventSnap = lastEvent 
                && await firestore.collection('events').doc(lastEvent.id).get()
            let query = null
            const today = new Date(Date.now())
            switch (status.value) {
                case 'Active':
                    query = lastEvent
                        ? eventsRef
                            .where('endDate', '>=', today)
                            .where('status', '==', 0)   
                            .orderBy('endDate')
                            .startAfter(lastEventSnap)
                            .limit(2)              
                        : eventsRef
                            .where('endDate', '>=', today)
                            .where('status', '==', 0)   
                            .orderBy('endDate')
                            .limit(2)
                    break;                
                case 'Canceled':
                    query = lastEvent
                        ? eventsRef
                            .where('status', '==', 1)
                            .orderBy('createdAt', 'desc')
                            .startAfter(lastEventSnap)
                            .limit(2)                    
                        : eventsRef
                            .where('status', '==', 1)                            
                            .orderBy('createdAt', 'desc')
                            .limit(2)    
                    break;     
                case 'Past':
                    query = lastEvent
                        ? eventsRef
                            .where('endDate', '<', today)
                            .where('status', '==', 0)   
                            .orderBy('endDate', 'desc')
                            .startAfter(lastEventSnap)
                            .limit(2)              
                        : eventsRef
                            .where('endDate', '<', today)
                            .where('status', '==', 0)   
                            .orderBy('endDate', 'desc')
                            .limit(2)            
                    break;    
                default:
                    query = lastEvent
                        ? eventsRef
                            .orderBy('createdAt', 'desc')
                            .startAfter(lastEventSnap)
                            .limit(2)
                        : eventsRef
                            .orderBy('createdAt', 'desc')
                            .limit(2)    
            }
            let querySnap = await query.get()
            if (querySnap.docs.length === 0) {
                dispatch(finishAsyncAction())            
                return querySnap               
            }        
            let events = []
            for (let i=0; i<querySnap.docs.length; i++) {
                let evt = {
                    ...querySnap.docs[i].data(),
                    id: querySnap.docs[i].id,
                }
                events.push(evt)
            }
            dispatch({
                type: FETCH_EVENTS,
                payload: {
                    events,
                }        
            })
            return querySnap
        } catch (e) {
            console.log(e)
        } finally {
            dispatch(finishAsyncAction())            
        }
    }

export const fetchEvents = (events) => {
    return {
        type: FETCH_EVENTS,
        payload: events
    }
}

export const createEvent = (event) => {
    return async(dispatch, getState, {getFirebase, getFirestore}) => {
        const firebase = getFirebase()
        const firestore = getFirestore()
        const currentUser = firebase.auth().currentUser
        const avatarUrl = getState().firebase.profile.avatarUrl
        let newEvent = shapeNewEvent(currentUser, avatarUrl, event)
        try {
            let createdEvent = await firestore.add(`events`, newEvent)
            const compositeId = `${createdEvent.id}_${currentUser.uid}`
            const fields = {
                eventId: createdEvent.id,
                userId: currentUser.uid,
                eventStartDate: event.startDate,
                eventEndDate: event.endDate,
                host: true,
                status: 0,
            }
            await firestore.set(`event_attendee/${compositeId}`, fields)
            await firestore.set(`event_save/${compositeId}`, fields)
        } catch (e) {
            throw new Error('ERR_CREATE_EVENT')
        }
    }
}

export const updateEvent = (event) => {
    return async(dispatch, getState) => {
        const firestore = firebase.firestore()
        event.startDate = DateTime
            .fromFormat(event.startDate, 'yyyy/MM/dd, HH:mm')
            .toJSDate()
        event.endDate = DateTime
            .fromFormat(event.endDate, 'yyyy/MM/dd, HH:mm')
            .toJSDate()
        try {
            dispatch(startAsyncAction())
            let eventDocRef = firestore.collection('events').doc(event.id)
            let startDateEqual = DateTime
                .fromObject(getState().firestore.ordered.events[0].startDate)
                .equals(DateTime.fromObject(event.startDate))
            let endDateEqual = DateTime
                .fromObject(getState().firestore.ordered.events[0].endDate)
                .equals(DateTime.fromObject(event.endDate))
            if (startDateEqual || endDateEqual) {
                let batch = firestore.batch()
                await batch.update(eventDocRef, event)
                let eventAttendeeRef = firestore.collection('event_attendee')
                let eventAttendeeQuery = await eventAttendeeRef
                    .where('eventId', '==', event.id)
                let eventAttendeeQuerySnap = await eventAttendeeQuery.get()
                for (let i=0; i<eventAttendeeQuerySnap.docs.length; i++) {
                    let eventAttendeeDocRef = await firestore
                        .collection('event_attendee')
                        .doc(eventAttendeeQuerySnap.docs[i].id)
                    await batch.update(eventAttendeeDocRef, {
                        eventStartDate: DateTime
                            .fromFormat(event.startDate, 'yyyy/MM/dd, HH:mm')
                            .toJSDate(),
                        eventEndDate: DateTime
                            .fromFormat(event.endDate, 'yyyy/MM/dd, HH:mm')
                            .toJSDate(),
                    })
                }
                await batch.commit()
            } else {
                await eventDocRef.update(event)
            }
            dispatch({
                type: SUCCESS,
                payload: {
                    opts: UPDATE_EVENT,
                    ok: {
                        message: 'The event updated successfully',
                    },
                },
            })
        } catch (e) {
            dispatch({
                type: ERROR,
                payload: {
                    opts: UPDATE_EVENT,
                    err: e,
                },
            })
        } finally {
            dispatch(finishAsyncAction())
        }
    }
}

export const setNewMainPoster = (event, file) =>
    async (
        dispatch,
        getState,
        {getFirebase, getFirestore},
    ) => {
        const firebase = getFirebase()
        const firestore = getFirestore()
        const eventId = event.id                
        const storagePath = `events/${eventId}/posters`
        const imgId = cuid()
        const fileOpts = {name: imgId}
        try {
            dispatch(startAsyncAction())
            let uploadedFile = await firebase.uploadFile(storagePath, file, null, fileOpts)
            let downloadURL = await uploadedFile.uploadTaskSnapshot.ref.getDownloadURL()
            event.startDate = DateTime
                .fromFormat(event.startDate, 'yyyy/MM/dd, HH:mm')
                .toJSDate()
            event.endDate = DateTime
                .fromFormat(event.endDate, 'yyyy/MM/dd, HH:mm')
                .toJSDate()
            const _event = {
                ...event,
                posterUrl: downloadURL,
            }
            await firestore.update(`events/${eventId}`, _event)
            const poster = {
                downloadURL: downloadURL,
                uploadedAt: firestore.FieldValue.serverTimestamp(),
            }
            await firestore.update(`events/${eventId}`, {
                [`posters.${imgId}`]: poster,
            })
            dispatch({
                type: SUCCESS,
                payload: {
                    opts: SET_NEW_MAIN_POSTER,
                    ok: {
                        message: 'Your poster has changed successfully',
                    },
                },
            })
        } catch (e) {
            dispatch({
                type: ERROR,
                payload: {
                    opts: SET_NEW_MAIN_POSTER,
                    err: {
                        message: 'Failed to upload the image.',
                    }
                },
            })
        } finally {
            dispatch(finishAsyncAction())
        }
    }

export const setToMain = (photo, eventId) =>
    async (
        dispatch,
        getState,
        {getFirestore},
    ) => {
        const firestore = getFirestore()
        try {
            dispatch(startPhotoAction())
            await firestore.update(`events/${eventId}`, {
                posterUrl: photo.downloadURL
            })
        } finally {
            dispatch(finishPhotoAction())
        }
    }

export const deletePoster = (photo, event) =>
    async (
        dispatch,
        getState,
        {getFirestore}
    ) => {
        const firestore = getFirestore()
        try {
            dispatch(startPhotoAction())                    
            await firestore.update(`events/${event.id}`, {
                [`posters.${photo.id}`]: firestore.FieldValue.delete()
            })
            if (photo.downloadURL === event.posterUrl) {
                await firestore.update(`events/${event.id}`, {
                    posterUrl: firestore.FieldValue.delete()
                })
            }
        } finally {
            dispatch(finishPhotoAction())
        }
    }

export const updateStatus = (code, eventId) => 
    async (
        dispatch, 
        getState, 
        {getFirestore}
    ) => {
        const firestore = getFirestore()
        try {
            dispatch(startAsyncAction())
            await firestore.update(`events/${eventId}`, {
                status: code
            })
            const firestorejs = firebase.firestore()
            const queryRefs = [
                firestorejs.collection('event_attendee'),
                firestorejs.collection('event_like'),
                firestorejs.collection('event_save'),
            ]        
            const batch = firestorejs.batch()
            for (let i=0; i<queryRefs.length; i++) {
                const query = await queryRefs[i].where('eventId', '==', eventId)
                const querySnapShot = await query.get()
                querySnapShot.forEach((docSnapShot) => {
                    batch.update(docSnapShot.ref, { status: code })
                })
            }
            await batch.commit()
            dispatch({
                type: SUCCESS,
                payload: {
                    opts: UPDATE_STATUS,
                    ok: {
                        message: 'The status updated successfully',
                    },
                },
            })
        } catch (e) {
            dispatch({
                type: ERROR,
                payload: {
                    opts: UPDATE_STATUS,
                    err: 'ERR_UPDATE_STATUS',
                },
            })
        } finally {
            dispatch(finishAsyncAction())
        }
    }

export const deleteEvent = (eventId) => {
    return {
        type: DELETE_EVENT,
        payload: {
            eventId
        }
    }
}

export const loadEvents = () => {
    return async dispatch => {
        try {
            dispatch(startAsyncAction())
            let events = await fetchSampleData()
            dispatch(fetchEvents(events))
            dispatch(finishAsyncAction())
        } catch(error) {
            console.log(error)
            dispatch(asyncActionError())
        }
    }
}