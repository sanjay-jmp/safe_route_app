import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Form, Button, Container, Row, Col } from "react-bootstrap";

const center = [34.0522, -118.2437]; // Default center (Los Angeles)

const SafeRouteMap = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [sourceCoords, setSourceCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [route, setRoute] = useState([]);

  // Function to fetch coordinates from OpenStreetMap
  const fetchCoordinates = async (address, type) => {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: { q: address, format: "json" },
    });
    if (response.data.length > 0) {
      const { lat, lon } = response.data[0];
      const coords = [parseFloat(lat), parseFloat(lon)];
      type === "source" ? setSourceCoords(coords) : setDestCoords(coords);
    }
  };

  // Function to fetch the safest route from Flask API
  const fetchSafeRoute = async () => {
    if (!sourceCoords || !destCoords) return;
    const response = await axios.get("http://127.0.0.1:5000/find_safe_route", {
      params: {
        source: `${sourceCoords[0]},${sourceCoords[1]}`,
        destination: `${destCoords[0]},${destCoords[1]}`,
        time: "19:45:00",
      },
    });
    setRoute(response.data.route);
  };

  return (
    <Container fluid>
      <Row className="py-3 bg-dark text-white">
        <Col md={5}>
          <Form.Control
            type="text"
            placeholder="Enter Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            onBlur={() => fetchCoordinates(source, "source")}
          />
        </Col>
        <Col md={5}>
          <Form.Control
            type="text"
            placeholder="Enter Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onBlur={() => fetchCoordinates(destination, "destination")}
          />
        </Col>
        <Col md={2}>
          <Button variant="primary" onClick={fetchSafeRoute} disabled={!sourceCoords || !destCoords}>
            Find Safe Route
          </Button>
        </Col>
      </Row>

      <MapContainer center={center} zoom={12} style={{ height: "90vh", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {sourceCoords && <Marker position={sourceCoords} />}
        {destCoords && <Marker position={destCoords} />}
        {route.length > 0 && <Polyline positions={route} color="blue" />}
      </MapContainer>
    </Container>
  );
};

export default SafeRouteMap;
