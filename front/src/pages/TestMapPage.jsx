import { useState } from 'react';
import MaritimeMap from '../components/Map/MaritimeMap';
import '../styles/map.css';

const TestMapPage = () => {
  const [routeInfo, setRouteInfo] = useState(null);
  const [logs, setLogs] = useState([]);
  const [testRunning, setTestRunning] = useState(false);

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runAutomatedTest = () => {
    setTestRunning(true);
    setLogs([]);
    addLog("Starting automated test sequence...");
    
    // Sample test coordinates (London to Paris)
    const testCoords = [
      { lat: 51.5074, lng: -0.1278 }, // London
      { lat: 48.8566, lng: 2.3522 }   // Paris
    ];

    addLog(`Will test with coordinates: ${JSON.stringify(testCoords)}`);
  };

  return (
    <div className="test-container">
      <h1>Maritime Map Test Suite</h1>
      
      <div className="test-controls">
        <button 
          onClick={runAutomatedTest} 
          disabled={testRunning}
        >
          {testRunning ? 'Test Running...' : 'Run Automated Test'}
        </button>
        <button onClick={() => setLogs([])}>Clear Logs</button>
      </div>

      <div className="test-area">
        <div className="map-wrapper">
          <MaritimeMap 
            onRouteCalculate={(data) => {
              setRouteInfo(data);
              addLog(`Route calculated: ${data.distance.toFixed(2)} NM`);
            }}
            onMapLoad={() => addLog("Map loaded successfully")}
            onLocationFound={(msg) => 
              addLog(msg || "User location detected")
            }
            testMode={testRunning}
            testCoordinates={testRunning ? [
              { lat: 51.5074, lng: -0.1278 },
              { lat: 48.8566, lng: 2.3522 }
            ] : []}
          />
        </div>

        <div className="test-results">
          <h3>Test Results</h3>
          {routeInfo && (
            <div className="route-info">
              <h4>Current Route</h4>
              <p><strong>Distance:</strong> {routeInfo.distance.toFixed(2)} NM</p>
              <p><strong>From:</strong> 
                {routeInfo.start.lat.toFixed(4)}, 
                {routeInfo.start.lng.toFixed(4)}
              </p>
              <p><strong>To:</strong> 
                {routeInfo.end.lat.toFixed(4)}, 
                {routeInfo.end.lng.toFixed(4)}
              </p>
            </div>
          )}

          <div className="log-container">
            <h4>Event Log</h4>
            {logs.length === 0 ? (
              <p>No events logged yet</p>
            ) : (
              <div className="log-entries">
                {logs.map((log, index) => (
                  <div key={index} className="log-entry">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestMapPage;