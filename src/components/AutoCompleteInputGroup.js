import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import map from '../map.png'

function AutoCompleteInputGroup(props) {
  return (
  <InputGroup style={{ marginTop: "25px", marginBottom: "25px", height: "65px" }}>
    {props.children}
    <InputGroup.Append style={{ width: "75px" }}>
      <Button variant="outline-secondary" onClick={props.onMapClicked}><img src={map} style={{ height: "50px"}} id="image" alt="Map"/></Button>
    </InputGroup.Append>
  </InputGroup>
  )
}

export default AutoCompleteInputGroup;