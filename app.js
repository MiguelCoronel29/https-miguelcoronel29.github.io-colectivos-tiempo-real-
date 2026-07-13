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
let watchId = null; // Guardará el "id" del rastreo en tiempo real
let isTracking = false; // Nos dirá si el GPS activo está siguiendo la pantalla o no

document.getElementById('myLocationBtn').addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert('GPS no disponible en este dispositivo');
        return;
    }

    // Si ya te estaba siguiendo y vuelves a tocar el botón, te centra en el mapa
    if (isTracking && myMarker) {
        const currentLatLng = myMarker.getLatLng();
        map.flyTo(currentLatLng, 17, { duration: 1.5 }); // Zoom 17 es ideal para ver calles de cerca
        return;
    }

    // Si no estaba activo el rastreo en tiempo real, lo iniciamos:
    if (!isTracking) {
        isTracking = true;
        
        // Opcional: Cambiar el diseño del botón para avisar que está rastreando (ejemplo: ponerlo azul)
        document.getElementById('myLocationBtn').style.background = '#0066ff';

        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                // 1. Mover o crear el marcador en tiempo real
                if (myMarker) {
                    myMarker.setLatLng([lat, lng]);
                } else {
                    // Puedes cambiar el marcador por un círculo azul estilo GPS si quieres
                    myMarker = L.marker([lat, lng]).addTo(map);
                }


            },
            (error) => {
                alert('Error de GPS: ' + error.message);
                // Si hay error, reseteamos el estado
                isTracking = false;
                document.getElementById('myLocationBtn').style.background = 'rgb(126, 126, 126)';
            },
            { 
                enableHighAccuracy: true, // Máxima precisión (usa el GPS real, no solo antenas)
                maximumAge: 0,            // No queremos ubicaciones viejas guardadas en caché
                timeout: 5000             // Si tarda más de 5 segundos en responder, tira error
            }
        );
    }
});

// ==================== CLIC EN EL MAPA → COPIAR COORDENADAS PARA LEAFLET ====================
map.on('click', function(e) {
    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);

    // Formato listo para Leaflet: [Lat, Lng]
    const coordText = `[${lat}, ${lng}]`;

    // Copiar al portapapeles
    navigator.clipboard.writeText(coordText).then(() => {
        const popup = L.popup({
            closeButton: false,
            offset: [0, -10]
        })
        .setLatLng(e.latlng)
        .setContent(`
            <strong>¡Copiado para Leaflet!</strong><br>
            ${coordText}
        `)
        .openOn(map);
    });
});

// ==================== RUTAS DE LA LÍNEA 180 ====================

