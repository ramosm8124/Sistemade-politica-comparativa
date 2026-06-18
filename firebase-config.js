/*
  ╔══════════════════════════════════════════════════════════════════╗
  ║  CONFIGURACIÓN FIREBASE                                          ║
  ║  1. Ve a https://console.firebase.google.com                     ║
  ║  2. "Crear proyecto" → ponle un nombre → continuar               ║
  ║  3. En el proyecto: Compilación → Firestore Database → Crear     ║
  ║     Elige "Empezar en modo de prueba"                            ║
  ║  4. En Configuración del proyecto → Agregar app → Web (</>)      ║
  ║  5. Copia los valores y pégalos aquí abajo                       ║
  ║                                                                  ║
  ║  Si dejas apiKey como "SIN_CONFIGURAR" la app funciona           ║
  ║  igual pero sin sincronización entre dispositivos.               ║
  ╚══════════════════════════════════════════════════════════════════╝
*/

window.FIREBASE_CONFIG = {
  apiKey:            "SIN_CONFIGURAR",
  authDomain:        "tu-proyecto.firebaseapp.com",
  projectId:         "tu-proyecto",
  storageBucket:     "tu-proyecto.appspot.com",
  messagingSenderId: "000000000000",
  appId:             "1:000000000000:web:abcdef1234567890"
};
