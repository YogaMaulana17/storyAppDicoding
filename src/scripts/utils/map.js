import CONFIG from "../config";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

const MAPTILER_API_KEY = CONFIG.MAP_SERVICE_API_KEY;

L.Marker.prototype.options.icon = L.icon({
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export async function getLocationName(lat, lon) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    );
    const data = await response.json();
    return (
      data.address.city ||
      data.address.town ||
      data.address.village ||
      data.address.county ||
      "Lokasi tidak diketahui"
    );
  } catch (error) {
    console.error("Gagal mengambil nama lokasi:", error);
    return "Lokasi tidak diketahui";
  }
}

// Inisialisasi peta
export function initMap({
  id = "map",
  lat = -6.2,
  lng = 106.8,
  zoom = 13,
  popupText = "Jakarta",
}) {
  const existingMap = L.DomUtil.get(id);
  if (existingMap !== null && existingMap._leaflet_id) {
    existingMap._leaflet_id = null;
  }

  // const map = L.map(id).setView([lat, lng], zoom);
  const map = L.map(id, {
    dragging: true,
    tap: false,
    zoomControl: true,
    scrollWheelZoom: true,
  }).setView([lat, lng], zoom);

  const streets = L.tileLayer(
    `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`,
    {
      attribution:
        '&copy; <a href="https://www.maptiler.com">MapTiler</a> & contributors',
    }
  );

  const satelit = L.tileLayer(
    `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${MAPTILER_API_KEY}`,
    {
      attribution:
        '&copy; <a href="https://www.maptiler.com">MapTiler</a> & contributors',
    }
  );

  streets.addTo(map);

  const baseLayer = {
    Streets: streets,
    Satelit: satelit,
  };

  L.control.layers(baseLayer).addTo(map);

  // L.marker([lat, lng]).addTo(map).bindPopup(popupText).openPopup();
  //diganti ini
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(popupText, {
      offset: [0, -40], // Ubah sesuai arah yang kamu mau
      autoPan: true,
      closeButton: true,
    })
    .openPopup();

  return map;
}

// Ambil lokasi dan tampilkan di peta
export function getUserLocation(map) {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          // Pindahkan peta ke lokasi User
          map.setView([latitude, longitude], 13);

          // Tambahkan marker di lokasi User
          L.marker([latitude, longitude])
            .addTo(map)
            //yng di ubah
            .bindTooltip("Lokasi Realtime Anda", {
              permanent: true,
              direction: "top",
              offset: [0, -40],
            })
            .openPopup();

          // Kirim data latitude & longitude balik ke pemanggil
          resolve({ latitude, longitude });
        },
        (error) => {
          console.error("Geolocation error:", error);
          reject(error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      reject(new Error("Geolocation not supported"));
    }
  });
}