// Ruta principal
const rutaLinea180 = [
[-34.761019, -58.621813], //Comienza en AV. Nestor Kirchner
[-34.760924, -58.621810],
[-34.760583, -58.620037],
[-34.760539, -58.619791],
[-34.760510, -58.619442],
[-34.760514, -58.619096],
[-34.760543, -58.618817],
[-34.760605, -58.618069],
[-34.760572, -58.617712],
[-34.760473, -58.617023],
[-34.760391, -58.616647],
[-34.760120, -58.615671],
[-34.759803, -58.614885],
[-34.759723, -58.614614],
[-34.759366, -58.613327],
[-34.759243, -58.612873],
[-34.758985, -58.611819],
[-34.758712, -58.610658],
[-34.758454, -58.609706],
[-34.758430, -58.609561],
[-34.757976, -58.608059],
[-34.757837, -58.607525],
[-34.757465, -58.606229], //av. nestor kirchner y Carcaraña
[-34.757410, -58.605873],
[-34.757242, -58.605242],
[-34.757253, -58.604985],
[-34.757355, -58.604636],
[-34.757357, -58.604446],
[-34.757189, -58.603767],
[-34.757167, -58.603601],
[-34.756973, -58.602928],
[-34.756709, -58.602010],
[-34.756407, -58.600913],
[-34.756057, -58.599717],
[-34.755708, -58.598491],
[-34.754615, -58.594554],
[-34.754355, -58.593698],
[-34.754324, -58.593577],
[-34.754115, -58.592880],
[-34.753961, -58.592298],
[-34.753692, -58.591394],
[-34.753540, -58.590817],
[-34.753090, -58.589235],
[-34.752857, -58.588406],
[-34.752888, -58.588108],
[-34.753038, -58.587285],
[-34.753013, -58.587127],
[-34.751896, -58.585053],
[-34.751788, -58.584718],
[-34.751416, -58.584002],
[-34.751153, -58.583578],
[-34.750715, -58.582787],
[-34.750278, -58.581969],
[-34.749648, -58.580815],
[-34.749637, -58.580802],
[-34.749465, -58.580789],
[-34.749245, -58.580848],
[-34.749062, -58.580706],
[-34.748905, -58.580416],
[-34.747510, -58.577699],
[-34.747045, -58.576846],
[-34.746571, -58.575974],
[-34.746137, -58.575145],
[-34.745657, -58.574241],
[-34.744844, -58.572678],
[-34.744125, -58.571310],
[-34.743684, -58.570481],
[-34.743307, -58.569877],
[-34.742983, -58.569271],
[-34.742851, -58.569145],
[-34.742452, -58.568939],
[-34.742305, -58.568756],
[-34.742005, -58.568273],
[-34.741661, -58.567807], //Carlos Casares y AV. Kirchner
[-34.741075, -58.566839],
[-34.740603, -58.566074],
[-34.740361, -58.565677],
[-34.739876, -58.564781],
[-34.739413, -58.563896],
[-34.739084, -58.563274],
[-34.738652, -58.562469],
[-34.738196, -58.561606],
[-34.737749, -58.560742],
[-34.737156, -58.559626],
[-34.736510, -58.558408],
[-34.736076, -58.557582],
[-34.735485, -58.556461],
[-34.734793, -58.555149],
[-34.735137, -58.555804],
[-34.734786, -58.555160],
[-34.734365, -58.554345],
[-34.733744, -58.553178], // AV. Kirchner y AV. Cristiania
[-34.732670, -58.554602],
[-34.731559, -58.556088],
[-34.730459, -58.557563],
[-34.729926, -58.558253],
[-34.729461, -58.558837],
[-34.729247, -58.559130],
[-34.729009, -58.559460],
[-34.728608, -58.559983],
[-34.728094, -58.560688],
[-34.727567, -58.561402],
[-34.727153, -58.561943],
[-34.726661, -58.562587],
[-34.726266, -58.563126],
[-34.725554, -58.564065],
[-34.725041, -58.564746],
[-34.724435, -58.565551],
[-34.724075, -58.566037],
[-34.723240, -58.567134],
[-34.722629, -58.567944],
[-34.722349, -58.568346],
[-34.721670, -58.569236],
[-34.721174, -58.569851],
[-34.720954, -58.570154], //AV, Cristiania y AV Crovara
[-34.719922, -58.569033],
[-34.719324, -58.568389],
[-34.718923, -58.567925],
[-34.717858, -58.566739],
[-34.717060, -58.565851],
[-34.716293, -58.565007],
[-34.715649, -58.564298],
[-34.715005, -58.563555],
[-34.714225, -58.562670],
[-34.712280, -58.559060],
[-34.711204, -58.557091],
[-34.710338, -58.555482],
[-34.709246, -58.553468],
[-34.709041, -58.553114],
[-34.708437, -58.552478],
[-34.708353, -58.552352],
[-34.707945, -58.551359],
[-34.707116, -58.549442],
[-34.705745, -58.547929],
[-34.705253, -58.547438],
[-34.704543, -58.546676],
[-34.704091, -58.546175],
[-34.702969, -58.544933],
[-34.702058, -58.543911],
[-34.701019, -58.542752],
[-34.700856, -58.542565],
[-34.700472, -58.542125],
[-34.700391, -58.541921],
[-34.700426, -58.541537],// AV, crovara y Rotonda de Tablada
[-34.700552, -58.541140],
[-34.700521, -58.540990],
[-34.700433, -58.540872],
[-34.700208, -58.540824],
[-34.699983, -58.540910],
[-34.699804, -58.540888],
[-34.699619, -58.540655],
[-34.698673, -58.539080],
[-34.697974, -58.537924],
[-34.697370, -58.536935],
[-34.697030, -58.536363],
[-34.696616, -58.535687],
[-34.695916, -58.534507],
[-34.695681, -58.534110],
[-34.695220, -58.533319],
[-34.694783, -58.532589],
[-34.694311, -58.531822],
[-34.693863, -58.531085],
[-34.693440, -58.530487],
[-34.693301, -58.530452],
[-34.692459, -58.529282],
[-34.692419, -58.529170],
[-34.692205, -58.528877],
[-34.692134, -58.528824],
[-34.691698, -58.528212],//AV. Crovara y Argentina
[-34.688524, -58.532407],//Argentina y Chiclana
[-34.687951, -58.531769],
[-34.687428, -58.531197],
[-34.686341, -58.529963],
[-34.685822, -58.529395],
[-34.684720, -58.528048],
[-34.683348, -58.526321],
[-34.682805, -58.525602],
[-34.682117, -58.524760],
[-34.681032, -58.523135],
[-34.679902, -58.521504],//Chiclana y AV. San Martin
[-34.680610, -58.520699],//AV. San Martin y Jeronimo Salguero
[-34.680167, -58.520058],
[-34.679814, -58.519511],
[-34.678639, -58.517778],
[-34.677928, -58.516754],
[-34.677538, -58.516198],
[-34.676927, -58.514935],
[-34.676036, -58.513953],
[-34.675105, -58.512905],
[-34.674066, -58.511746],//Jeronimo Salguero y Panamá
[-34.672500, -58.513267],//Panamá y Polonia
[-34.671814, -58.512489],
[-34.670501, -58.511041],
[-34.669195, -58.509608],//Polonia y AV General Paz
[-34.669610, -58.509042],
[-34.669795, -58.508755],//AV. General Paz y Av de los corrales
[-34.669531, -58.508530],
[-34.669087, -58.508020],
[-34.669052, -58.507889],
[-34.668141, -58.506805],
[-34.666526, -58.504885],
[-34.665862, -58.504099],
[-34.664543, -58.502487],
[-34.663212, -58.500867],
[-34.662601, -58.500113],//AV de los corrales y AV lisandro de la torre
[-34.661328, -58.501653],
[-34.660137, -58.503104],
[-34.658915, -58.504592],
[-34.656117, -58.507943],//Av Lisandro de la Torre y AV Juan Bautista Alberdi
[-34.653655, -58.504606],
[-34.653620, -58.504483],
[-34.651466, -58.502219],
[-34.651356, -58.502213],
[-34.648412, -58.499054],
[-34.645645, -58.496034],
[-34.644904, -58.495226],// AV Juan Bautista Alberdi y AV Bruix
[-34.644974, -58.494805],
[-34.645844, -58.491442],
[-34.647080, -58.486646],//AV Bruix y AV Dorectorio
[-34.641314, -58.479903],
[-34.640627, -58.478824],
[-34.640601, -58.478680],
[-34.640217, -58.478100],
[-34.640155, -58.477939],
[-34.638972, -58.476003],
[-34.637322, -58.473347],
[-34.636353, -58.470190],
[-34.635629, -58.467650],
[-34.635516, -58.467495],
[-34.634157, -58.462930],
[-34.633162, -58.459617],
[-34.632462, -58.457383],
[-34.631484, -58.454347],
[-34.631855, -58.455495],
[-34.631147, -58.453223],
[-34.630624, -58.451579],
[-34.630158, -58.448269],
[-34.629343, -58.442902],
[-34.628873, -58.439511],
[-34.628302, -58.435619],
[-34.627805, -58.432331],
[-34.627414, -58.429614],
[-34.626995, -58.426749],//AV Directorio y AV San Juan
[-34.626437, -58.422815],
[-34.626046, -58.420224],
[-34.625666, -58.417675],
[-34.625419, -58.416088],
[-34.625260, -58.414688],//AV San Juan y Maza
[-34.624364, -58.414763],
[-34.622285, -58.414945],
[-34.620846, -58.415101],
[-34.619729, -58.415211],
[-34.618504, -58.415312],
[-34.617239, -58.415535],
[-34.614442, -58.415975],
[-34.614447, -58.415975],
[-34.613551, -58.416200],
[-34.611047, -58.417284],
[-34.608414, -58.417490],
[-34.606886, -58.417273],
[-34.604705, -58.416927],
[-34.603599, -58.416758],//Maza y AV Corrientes
[-34.604058, -58.414516],
[-34.604168, -58.413067],
[-34.604031, -58.410326],
[-34.604124, -58.408905],
[-34.604764, -58.403615],
[-34.604535, -58.396368],
[-34.604473, -58.396204],
[-34.604409, -58.392307],
[-34.604054, -58.387908],
[-34.603866, -58.385130],
[-34.603767, -58.383437],
[-34.603795, -58.383290],
[-34.603731, -58.382112],
[-34.603656, -58.381924],
[-34.603594, -58.381549],
[-34.603619, -58.381230],
[-34.603665, -58.381039],
[-34.603493, -58.378073],
[-34.603318, -58.375221],
[-34.603168, -58.372456],
[-34.603011, -58.370088],
[-34.602826, -58.368033],
];
const polylinePrincipal = L.polyline(rutaLinea180, { 
    color: '#ff0000', 
    weight: 6, 
    opacity: 0.9 
}).addTo(map);

