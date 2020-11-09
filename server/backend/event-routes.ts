///<reference path="types.ts" />

import express from "express";
import { Request, Response } from "express";
import moment from 'moment';
// import { group } from "lodash/fp";




// some useful database functions in here:
import {
  getAllEvents,
  getDatesWithUniqueSessions
} from "./database";
import mockData from "../backend/__tests__/mock_data";
import { Event, weeklyRetentionObject } from "../../client/src/models/event";
import { ensureAuthenticated, validateMiddleware } from "./helpers";


import {
  shortIdValidation,
  searchValidation,
  userFieldsValidator,
  isUserValidator,
} from "./validators";
import { all, any } from "bluebird";
import { count, log } from "console";
import { date, internet } from "faker";
import { session } from "passport";
import { subtract, uniq } from "lodash";
const router = express.Router();
// other helper functions 
const groupBy = (array: Array<any>, key: any ) => {
  // Return the end result
  return array.reduce((result, currentValue) => {
    // If an array already present for key, push it to the array. Else create an array and push the object
    (result[currentValue[key]] = result[currentValue[key]] || []).push(
      currentValue
    );
    // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
    return result;
  }, {}); // empty object is the initial value for result object
};
// Routes
interface Filter {
  sorting: string;
  type: string;
  browser: string;
  search: string;
  offset: number;
}

router.get('/all', (req: Request, res: Response) => {
  const allEvents = getAllEvents()
  console.log(allEvents.length);
  res.send(allEvents)
});

router.get('/all-filtered', (req: Request, res: Response) => {
  let filter: Filter = req.query;
  let filteredArray: Event[] = getAllEvents();
  
  if(filter.browser)
  {
    filteredArray = filteredArray.filter(event => event.browser === filter.browser)
  }
  if(filter.type)
  {
    filteredArray = filteredArray.filter(event => event.name === filter.type)
  }
  if(filter.search)
  {
    filteredArray = filteredArray.filter(event => Object.values(event).some((value: string) => value.toString().includes(filter.search)))
  }
  if (filter.sorting) {
    filteredArray.sort((firstEvent: Event, secondEvent: Event) =>
      filter.sorting === "+date"
        ? firstEvent.date - secondEvent.date
        : secondEvent.date - firstEvent.date
    );
  }
  const more = () => {
    if (!filter.offset) {
      return false;
    }
    if (filter.offset < filteredArray.length) {
      return true;
    }
    return false;
  };
  res.json({
    events: filteredArray.slice(0, filter.offset || filteredArray.length),
    more: more(),
  });
});

router.get('/by-days/:offset', (req: Request, res: Response) => {
  let offset = Number(req.params.offset);
  const datesWithUniqueSessionsCount = getDatesWithUniqueSessions(); // all days which had events, with the unique sessions array
  const datesWithCount = datesWithUniqueSessionsCount.map(date => ({date: date.date, count: date.sessions.length}))

  const endIndex = datesWithCount.length-offset;
  const startIndex = endIndex-7;
  // res.json(datesWithCount.slice(startIndex, endIndex))
  res.send(datesWithUniqueSessionsCount)
});

router.get('/by-hours/:offset', (req: Request, res: Response) => {
  let offset = Number(req.params.offset) || 0;
  const datesWithUniqueSessionsCount = getDatesWithUniqueSessions(); // all days which had events, with the unique sessions array
  const day = moment().subtract(offset, "days").format("L");
  const daySessions = datesWithUniqueSessionsCount.filter(date => date.date === day)[0].sessions;
  interface hour {
    hour: string,
    sessions: string[]
  }
  const hoursArray: hour[] = [];
  daySessions.forEach(session => {
    if (!hoursArray.some(hour => hour.hour === session.hour)) {
      hoursArray.push({hour: session.hour, sessions: [session.session]})
    } else {
      const hourIndex: number = hoursArray.findIndex(hour => hour.hour === session.hour);
      hoursArray[hourIndex].sessions.push(session.session);
    }
  })
  const dayHours: {hour: string, count: number}[] = [];
  for (let i = 0; i < 24; i++) {
    const hourInHoursArray = hoursArray.find(hour => hour.hour === i.toString())
    const count = (hourInHoursArray) ? hourInHoursArray.sessions.length : 0
    dayHours[i] = {
      hour: i.toString()+":00",
      count: count
    }
  }
  res.send(dayHours)
});

router.get('/today', (req: Request, res: Response) => {
  let allEvents = getAllEvents(); // An array of all the events
  const today = moment().format("L");
  let todayEvents = allEvents.filter(event => moment(event.date).format("L") === today);
  const todayStringEvents = todayEvents.map(event => ({
    ...event,
    date: moment(event.date).format("L")
  }))
  res.send(todayStringEvents)
});

