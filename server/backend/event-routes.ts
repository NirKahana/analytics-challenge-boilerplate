///<reference path="types.ts" />

import express from "express";
import { Request, Response } from "express";
import moment from 'moment';




// some useful database functions in here:
import {
  getAllEvents
} from "./database";
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
import { date } from "faker";
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
  res.send(getAllEvents())
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
  let offset = req.params.offset || 0; /// 7 days, zero based
  let allEvents = getAllEvents(); // An array of all the events
  const eventsGroupedBySessionID = groupBy(allEvents, 'session_id'); // All unique session with their events;
  interface sessionWithDate {
    sessionID: string,
    date: number | string
  }
  let sessionsArrayWithDates: sessionWithDate[] = [];
  for (const session in eventsGroupedBySessionID) {
    const sessionID = session; // the id of this session
    const sessionDate = eventsGroupedBySessionID[session][0].date; // inside the array of events in this session, the date of the first event 
    sessionsArrayWithDates.push({
      sessionID: sessionID,
      date: moment(sessionDate).format("MM/DD/YYYY")
    })
  }
  const uniqueSessionsGroupedByDate = groupBy(sessionsArrayWithDates, "date");
  let datesArray = [];
  for (const sessionsDate in uniqueSessionsGroupedByDate) {
    const date = sessionsDate;
    const count = uniqueSessionsGroupedByDate[sessionsDate].length;
    datesArray.push({
      date,
      count      
    })
  }
  datesArray.sort((firstDate, secondDate):number => (Date.parse(firstDate.date) - Date.parse(secondDate.date)));
  let endDate = moment().subtract(offset, 'days').format('MM/DD/YYYY');
  let startDate = moment(endDate).subtract(7, 'days').format('MM/DD/YYYY');
  datesArray = datesArray.filter(date => (Date.parse(date.date) > Date.parse(startDate)) && (Date.parse(date.date) <= Date.parse(endDate)))
  res.send(datesArray)
});


router.get('/by-hours/:offset', (req: Request, res: Response) => {
  let offset = req.params.offset || 0; /// 7 days, zero based
  let allEvents = getAllEvents(); // An array of all the events
  const eventsGroupedBySessionID = groupBy(allEvents, 'session_id'); // All unique session with their events;
  interface sessionWithDate {
    sessionID: string,
    date: number | string
  }
  let sessionsArrayWithDates: sessionWithDate[] = [];
  for (const session in eventsGroupedBySessionID) {
    const sessionID = session; // the id of this session
    const sessionDate = eventsGroupedBySessionID[session][0].date; // inside the array of events in this session, the date of the first event 
    sessionsArrayWithDates.push({
      sessionID: sessionID,
      date: moment(sessionDate).startOf('hour').format("MM/DD/YYYY HH:mm:ss")
    })
  }
  const uniqueSessionsGroupedByDate = groupBy(sessionsArrayWithDates, "date");
  let datesArray = [];
  for (const sessionsDate in uniqueSessionsGroupedByDate) {
    const date = sessionsDate;
    const count = uniqueSessionsGroupedByDate[sessionsDate].length;
    datesArray.push({
      date,
      count      
    })
  }
  datesArray.sort((firstDate, secondDate):number => (Date.parse(firstDate.date) - Date.parse(secondDate.date)));
  let endDate = (offset === "0") ? moment().startOf('hour').format('MM/DD/YYYY HH:mm:ss') :
                moment().subtract(offset, 'days').startOf('day').add(23, 'hours').format('MM/DD/YYYY HH:mm:ss');
  let startDate = (offset === "0") ? moment().startOf('day').format('MM/DD/YYYY HH:mm:ss') :
                  moment(endDate).startOf('day').format('MM/DD/YYYY HH:mm:ss');
  datesArray = datesArray.filter(date => (Date.parse(date.date) >= Date.parse(startDate)) && (Date.parse(date.date) <= Date.parse(endDate)) )
  datesArray = datesArray.map((date) => ({
    hour: moment(date.date).format("HH:mm"),
    count: date.count
  }))
  res.send(datesArray)
});

router.get('/today', (req: Request, res: Response) => {
  const today = moment();
  const str = today.format("MM/DD/YYYY HH:mm:ss");
  res.send(str)
});

router.get('/week', (req: Request, res: Response) => {
  res.send('/week')
});

router.get('/retention', (req: Request, res: Response) => {
  const {dayZero} = req.query
  res.send('/retention')
});
router.get('/:eventId',(req : Request, res : Response) => {
  res.send('/:eventId')
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
