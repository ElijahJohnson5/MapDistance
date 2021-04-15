import { useState} from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import MapPicker from "react-google-map-picker";

const google = window.google;
const geocoder = new google.maps.Geocoder();

function LocationPickerModal(props) {
  const [zoom, setZoom] = useState(1);
  const [location, setLocation] = useState(null);
  
  return (
    <Modal
      {...props}
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Pick a location
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <MapPicker
          zoom={zoom}
          onChangeLocation={(lat, lng) => { 
            geocoder.geocode({location: { lat, lng }}, (results, status) => {
              if (status === "OK")
              {
                setLocation(results[0]);
              }
            })
          }}
          onChangeZoom={setZoom}
          apiKey="AIzaSyCchPPcVWq3IYfjmdtpK3om-ZTQqPwABjI"
        />
        
        <div style={{ textAlign: "center" }}>{location !== null ? location.formatted_address : ""}</div>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          onClick={() => {
            setZoom(1);
            props.onPlaceSelected(location);
          }}
        >
          Select Location
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default LocationPickerModal;