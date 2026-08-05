// ==================== CONFIGURACIÓN FIREBASE ====================
const firebaseConfig = {
    apiKey: "AIzaSyBLQTF45rPS0zUUNchDJ5DagygX8nojMxE",
    authDomain: "colectivos-tiempo-real.firebaseapp.com",
    databaseURL: "https://colectivos-tiempo-real-default-rtdb.firebaseio.com",
    projectId: "colectivos-tiempo-real",
    storageBucket: "colectivos-tiempo-real.firebasestorage.app",
    messagingSenderId: "454978508967",
    appId: "1:454978508967:web:be55f535a0504029b5e382"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ==================== INICIALIZACIÓN DEL MAPA CON LEAFLET ====================
const map = L.map('map', {
    zoomControl: true,
    attributionControl: true,
    preferCanvas: true
}).setView([-34.72, -58.53], 12);

// Mapa base OpenStreetMap
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO',
    maxZoom: 19,
    maxNativeZoom: 22
}).addTo(map);

// ==================== BOTÓN MI UBICACIÓN ====================
let myMarker = null;
let watchId = null;

// Creamos el ícono del punto azul usando las clases CSS que definimos arriba
const blueDotIcon = L.divIcon({
    className: 'google-maps-marker',
    iconSize: [35, 35],
    iconAnchor: [17.5, 17.5] // Centrado perfecto del div de 35x35
});

// ==================== BOTÓN PRINCIPAL GPS ====================
document.getElementById('myLocationBtn').addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert('GPS no disponible en este dispositivo');
        return;
    }

    // 1. Si el GPS ya está activo y vuelves a presionar, te centra en tu ubicación actual
    if (watchId && myMarker) {
        const currentLatLng = myMarker.getLatLng();
        map.flyTo(currentLatLng, 17, { duration: 1.2 });
        return;
    }

    // 2. Si no estaba activo, iniciamos el rastreo en tiempo real de fondo
    if (!watchId) {
        // Cambiamos el color del botón a azul indicando que está encendido
        document.getElementById('myLocationBtn').style.background = '#0066ff';
        let primeraVez = true;

        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                // Movemos o creamos el punto azul parpadeante
                if (myMarker) {
                    myMarker.setLatLng([lat, lng]);
                } else {
                    myMarker = L.marker([lat, lng], { icon: blueDotIcon }).addTo(map);
                }

                // SÓLO centra el mapa la primera vez que se activa
                if (primeraVez) {
                    map.flyTo([lat, lng], 17, { duration: 1.2 });
                    primeraVez = false; // Apagamos el centrado automático para los siguientes movimientos
                }
            },
            (error) => {
                alert('Error de GPS: ' + error.message);
                // En caso de error, apagamos el rastreo y restauramos el botón
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
                document.getElementById('myLocationBtn').style.background = 'rgb(126, 126, 126)';
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            }
        );
    }
});



// ==================== CARGAR RUTAS DESDE ARCHIVOS JSON ====================
const rutas = {};

// Función para cargar una ruta
async function cargarRuta(nombre, color) {
    try {
        const response = await fetch(`rutas/${nombre}.json`);
        const coords = await response.json();

        const polyline = L.polyline(coords, {
            color: color,
            weight: 6,
            opacity: 0.9
        }).addTo(map);

        rutas[nombre] = polyline;
        return polyline;
    } catch (error) {
        console.error(`Error cargando ruta ${nombre}:`, error);
    }
}

// Cargar todas las rutas al iniciar
async function cargarTodasLasRutas() {
    await Promise.all([
        cargarRuta('A_ida', '#ff0000'),
        cargarRuta('A_vuelta', '#ff0000'),
        cargarRuta('B_ida', '#ff0000'),
        cargarRuta('B_vuelta', '#ff0000'),
        cargarRuta('C_primera_junta', '#ff0000'),   // Cambiado
        cargarRuta('C_san_alberto', '#ff0000'),   // Si tenés dos para C
        cargarRuta('D_san_justo', '#ff0000'),
        cargarRuta('D_primera_junta', '#ff0000')
    ]);

    console.log('Todas las rutas cargadas correctamente');
}

// Llamar a la carga al iniciar
cargarTodasLasRutas();

