import React, { useEffect, useState } from "react";
import axios from 'axios'
import { GoogleMap, LoadScript, Marker, MarkerClusterer  } from "@react-google-maps/api";

import {Event, Location} from "../models/event"


const api_key = process.env.REACT_APP_API_KEY ||""; 
console.log('env vars are: ', process.env);
console.log('api key is: ', api_key);

const defaultCenter = {
    lat: 31.4,
    lng: 34.7,
};
const mapStyles = {
  height: "60vh",
  width: "100%",
  display: "inline-block",
};
const options = {
    imagePath:
      'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m', // so you must have m1.png, m2.png, m3.png, m4.png, m5.png and m6.png in that folder
}
const createKey = (location: Location) => location.lat + location.lng;

export default function Map() {
    const [eventsLocations, setEventsLocations] = useState<Location[]>(); 

    useEffect(() => {
        const fetchEvents = async () => {
        const allEvents: Event[] = (await axios.get("/all")).data;
            const eventsLocations = allEvents.map(event => ({
                lat: event.geolocation.location.lat,
                lng: event.geolocation.location.lng
            }))
            setEventsLocations(eventsLocations);
        }
        fetchEvents()
    },[])

    return eventsLocations ? (
        <LoadScript googleMapsApiKey={api_key}>
          <GoogleMap
        options={{
          scrollwheel: true,
          zoomControl: false,
          draggable: true,
          mapTypeId: "roadmap",
          // styles: MapTypeStyle,
          fullscreenControl: false,
          mapTypeControl: true,
          streetViewControl: false,
          // draggableCursor: 'default'
        }}
        mapContainerStyle={mapStyles}
        zoom={1.7}
        center={defaultCenter}
      //   onClick={onClicked}
      >
      <MarkerClusterer options={options}>
          {(clusterer) =>
            eventsLocations.map((location) => (
              <Marker key={createKey(location)} position={location} clusterer={clusterer} />
            ))
          }
        </MarkerClusterer>

      </GoogleMap>  
        </LoadScript>
    ) 
    : 
    <div>Loading...</div>
}