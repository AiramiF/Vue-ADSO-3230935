// main.js

import { createApp } from 'vue'
import { Quasar, Dialog } from 'quasar'

// Iconos de Material
import '@quasar/extras/material-icons/material-icons.css'

// CSS de Quasar
import 'quasar/src/css/index.sass'

// Componente principal
import App from './App.vue'

const myApp = createApp(App)

myApp.use(Quasar, {
  plugins: {
    Dialog
  }
})

myApp.mount('#app')