router.get('/week', (req: Request, res: Response) => {
  let allEvents = getAllEvents(); // An array of all the events
  const today = moment().format("L");
  let todayEvents = allEvents.filter(event => moment(event.date).format("L") === today);
  const todayStringEvents = todayEvents.map(event => ({
    ...event,
    date: moment(event.date).format("L")
  }));
  res.send(todayStringEvents)
  res.send('/week')
});

router.get('/retention', (req: Request, res: Response) => {
  interface weeklyRetentionObject {
    registrationWeek:number;  //launch is week 0 and so on
    newUsers:number;  // how many new user have joined this week
    weeklyRetention:number[]; // for every week since, what percentage of the users came back. weeklyRetention[0] is always 100% because it's the week of registration  
    start:string;  //date string for the first day of the week
    end:string  //date string for the first day of the week
  }
  let week0Retention : weeklyRetentionObject = {
    registrationWeek: 1, // distance in weeks from dayzero + 1 
    newUsers: 34, // number of signup Events within that week
    weeklyRetention:[100,24,45],   
    start:'19/10/2020', // dayZero + distance in weeks * week
    end: '26/10/2020' // dayZero + (distance in weeks+1) * week || start + week
  } 
  let week1Retention : weeklyRetentionObject = {
    registrationWeek: 2, // distance in weeks from dayzero + 1
    newUsers: 51, 
    weeklyRetention:[100,23],  
    start:'26/10/2020',
    end: '02/11/2020'
  } 
  let week2Retention : weeklyRetentionObject = {
    registrationWeek: 3, // distance in weeks from dayzero + 1
    newUsers: 34, 
    weeklyRetention:[100],  
    start:'02/11/2020',
    end: '09/11/2020'
  } 
  /**
   * 1.  Parse the dayZero and convert it to formated date of type DD/MM/YYYY
   * 2.  Filter all events in order to find only sign-up events which occured on launch-week and save it to
   *     a const called "newUsersArray"
   * 3.  Save "newUsersArray" length as the newUsers value.
   * 4.  group allEvents by week, starting from launch-week ****
   * 5.  create an Array of weeks, called "eventsByWeeks" based on the grouped-allEvents, in which each item is an object, 
   *     with a week-number as its key (1,2,3...) and an array of events as its value 
   * 6.  create an empty array called "weeklyRetention" which takes numebrs
   * 7.  start iterating through eventsByWeeks, and for each week:
   * 8.  find the number of events which were triggered by users from "newUserArray"
   *     and save it to a const called "returnedUsers"   
   * 9.  push "returnedUsers".length to the 'weeklyRetention' Array
   * 10. map weekly retention and for each number, divide the number by "newUsers" and multiply it by 100.
   *  **/
  let dayZero: any = Number(req.query.dayZero);
  dayZero = moment(dayZero).startOf('day');
  const today = moment().endOf('day');
  // how far day zero from today in weeks
  const numberOfWeeks = today.diff(dayZero, "weeks");
  const globalUsersArray : Array<Array<string>> = [['AsA','asdasd','asdasd'],[],[]] // array that will hold all newusers id for each week  
  /**
   * for each week
   * 
   * get all the signup, take only the users id and push it to the global array
   * get all signup length and put as newusers for that week
   * 
   * get all logins of that week - remove duplictae by userId
   * thtaweekretensions = []
   * loop:
   * for each login determine which week he register and push to the counter for that week 
   * Event(login) => Event.userId
   * search in globalUsersArray which week that user belongs to
   * 
   * */ 
  







  res.send('/retention')
});




router.get('/:eventId',(req : Request, res : Response) => {
  const id = req.params.eventId;
  let allEvents = getAllEvents(); // An array of all the events
  const requiredEvent = allEvents.find(event => event._id === id);
  res.send(requiredEvent)
});

router.post('/', (req: Request, res: Response) => {
  res.send('/')
});

router.get('/chart/os/:time',(req: Request, res: Response) => {
  res.send('/chart/os/:time')
})

  
router.get('/chart/pageview/:time',(req: Request, res: Response) => {
  res.send('/chart/pageview/:time')
})

router.get('/chart/timeonurl/:time',(req: Request, res: Response) => {
  res.send('/chart/timeonurl/:time')
})

router.get('/chart/geolocation/:time',(req: Request, res: Response) => {
  res.send('/chart/geolocation/:time')
})


export default router;