// 3. Capa de etiquetas (También debe tener la misma configuración de zoom)
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO',
    pane: 'markerPane',
    maxZoom: 19,
    maxNativeZoom: 22
}).addTo(map);

// ==================== CREADOR DE RUTAS AUTOMÁTICO (SEGURO) ====================
/*
document.addEventListener('DOMContentLoaded', () => {
    // Nos aseguramos de que los elementos existan antes de hacer nada
    const btnModoPuntos = document.getElementById('btn-modo-puntos');
    const btnModoCoordenadas = document.getElementById('btn-modo-coordenadas');
    const coordsOutput = document.getElementById('coords-output');
    const btnCopiarTodo = document.getElementById('btn-copiar-todo');
    const btnLimpiarTodo = document.getElementById('btn-limpiar-todo');

    // Si por alguna razón no encuentra los botones en el HTML, no hace nada para no romper el resto del mapa
    if (!btnModoPuntos || !btnModoCoordenadas || !coordsOutput) {
        console.warn("No se encontraron los elementos del Creador de Rutas en el HTML.");
        return;
    }

    let modoActual = 'puntos'; // 'puntos' o 'coordenadas'
    let listaCoordenadas = []; // Array de coordenadas acumuladas
    let marcadoresFijos = [];  // Pines del mapa

    // Cambiar a Modo 1: Puntos Fijos
    btnModoPuntos.addEventListener('click', () => {
        modoActual = 'puntos';
        btnModoPuntos.classList.add('active');
        btnModoCoordenadas.classList.remove('active');
    });

    // Cambiar a Modo 2: Marcar Coordenadas
    btnModoCoordenadas.addEventListener('click', () => {
        modoActual = 'coordenadas';
        btnModoCoordenadas.classList.add('active');
        btnModoPuntos.classList.remove('active');
    });

    // EVENTO DE CLIC EN EL MAPA (Se monta sobre tu variable 'map' ya existente)
    if (typeof map !== 'undefined') {
        map.on('click', function (e) {
            const lat = e.latlng.lat.toFixed(6);
            const lng = e.latlng.lng.toFixed(6);

            if (modoActual === 'puntos') {
                // Modo 1: Pin visual rojo
                const marker = L.circleMarker(e.latlng, {
                    radius: 6,
                    fillColor: "#ff0000",
                    color: "#fff",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.9
                }).addTo(map);
                
                marcadoresFijos.push(marker);

            } else if (modoActual === 'coordenadas') {
                // Modo 2: Coordenada formateada a la consola
                const nuevaCoordText = `[${lat}, ${lng}],`;
                listaCoordenadas.push(nuevaCoordText);

                actualizarPantallaCoordenadas();

                // Pin visual verde temporal
                const tempMarker = L.circleMarker(e.latlng, {
                    radius: 4,
                    fillColor: "#00ff66",
                    color: "#fff",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.9
                }).addTo(map);
                marcadoresFijos.push(tempMarker);
            }
        });
    }

    // Actualiza la cajita de texto
    function actualizarPantallaCoordenadas() {
        if (listaCoordenadas.length === 0) {
            coordsOutput.innerText = "// Haz clic en el mapa para sumar coordenadas...";
            return;
        }
        coordsOutput.innerText = listaCoordenadas.join('\n');
        
        const container = document.querySelector('.coords-scroll-container');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    // Copiar todo al portapapeles
    btnCopiarTodo.addEventListener('click', () => {
        if (listaCoordenadas.length === 0) {
            alert('No hay coordenadas para copiar.');
            return;
        }
        const textoACopiar = listaCoordenadas.join('\n');
        navigator.clipboard.writeText(textoACopiar).then(() => {
            alert('¡Copiado! Ya puedes pegarlo en tu array.');
        }).catch(err => {
            alert('Error al copiar automáticamente: ' + err);
        });
    });

    // Limpiar pantalla y mapa
    btnLimpiarTodo.addEventListener('click', () => {
        if (confirm('¿Quieres limpiar el mapa de marcas y resetear la lista?')) {
            marcadoresFijos.forEach(m => {
                if (map.hasLayer(m)) map.removeLayer(m);
            });
            marcadoresFijos = [];
            listaCoordenadas = [];
            actualizarPantallaCoordenadas();
        }
    });
});
*/
// ==================== MARCADORES DE COLECTIVOS + VINCULACIÓN CON RAMALES ====================
const markers = {};
const STALE_TIME = 5 * 1000;   // 5 segundos
const vehicleToRamal = {
    // Formato: "A01", "A02", ... → ramal
    "A_ida01": "A_ida", "A_ida02": "A_ida", "A_ida03": "A_ida",
    "A_vuelta01": "A_vuelta", "A_vuelta02": "A_vuelta",
    "B_ida01": "B_ida", "B_ida02": "B_ida",
    "B_vuelta01": "B_vuelta", "B_vuelta02": "B_vuelta",
    "C_san_alberto01": "C", "C_san_alberto02": "C",
    "C_primera_junta01": "C", "C_primera_junta02": "C",
    "D_san_justo01": "D", "D_san_justo02": "D",
    "D_primera_junta01": "D", "D_primera_junta02": "D"
};

