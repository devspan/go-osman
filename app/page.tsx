"use client";
import React, { useState, useEffect } from 'react';
import { MapPin, Menu, Search, Navigation, Plus, Minus } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { MapContainer, TileLayer, Marker, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
L.Icon.Default.imagePath = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/';

interface Coords {
  lat: number;
  lng: number;
}

function SetViewOnClick({ coords }: { coords: Coords }) {
  const map = useMap();
  map.setView(coords, map.getZoom());
  return null;
}

function ZoomButtons() {
  const map = useMap();

  return (
    <div className="absolute bottom-24 left-4 z-[400] flex flex-col gap-2">
      <Button 
        variant="secondary"
        size="icon"
        onClick={() => map.zoomIn()}
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Button 
        variant="secondary"
        size="icon"
        onClick={() => map.zoomOut()}
      >
        <Minus className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function MainPage() {
  const [center, setCenter] = useState<Coords>({ lat: 51.505, lng: -0.09 });
  const [userLocation, setUserLocation] = useState<Coords | null>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCenter({ lat: latitude, lng: longitude });
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.log('Geolocation is not available');
    }
  }, []);

  const handleRecenter = () => {
    if (userLocation) {
      setCenter(userLocation);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Card className="rounded-none border-b z-[500]">
        <CardContent className="flex justify-between items-center p-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] z-[1001]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>
                  Access additional features and settings here.
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <h3 className="mb-2 text-lg font-semibold">Menu Items</h3>
                <ul className="space-y-2">
                  <li>
                    <Button variant="ghost" className="w-full justify-start">Profile</Button>
                  </li>
                  <li>
                    <Button variant="ghost" className="w-full justify-start">Ride History</Button>
                  </li>
                  <li>
                    <Button variant="ghost" className="w-full justify-start">Settings</Button>
                  </li>
                  <li>
                    <Button variant="ghost" className="w-full justify-start">Help</Button>
                  </li>
                </ul>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-xl font-bold">TaxiNow</h1>
          <Button variant="ghost" size="icon" onClick={handleRecenter}>
            <MapPin className="h-6 w-6" />
          </Button>
        </CardContent>
      </Card>
      <main className="flex-1 relative">
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {userLocation && <Marker position={[userLocation.lat, userLocation.lng]} />}
          <SetViewOnClick coords={center} />
          <ZoomButtons />
        </MapContainer>
        <Card className="absolute top-4 left-4 right-4 z-[500] mx-auto max-w-md">
          <CardContent className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                type="text" 
                placeholder="Where to?" 
                className="w-full pl-10"
              />
            </div>
          </CardContent>
        </Card>
        <Button 
          variant="secondary"
          size="icon"
          className="absolute bottom-24 right-4 rounded-full shadow-lg z-[500]"
          onClick={handleRecenter}
        >
          <Navigation className="h-6 w-6" />
        </Button>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent z-[500]">
          <Button className="w-full py-6 text-lg font-semibold" size="lg">
            Book a Ride
          </Button>
        </div>
      </main>
    </div>
  )
}