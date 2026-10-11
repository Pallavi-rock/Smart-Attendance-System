export interface Coordinates {
  latitude: number;
  longitude: number;
}

export function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location services are not available in this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      () => reject(new Error("Location permission is required to mark attendance.")),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });
}