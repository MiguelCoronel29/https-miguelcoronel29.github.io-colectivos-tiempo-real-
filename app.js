// Configuración Firebase (NO CAMBIAR)
const firebaseConfig = {
    apiKey: "AIzaSyBLQTF45rPS0zUUNchDJ5DagygX8nojMxE",
    authDomain: "colectivos-tiempo-real.firebaseapp.com",
    databaseURL: "https://colectivos-tiempo-real-default-rtdb.firebaseio.com",
    projectId: "colectivos-tiempo-real",
    storageBucket: "colectivos-tiempo-real.firebasestorage.app",
    messagingSenderId: "454978508967",
    appId: "1:454978508967:web:be55f535a0504029b5e382"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Mapbox token// ================== MAPBOX TOKEN ==================
// ¡NO BORRES ESTA LÍNEA! Solo cámbiala por tu token cuando estés trabajando localmente.
mapboxgl.accessToken = 'pk.eyJ1IjoibWlndWVsLTMwIiwiYSI6ImNtbDlrcmJmcDA0YmwzZ3EwdXMwemRjZ2UifQ.FWkrX_a7mSsh4nrxcKPVwg';
// =================================================
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [-58.53, -34.72],
    zoom: 12
});

// ==================== MARCADORES NATIVOS ESTABLES ====================

const markers = {};
const lastHeadings = {};

const vehicleColors = {
    'interno_01': '#00ff00',   // Verde
    'interno_02': '#ff9900',   // Naranja
    'interno_03': '#0099ff',   // Azul
    'interno_04': '#ff00ff',   // Magenta
    'interno_05': '#ffff00'    // Amarillo
};

db.ref("lines/linea_1/vehicles").on("value", (snapshot) => {
    const busesDiv = document.getElementById("buses");
    busesDiv.innerHTML = "";

    let vehicles = snapshot.val();

    // Soporte offline
    if (!navigator.onLine && localStorage.getItem('lastVehicles')) {
        vehicles = JSON.parse(localStorage.getItem('lastVehicles'));
        console.log('Usando datos cacheados offline');
    }

    // Guardar datos para offline
    if (navigator.onLine && vehicles && Object.keys(vehicles).length > 0) {
        localStorage.setItem('lastVehicles', JSON.stringify(vehicles));
    }

    if (!vehicles || Object.keys(vehicles).length === 0) {
        busesDiv.innerHTML = "<p style='text-align:center; color:#aaa;'>No hay colectivos activos en este momento</p>";
        
        // Limpiar marcadores
        Object.keys(markers).forEach(id => {
            if (markers[id]) markers[id].remove();
            delete markers[id];
        });
        return;
    }

    const sortedIds = Object.keys(vehicles).sort();

    sortedIds.forEach((id) => {
        const v = vehicles[id];
        const lngLat = [v.lng || -58.53, v.lat || -34.72];

        let heading = Number(v.heading) || 0;
        if (heading !== 0) lastHeadings[id] = heading;
        const currentHeading = lastHeadings[id] || 0;

        // Lista inferior
        const div = document.createElement("div");
        div.className = "bus";
        div.style.borderLeftColor = vehicleColors[id] || '#888888';
        div.innerHTML = `
            <strong>${id.toUpperCase()}</strong><br>
            📍 ${v.lat ? v.lat.toFixed(4) : '—'}, ${v.lng ? v.lng.toFixed(4) : '—'}<br>
            🚀 ${v.speed ? v.speed.toFixed(1) + ' km/h' : '—'} | ${currentHeading.toFixed(0)}°<br>
            🟢 ${v.online ? 'En línea' : 'Desconectado'}
        `;
        busesDiv.appendChild(div);

        // Marcador nativo estable
        if (!markers[id]) {
            markers[id] = new mapboxgl.Marker({
                color: vehicleColors[id] || '#888888',
                rotation: currentHeading,
                scale: 1.3,
                anchor: 'center'
            })
            .setLngLat(lngLat)
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <h3 style="margin:0; color:#000;">${id.toUpperCase()}</h3>
                <p style="margin:8px 0 0; font-size:13px;">
                    Lat: ${v.lat ? v.lat.toFixed(5) : '—'}<br>
                    Lng: ${v.lng ? v.lng.toFixed(5) : '—'}<br>
                    Vel: ${v.speed ? v.speed.toFixed(1) + ' km/h' : '—'}<br>
                    Dirección: ${currentHeading.toFixed(0)}°<br>
                    Estado: ${v.online ? '🟢 En línea' : '⚪ Desconectado'}
                </p>
            `))
            .addTo(map);
        } else {
            markers[id].setLngLat(lngLat);
            markers[id].setRotation(currentHeading);
        }
    });

    // Botón "Centrar en todos"
    document.getElementById('centerAllBtn').onclick = () => {
        if (Object.keys(markers).length === 0) return;
        const bounds = new mapboxgl.LngLatBounds();
        Object.values(markers).forEach(m => bounds.extend(m.getLngLat()));
        map.fitBounds(bounds, { padding: 80, maxZoom: 16 });
    };
});

// ==================== TU UBICACIÓN (PUNTO AZUL) ====================
let myMarker = null;
let myWatchId = null;

const myLocationBtn = document.getElementById('myLocationBtn');

myLocationBtn.addEventListener('click', () => {
    if (myMarker) {
        if (myWatchId) navigator.geolocation.clearWatch(myWatchId);
        myMarker.remove();
        myMarker = null;
        myWatchId = null;
        myLocationBtn.textContent = '📍';
        myLocationBtn.style.background = '#0066ff';
        return;
    }

    if (navigator.geolocation) {
        myLocationBtn.textContent = '⏳';
        myLocationBtn.style.background = '#ffaa00';

        myWatchId = navigator.geolocation.watchPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                if (!myMarker) {
                    const el = document.createElement('div');
                    el.style.backgroundColor = '#0066ff';
                    el.style.width = '26px';
                    el.style.height = '26px';
                    el.style.borderRadius = '50%';
                    el.style.border = '3px solid white';
                    el.style.boxShadow = '0 0 12px rgba(0,102,255,0.8)';
                    el.style.position = 'relative';

                    const inner = document.createElement('div');
                    inner.style.width = '10px';
                    inner.style.height = '10px';
                    inner.style.backgroundColor = 'white';
                    inner.style.borderRadius = '50%';
                    inner.style.position = 'absolute';
                    inner.style.top = '50%';
                    inner.style.left = '50%';
                    inner.style.transform = 'translate(-50%, -50%)';
                    el.appendChild(inner);

                    myMarker = new mapboxgl.Marker({ element: el, anchor: 'center' })
                        .setLngLat([lng, lat])
                        .addTo(map);

                    map.flyTo({ center: [lng, lat], zoom: 15 });
                } else {
                    myMarker.setLngLat([lng, lat]);
                }

                myLocationBtn.textContent = '✕';
                myLocationBtn.style.background = '#ff4444';
            },
            (error) => {
                console.error('Error ubicación:', error.message);
                alert('No se pudo obtener tu ubicación.\nVerifica permisos y GPS activado.');
                myLocationBtn.textContent = '📍';
                myLocationBtn.style.background = '#0066ff';
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        alert('Tu navegador no soporta geolocalización.');
    }
});