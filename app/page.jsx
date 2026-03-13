"use client"
import { Map, MapControls, MapMarker, MarkerContent, MarkerPopup, MarkerTooltip, useMap } from "@/components/ui/map";
import { useEffect, useState, useRef } from "react";

const DUPLICATE_THRESHOLD = 0.0001; // ~10 metres

function isDuplicate(pins, newPin) {
  return pins.some(
    (pin) =>
      Math.abs(pin.lng - newPin.lng) < DUPLICATE_THRESHOLD &&
      Math.abs(pin.lat - newPin.lat) < DUPLICATE_THRESHOLD
  );
}

function PinDropHandler({ onDrop }) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;
    const handleClick = (e) => {
      const { lng, lat } = e.lngLat;
      onDrop({ lng, lat });
    };
    map.on("click", handleClick);
    return () => map.off("click", handleClick);
  }, [map, isLoaded]);

  return null;
}

export default function Home() {
  const [defCoords, setDefCoords] = useState(null);
  const [pins, setPins] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const crd = pos.coords;
        console.log("Your current position is:");
        console.log(`Latitude : ${crd.latitude}`);
        console.log(`Longitude: ${crd.longitude}`);
        console.log(`More or less ${crd.accuracy} meters.`);
        setDefCoords([crd.longitude, crd.latitude]);
      },
      (err) => {
        console.error(`ERROR(${err.code}): ${err.message}`);
      }
    );
  }, []);

  const handleDrop = (coords) => {
    if (isDuplicate(pins, coords)) return; 
    setPins((prev) => [...prev, { ...coords, id: Date.now() }]);
  };

  const deletePin = (id) => {
    setPins((prev) => prev.filter((pin) => pin.id !== id));
  };

  if (!defCoords) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Getting your location...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <Map ref={mapRef} viewport={{ center: defCoords, zoom: 12 }}>
        <PinDropHandler onDrop={handleDrop} />

        <MapMarker longitude={defCoords[0]} latitude={defCoords[1]}>
          <MarkerContent>
            <div className="size-4 rounded-full bg-primary border-2 border-blue-500 shadow-lg" />
          </MarkerContent>
          <MarkerTooltip>Home</MarkerTooltip>
          <MarkerPopup>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Home</p>
              <p className="text-xs text-muted-foreground">
                {defCoords[0].toFixed(4)}, {defCoords[1].toFixed(4)}
              </p>
            </div>
          </MarkerPopup>
        </MapMarker>

        {pins.map((pin, index) => (
          <MapMarker key={pin.id} longitude={pin.lng} latitude={pin.lat}>
            <MarkerContent>
              <div
                className="size-4 rounded-full bg-red-500 border-2 border-white shadow-lg cursor-pointer"
                onClick={(e) => e.stopPropagation()}        
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation(); 
                  deletePin(pin.id);
                }}
              />
            </MarkerContent>
            <MarkerTooltip>Pin {index + 1} · Right-click to delete</MarkerTooltip>
            <MarkerPopup>
              <div className="space-y-1">
                <p className="font-medium text-foreground">Pin {index + 1}</p>
                <p className="text-xs text-muted-foreground">
                  {pin.lng.toFixed(4)}, {pin.lat.toFixed(4)}
                </p>
              </div>
            </MarkerPopup>
          </MapMarker>
        ))}

        <MapControls
          position="bottom-right"
          showZoom
          showCompass
          showLocate
          showFullscreen
        />
      </Map>
    </div>
  );
}