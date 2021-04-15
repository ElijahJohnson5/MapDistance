import './App.css';

import { useEffect, useState } from 'react';

import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table'
import GooglePlacesAutoComplete from 'react-google-places-autocomplete';
import { DirectionsRenderer, GoogleMap } from '@react-google-maps/api';

import LocationPickerModal from './components/LocationPickerModal.js'
import AutoCompleteInputGroup from './components/AutoCompleteInputGroup';
import Firebase from 'firebase';

const google = window.google;

function App() {
  const [startingLocation, setStartingLocation] = useState(null);
  const [endingLocation, setEndingLocation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [starting, setStarting] = useState(null);
  const [directions, setDirections] = useState(null);
  const [oldDirections, setOldDirections] = useState([]);

  useEffect(() => {
    Firebase.database().ref(`/directions/`).on('value', (snapshot) => {
      let val = snapshot.val();

      if (typeof(val) !== 'object')
      { 
        setOldDirections(o => o.push(val).sort((a, b) => (new Date(b.dateSearched) - new Date(a.dateSearched))));     
      }
      else if (typeof(val) === 'object' && val !== null)
      {
        setOldDirections(Object.values(val).sort((a, b) => (new Date(b.dateSearched) - new Date(a.dateSearched))));
      }
    });
  }, []);

  let goButton = <div></div>;

  if (startingLocation !== null && endingLocation !== null) {
    goButton = (
      <Button onClick={() => {
        const directionsService = new google.maps.DirectionsService();
        directionsService.route({ 
          origin: startingLocation.label, 
          destination: endingLocation.label, 
          travelMode: google.maps.TravelMode.DRIVING, 
        }, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirections(result);
            Firebase.database().ref(`/directions/`).push({ 
                startingLocation: startingLocation.label, 
                endingLocation: endingLocation.label,
                distance: result.routes[0].legs[0].distance.text,
                time: result.routes[0].legs[0].duration.text,
                dateSearched: new Date().toISOString(),
            });
          } else {
            alert('Could not find directions! Try another address');
            if (starting)
            {
              setStartingLocation(null);
            }
            else 
            {
              setEndingLocation(null);
            }
          }
        });
      }}>
        Find Directions
      </Button>
    );
  }

  let directionsMap = <div></div>;
  if (directions !== null) {
    directionsMap = (
      <GoogleMap 
        // required
        id='google-map'
        // required
        mapContainerStyle={{
          marginTop: '15px',
          marginBottom: "15px",
          height: '600px',
          width: '100%'
        }}
        // required
        zoom={2}
        // required
        center={{
          lat: 0,
          lng: -180
        }}
      >
        <DirectionsRenderer
          directions={directions}
        />
      </GoogleMap>
    );
  }


  return (
    <Container style={{ width: "80%" }}>
      <h1 style={{ textAlign: "center" }}>Distance Between Locations</h1>
      <AutoCompleteInputGroup
        onMapClicked={() => { setShowModal(true); setStarting(true); }}
      >
        <GooglePlacesAutoComplete
          selectProps={{
            value: startingLocation,
            onChange: (newVal) => {
              //Reset route to null
              setDirections(null);
              setStartingLocation(newVal);
            },
            className: "form-control",
            placeholder: "Pick Starting Location...",
            styles: {
              input: (provided) => ({
                ...provided,
              }),
              control: () => ({
                height: 65,
              }),
              container: () => ({
                height: 65,
              }),
              menu: (provided) => ({
                ...provided,
                zIndex: 9999,
              }),
              dropdownIndicator: () => ({
                display: 'none'
              }),
            },
          }}
        />
      </AutoCompleteInputGroup>
      <AutoCompleteInputGroup
        onMapClicked={() => { setShowModal(true); setStarting(false); }}
      >
        <GooglePlacesAutoComplete
            selectProps={{
              value: endingLocation,
              onChange: (newVal) => {
                setDirections(null);
                setEndingLocation(newVal);
              },
              className: "form-control",
              placeholder: "Pick Ending Location...",
              styles: {
                input: (provided) => ({
                  ...provided,
                }),
                control: () => ({
                  height: 65,
                }),
                container: () => ({
                  height: 65,
                }),
                menu: (provided) => ({
                  ...provided,
                  zIndex: 9999,
                }),
                dropdownIndicator: () => ({
                  display: 'none'
                }),
              },
            }}
        />
      </AutoCompleteInputGroup>
      <LocationPickerModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onPlaceSelected={place => { 
          setDirections(null); 
          setShowModal(false);
          if (starting) {
            setStartingLocation({ value: place, label: place.formatted_address });
          } else {
            setEndingLocation({ value: place, label: place.formatted_address });
          }
        }}
      >
      </LocationPickerModal>
      {goButton}
      {directionsMap}
      {oldDirections.length > 0 ? 
        <Table variant='flush' style={{ marginTop: '15px' }}>
          <thead>
            <tr>
              <th>Starting Location</th>
              <th>Ending Location</th>
              <th>Distance</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {oldDirections.map(d => (
              <tr>
                <td>{d.startingLocation}</td>
                <td>{d.endingLocation}</td>
                <td>{d.distance}</td>
                <td>{d.time}</td>
              </tr>
              )
            )}
          </tbody>
        </Table> 
          : 
        <div></div>
      }

    </Container>
  );
}

export default App;
