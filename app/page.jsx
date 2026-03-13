"use client"
import { Map, MapControls, MapMarker, MarkerContent, MarkerPopup, MarkerTooltip } from "@/components/ui/map";
import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [defCoords, setDefCoords] = useState(null); 
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