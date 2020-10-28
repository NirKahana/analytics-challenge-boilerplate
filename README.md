# Analytics Challenge

## Introduction

You will build analytics system that would present usage analytics about a website by collecting events sent to the platform.

## Getting Started

clone the repo this repo and build your project on top of it.  

- setup server  
    1. `cd server`  
    3. `npm i` 
    3. `npm start` in `/server`. (yes, in server)
- setup client  
    1. `cd client`  
    3. `npm i` 
    3. `npm start` in `/client`. this can take a while
- after installing all dependencies, you can also use `npm run dev` in `/client` to run both concurrently.
  
## Home Page Requirements:

 - Make the following layout for tiles and make it compatible with different tile sizes and different screen sizes.

![](https://i.imgur.com/gtPzvXP.jpg)
 - While loading data show loading indicator you built using canvas tag

### Tiles to present:
 - Showing events on Google Map (show number of events from area. (you can use whichever library you choose, but [this one](https://www.npmjs.com/package/@react-google-maps/api) is recommended) 
![](https://i.imgur.com/AOACrVj.png)
 - showing time per url per user
![](https://i.imgur.com/FSQEHo7.png)
 - showing time spent on each page by all users.
![](https://i.imgur.com/RFx8GFw.png)
 - showing graph with unique sessions by day with option to change date
![](https://i.imgur.com/EPPmDjq.png)
 - showing graph with unique sessions by hour with option to change date
![](https://i.imgur.com/6gJ7e1k.png)
 - showing retention cohort week by week
![How Startups Can Do Better Cohort Analyses – Philosophical Hacker](https://www.philosophicalhacker.com/images/cohort-analysis.png)
 - Showing log of all events - search option and filter by event name using regex.
![](https://i.imgur.com/hFlqDbG.png)
 - showing page views for on each page.
 - Showing pie charts with users by operating system usage.

## Backend Requirements:

 - POST "/event" - adding new event to event collection.  
 this should be fired o every:
    - signup
    - login
    - page view
    - login
 - Any other entry point needed.
 - Use lowdb and create collection for the '[event](client/src/models/event.ts)' entity.
	Sample of events documents (you can add any other properties you wish):
```
{
  "_id": "VATb6bdcOEW", 
  "session_id": "d788bae3-6909-49a2-a54a-6d50d35b3c70",  
  "name": "signup",  
  "distinct_user_id": "O-5mFsaxp9",  
  "date": 1603316369846,  
  "os": "ios",  
  "browser": "chrome",  
  "geolocation": {  
    "location": {
      "lat": 81,
      "lng": 86
    },  
    "accuracy": 1708
  },  
  "url": "http://localhost3000/signup"
}  

```
## General Requirement

 - All system will be coded using Typescript.
 - Add Error Boundaries around each tile (chart).
 - Use Styled Components for styling.
 - Make it responsive for any screen size.


## Bonuses
  - Make your own custom tiles.
  - Make the tiles resizable.
  - Make the tiles move by drag and drop.
  - Add any feature you wish
  - Add tests for your features
  
## Running Tests
// To be added