db.ref("lines/linea_1/vehicles").on("value", (snapshot) => {
    const vehicles = snapshot.val() || {};
    const now = Date.now();

    Object.keys(vehicles).forEach(id => {
        const v = vehicles[id];

        // Si no tiene ubicación o está marcado como offline
        if (!v.lat || !v.lng || v.online === false) {
            if (markers[id]) {
                map.removeLayer(markers[id]);
                delete markers[id];
            }
            return;
        }

        // Limpieza automática: si no se actualizó en los últimos X segundos
        if (now - v.updated_at > STALE_TIME) {
            db.ref(`lines/linea_1/vehicles/${id}`).update({ online: false });
            if (markers[id]) {
                map.removeLayer(markers[id]);
                delete markers[id];
            }
            return;
        }

        const latLng = [v.lat, v.lng];

        // Determinar a qué ramal pertenece este vehículo
        let ramalPrefix = null;
        if (id.startsWith('A_ida')) ramalPrefix = 'A_ida';
        else if (id.startsWith('A_vuelta')) ramalPrefix = 'A_vuelta';
        else if (id.startsWith('B_ida')) ramalPrefix = 'B_ida';
        else if (id.startsWith('B_vuelta')) ramalPrefix = 'B_vuelta';
        else if (id.startsWith('C')) ramalPrefix = 'C';
        else if (id.startsWith('D')) ramalPrefix = 'D';

        // Verificar si el checkbox de ese ramal está marcado
        const checkboxId = Object.keys(ramalMappings).find(key => ramalMappings[key] === ramalPrefix);
        const checkbox = checkboxId ? document.getElementById(checkboxId) : null;
        const shouldShow = checkbox ? checkbox.checked : true;

        if (markers[id]) {
            if (shouldShow) {
                markers[id].setLatLng(latLng);
                map.addLayer(markers[id]);
            } else {
                map.removeLayer(markers[id]);
            }
        } else if (shouldShow) {
            markers[id] = L.marker(latLng, {
                icon: L.divIcon({
                    className: 'bus-marker',
                    html: `<div style="background:#00ff00; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; color:black; border:2px solid white;">🚌</div>`,
                    iconSize: [28, 28],
                    iconAnchor: [14, 14]
                })
            }).addTo(map);

            markers[id].bindPopup(`
                <b>${id}</b><br>
                Vel: ${v.speed ? v.speed.toFixed(1) : '—'} km/h<br>
                Actualizado hace: ${Math.floor((now - v.updated_at) / 1000)} seg<br>
                Dirección: ${v.heading ? v.heading.toFixed(0) + '°' : '—'}
            `);
        }
    });
});

// ==================== LIMPIEZA AUTOMÁTICA PERIÓDICA ====================
setInterval(() => {
    const now = Date.now();

    db.ref("lines/linea_1/vehicles").once("value", (snapshot) => {
        const vehicles = snapshot.val() || {};

        Object.keys(vehicles).forEach(id => {
            const v = vehicles[id];

            if (v.online === true && now - v.updated_at > STALE_TIME) {
                db.ref(`lines/linea_1/vehicles/${id}`).update({ online: false });
            }
        });
    });
}, 5000);   // Revisar cada 5 segundos