// Ruta Correo
const rutaLinea180correo = [ /* pegá tus coordenadas aquí */ ];
const polylineCorreo = L.polyline(rutaLinea180correo, { 
    color: '#FF8800', 
    weight: 6, 
    opacity: 0.9 
}).addTo(map);

// Ruta A Primera Junta
const rutaLinea180aprimerajunta = [ /* pegá tus coordenadas aquí */ ];
const polylinePrimeraJunta = L.polyline(rutaLinea180aprimerajunta, { 
    color: '#00AA00', 
    weight: 6, 
    opacity: 0.9 
}).addTo(map);

// Ruta A González Catán
const rutaLinea180agonzalezcatan = [ /* pegá tus coordenadas aquí */ ];
const polylineGonzalezCatan = L.polyline(rutaLinea180agonzalezcatan, { 
    color: '#0088FF', 
    weight: 6, 
    opacity: 0.9 
}).addTo(map);

// Ruta San Alberto
const rutaLinea180asanalberto = [ /* pegá tus coordenadas aquí */ ];
const polylineSanAlberto = L.polyline(rutaLinea180asanalberto, { 
    color: '#AA00FF', 
    weight: 6, 
    opacity: 0.9 
}).addTo(map);

// Ruta Línea C hasta Primera Junta
const rutaLinea_180_linea_C_hasta_primera_junta = [ /* pegá tus coordenadas aquí */ ];
const polylineLineaC = L.polyline(rutaLinea_180_linea_C_hasta_primera_junta, { 
    color: '#FF00AA', 
    weight: 6, 
    opacity: 0.9 
}).addTo(map);

// Ruta Línea D hasta San Justo
const rutaLinea_180_linea_D_hasta_San_justo = [ /* pegá tus coordenadas aquí */ ];
const polylineLineaD_SanJusto = L.polyline(rutaLinea_180_linea_D_hasta_San_justo, { 
    color: '#00FFAA', 
    weight: 6, 
    opacity: 0.9 
}).addTo(map);

// Ruta Línea D hasta Primera Junta
const rutaLinea_180_linea_D_hasta_Primera_junta = [ /* pegá tus coordenadas aquí */ ];
const polylineLineaD_PrimeraJunta = L.polyline(rutaLinea_180_linea_D_hasta_Primera_junta, { 
    color: '#FFAA00', 
    weight: 6, 
    opacity: 0.9 
}).addTo(map);

// 3. Capa de etiquetas (También debe tener la misma configuración de zoom)
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO',
    pane: 'markerPane',
    maxZoom: 19,
    maxNativeZoom: 22
}).addTo(map);