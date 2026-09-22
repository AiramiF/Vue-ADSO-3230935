<script setup>
import { ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { Dialog } from 'quasar'

const servicios = useLocalStorage('servicios-tecnicos', [])

const mostrarModal = ref(false)
const editando = ref(false)
const idEditando = ref(null)
const estadoEquipoOriginal = ref(null)

const formulario = ref({
  cliente: '',
  marca: '',
  otraMarca: '',
  modelo: '',
  reparacion: [],
  otraReparacion: '',
  tecnico: '',
  fecha: '',
  precio: null,
  metodoPago: '',
  estadoPago: '',
  abono: null,
  estadoEquipo: 'Recibido',
  calificacion: null,
  observaciones: ''
})

const marcas = [
  'Apple',
  'Samsung',
  'Xiaomi',
  'Motorola',
  'Huawei',
  'Honor',
  'Oppo',
  'Realme',
  'LG',
  'Nokia',
  'TCL',
  'ZTE',
  'Otra'
]

const tiposReparacion = [
  'Cambio de pantalla',
  'Cambio de batería',
  'Cambio de pin de carga',
  'Liberación',
  'Mantenimiento de software',
  'Cambio de flex',
  'Otros'
]

const tecnicos = [
  'Don Efraín',
  'Técnico 1',
  'Técnico 2'
]

const metodosPago = [
  'Efectivo',
  'Transferencia',
  'Tarjeta'
]

const estadosPago = [
  'Pagado',
  'Pendiente',
  'Abono'
]

const estadosEquipo = [
  'Recibido',
  'En reparación',
  'Listo para entregar',
  'Entregado'
]

const limitesTexto = {
  cliente: 60,
  marca: 40,
  modelo: 50,
  reparacion: 100,
  observaciones: 250
}


function tieneLetras(texto) {
  return typeof texto === 'string' && /[A-Za-zÁÉÍÓÚÜüÑñ]/.test(texto)
}


function validarTexto(texto, mensaje) {
  return tieneLetras(texto) || mensaje
}


function validarTextoOpcional(texto) {
  return !texto || tieneLetras(texto) || 'Escriba letras o deje el campo vacío'
}


function quitarEspacios(texto) {
  if (typeof texto !== 'string') {
    return texto
  }

  return texto.trim()
}


function obtenerFechaActual() {
  const ahora = new Date()

  const anio = ahora.getFullYear()
  const mes = String(ahora.getMonth() + 1).padStart(2, '0')
  const dia = String(ahora.getDate()).padStart(2, '0')
  const hora = String(ahora.getHours()).padStart(2, '0')
  const minutos = String(ahora.getMinutes()).padStart(2, '0')

  return `${anio}-${mes}-${dia}T${hora}:${minutos}`
}


function limpiarFormulario() {
  formulario.value = {
    cliente: '',
    marca: '',
    otraMarca: '',
    modelo: '',
    reparacion: [],
    otraReparacion: '',
    tecnico: '',
    fecha: '',
    precio: null,
    metodoPago: '',
    estadoPago: '',
    abono: null,
    estadoEquipo: 'Recibido',
    calificacion: null,
    observaciones: ''
  }

  estadoEquipoOriginal.value = null
}


function abrirNuevoServicio() {
  limpiarFormulario()

  formulario.value.fecha = obtenerFechaActual()
  formulario.value.estadoEquipo = 'Recibido'

  editando.value = false
  idEditando.value = null

  mostrarModal.value = true
}


function revisarEstadoPago() {
  if (
    formulario.value.estadoPago !== 'Pagado' &&
    formulario.value.estadoEquipo === 'Entregado'
  ) {
    formulario.value.estadoEquipo = 'Listo para entregar'
    formulario.value.calificacion = null
  }
}


function revisarEstadoEquipo() {
  if (formulario.value.estadoEquipo !== 'Entregado') {
    formulario.value.calificacion = null
  }
}


function obtenerEstadosEquipoDisponibles() {
  if (formulario.value.estadoPago === 'Pagado') {
    return estadosEquipo
  }

  return estadosEquipo.filter(estado => estado !== 'Entregado')
}


/*
 * LÓGICA DE MARCA
 *
 * Si el usuario cambia la marca y deja de seleccionar "Otra",
 * se borra automáticamente la marca personalizada.
 */
function revisarMarca() {
  if (formulario.value.marca !== 'Otra') {
    formulario.value.otraMarca = ''
  }
}


/*
 * LÓGICA DE REPARACIÓN
 *
 * Si el usuario elimina "Otros" de la selección,
 * se borra automáticamente el texto personalizado.
 */
function revisarReparaciones() {
  if (!formulario.value.reparacion.includes('Otros')) {
    formulario.value.otraReparacion = ''
  }
}


function guardarServicio() {
  // VALIDACIONES MANUALES

  if (!tieneLetras(formulario.value.cliente)) {
    return
  }

  if (!formulario.value.marca) {
    return
  }

  // Si escogió "Otra", debe escribir la marca
  if (
    formulario.value.marca === 'Otra' &&
    !tieneLetras(formulario.value.otraMarca)
  ) {
    return
  }

  if (!tieneLetras(formulario.value.modelo)) {
    return
  }

  if (
    !formulario.value.reparacion ||
    formulario.value.reparacion.length === 0
  ) {
    return
  }

  // Si escogió "Otros", debe especificar la reparación
  if (
    formulario.value.reparacion.includes('Otros') &&
    !tieneLetras(formulario.value.otraReparacion)
  ) {
    return
  }

  if (!formulario.value.tecnico) {
    return
  }

  if (
    formulario.value.precio === null ||
    formulario.value.precio === ''
  ) {
    return
  }

  if (!formulario.value.metodoPago) {
    return
  }

  if (!formulario.value.estadoPago) {
    return
  }

  if (
    formulario.value.estadoPago === 'Abono' &&
    (
      formulario.value.abono === null ||
      formulario.value.abono === ''
    )
  ) {
    return
  }

  if (
    formulario.value.estadoPago === 'Abono' &&
    Number(formulario.value.abono) === Number(formulario.value.precio)
  ) {
    Dialog.create({
      title: 'Abono completado',
      message:
        'Ya se abonó la totalidad del arreglo. Cambie el estado del pago a Pagado para poder continuar.'
    })

    return
  }

  if (
    formulario.value.estadoPago === 'Abono' &&
    Number(formulario.value.abono) > Number(formulario.value.precio)
  ) {
    Dialog.create({
      title: 'Abono no válido',
      message: 'El abono no puede ser mayor al valor total del arreglo.'
    })

    return
  }

  if (
    formulario.value.estadoEquipo === 'Entregado' &&
    formulario.value.estadoPago !== 'Pagado'
  ) {
    Dialog.create({
      title: 'No se puede entregar el equipo',
      message:
        'No se puede entregar el equipo hasta que se haya cancelado por completo el arreglo.'
    })

    return
  }

  /*
   * Si se está editando
   */
  if (editando.value === true) {
    const indice = servicios.value.findIndex(
      servicio => servicio.id === idEditando.value
    )

    if (indice !== -1) {

      // Un servicio entregado no puede modificarse
      if (
        servicios.value[indice].estadoEquipo === 'Entregado'
      ) {
        return
      }

      servicios.value[indice] = {
        id: idEditando.value,

        cliente: quitarEspacios(formulario.value.cliente),

        // Guardamos la marca personalizada si corresponde
        marca:
          formulario.value.marca === 'Otra'
            ? quitarEspacios(formulario.value.otraMarca)
            : formulario.value.marca,

        // Guardamos también que fue personalizada
        marcaOriginal: formulario.value.marca,

        otraMarca:
          formulario.value.marca === 'Otra'
            ? quitarEspacios(formulario.value.otraMarca)
            : '',

        modelo: quitarEspacios(formulario.value.modelo),

        reparacion: formulario.value.reparacion,

        otraReparacion:
          formulario.value.reparacion.includes('Otros')
            ? quitarEspacios(formulario.value.otraReparacion)
            : '',

        tecnico: formulario.value.tecnico,

        // La fecha original no cambia
        fecha: servicios.value[indice].fecha,

        precio: formulario.value.precio,

        metodoPago: formulario.value.metodoPago,

        estadoPago: formulario.value.estadoPago,

        abono:
          formulario.value.estadoPago === 'Abono'
            ? formulario.value.abono
            : null,

        estadoEquipo: formulario.value.estadoEquipo,

        calificacion:
          formulario.value.estadoEquipo === 'Entregado'
            ? formulario.value.calificacion
            : null,

        observaciones: quitarEspacios(formulario.value.observaciones)
      }
    }
  }

  /*
   * Si es un nuevo servicio
   */
  else {
    const nuevoServicio = {
      id: Date.now(),

      cliente: quitarEspacios(formulario.value.cliente),

      marca:
        formulario.value.marca === 'Otra'
          ? quitarEspacios(formulario.value.otraMarca)
          : formulario.value.marca,

      marcaOriginal: formulario.value.marca,

      otraMarca:
        formulario.value.marca === 'Otra'
          ? quitarEspacios(formulario.value.otraMarca)
          : '',

      modelo: quitarEspacios(formulario.value.modelo),

      reparacion: formulario.value.reparacion,

      otraReparacion:
        formulario.value.reparacion.includes('Otros')
          ? quitarEspacios(formulario.value.otraReparacion)
          : '',

      tecnico: formulario.value.tecnico,

      fecha: formulario.value.fecha,

      precio: formulario.value.precio,

      metodoPago: formulario.value.metodoPago,

      estadoPago: formulario.value.estadoPago,

      abono:
        formulario.value.estadoPago === 'Abono'
          ? formulario.value.abono
          : null,

      // Todo registro nuevo comienza como recibido
      estadoEquipo: 'Recibido',

      // La calificación se registra al entregar
      calificacion: null,

      observaciones: quitarEspacios(formulario.value.observaciones)
    }

    servicios.value.push(nuevoServicio)
  }

  mostrarModal.value = false

  limpiarFormulario()

  editando.value = false
  idEditando.value = null
}


function editarServicio(servicio) {
  // No se pueden editar servicios entregados
  if (servicio.estadoEquipo === 'Entregado') {
    return
  }

  /*
   * Compatibilidad con registros antiguos.
   *
   * Si antes la reparación era un texto,
   * la convertimos en un arreglo.
   */
  let reparaciones = []

  if (Array.isArray(servicio.reparacion)) {
    reparaciones = servicio.reparacion
  } else if (servicio.reparacion) {
    reparaciones = [servicio.reparacion]
  }

  /*
   * Si el registro fue creado con la lógica anterior
   * y la marca no tiene marcaOriginal,
   * asumimos que es una marca normal.
   */
  const marcaFormulario =
    servicio.marcaOriginal ||
    servicio.marca ||
    ''

  formulario.value = {
    cliente: servicio.cliente,

    marca: marcaFormulario,

    otraMarca:
      servicio.otraMarca ||
      '',

    modelo: servicio.modelo,

    reparacion: reparaciones,

    otraReparacion:
      servicio.otraReparacion ||
      '',

    tecnico: servicio.tecnico,

    fecha: servicio.fecha,

    precio: servicio.precio,

    metodoPago: servicio.metodoPago,

    estadoPago: servicio.estadoPago,

    abono: servicio.abono,

    estadoEquipo: servicio.estadoEquipo,

    calificacion: servicio.calificacion,

    observaciones: servicio.observaciones || ''
  }

  idEditando.value = servicio.id
  estadoEquipoOriginal.value = servicio.estadoEquipo
  editando.value = true

  mostrarModal.value = true
}


function eliminarServicio(servicio) {
  // No se pueden eliminar servicios entregados
  if (servicio.estadoEquipo === 'Entregado') {
    return
  }

  Dialog.create({
    title: 'Eliminar servicio',

    message:
      `¿Está seguro de que desea eliminar el servicio de ${servicio.cliente}?`,

    cancel: true,

    persistent: true,

    ok: {
      label: 'Eliminar',
      color: 'negative'
    },

    cancel: {
      label: 'Cancelar',
      color: 'grey-7'
    }
  }).onOk(() => {

    servicios.value = servicios.value.filter(
      item => item.id !== servicio.id
    )

  })
}


function obtenerReparaciones(servicio) {
  if (Array.isArray(servicio.reparacion)) {
    return servicio.reparacion
  }

  if (servicio.reparacion) {
    return [servicio.reparacion]
  }

  return []
}


function obtenerIconoEstado(estado) {
  if (estado === 'Recibido') {
    return 'inventory_2'
  }

  if (estado === 'En reparación') {
    return 'build'
  }

  if (estado === 'Listo para entregar') {
    return 'check_circle'
  }

  if (estado === 'Entregado') {
    return 'inventory'
  }

  return 'help'
}


function obtenerColorEstado(estado) {
  if (estado === 'Recibido') {
    return 'info'
  }

  if (estado === 'En reparación') {
    return 'warning'
  }

  if (estado === 'Listo para entregar') {
    return 'positive'
  }

  if (estado === 'Entregado') {
    return 'grey'
  }

  return 'primary'
}


function obtenerColorPago(estado) {
  if (estado === 'Pagado') {
    return 'positive'
  }

  if (estado === 'Pendiente') {
    return 'negative'
  }

  if (estado === 'Abono') {
    return 'warning'
  }

  return 'primary'
}


function formatearPrecio(precio) {
  if (
    precio === null ||
    precio === '' ||
    precio === undefined
  ) {
    return '$0'
  }

  return Number(precio).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  })
}


function formatearFecha(fecha) {
  if (!fecha) {
    return 'Sin fecha'
  }

  const fechaObj = new Date(fecha)

  return fechaObj.toLocaleString('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short'
  })
}


function estrellaActiva(numero, calificacion) {
  if (!calificacion) {
    return false
  }

  return numero <= calificacion
}


function calificarServicio(servicio, calificacion) {
  if (servicio.estadoEquipo !== 'Entregado') {
    return
  }

  servicio.calificacion = calificacion
}
</script>


<template>
  <div class="app-container">

    <header class="app-header">

      <div>

        <div class="text-h4 text-weight-bold">
          TecnoFix
        </div>

        <div class="text-subtitle1 text-grey-7">
          Servicio técnico de celulares y tablets
        </div>

      </div>

      <q-icon
        name="phone_android"
        size="42px"
        color="primary"
      />

    </header>


    <div class="main-content">

      <div class="q-mt-lg">

        <q-btn
          color="primary"
          icon="add"
          label="Nuevo servicio"
          unelevated
          class="full-width"
          size="lg"
          @click="abrirNuevoServicio"
        />

      </div>


      <div class="row items-center justify-between q-mt-xl q-mb-md">

        <div>

          <div class="text-h5 text-weight-bold">
            Servicios registrados
          </div>

          <div class="text-body1 text-grey-7">
            Equipos actualmente registrados en el taller
          </div>

        </div>

        <q-badge
          color="primary"
          :label="servicios.length"
          class="text-body1"
        />

      </div>


      <!-- SIN SERVICIOS -->

      <div
        v-if="servicios.length === 0"
        class="empty-state"
      >

        <q-icon
          name="phone_android"
          size="64px"
          color="grey-5"
        />

        <div class="text-h6 q-mt-md">
          No hay servicios registrados
        </div>

        <div class="text-body1 text-grey-6 q-mt-sm">
          Comienza registrando el primer equipo del taller.
        </div>

      </div>


      <!-- LISTA DE SERVICIOS -->

      <div
        v-for="servicio in servicios"
        :key="servicio.id"
        class="q-mb-md"
      >

        <q-card
          bordered
          class="service-card"
          :class="{
            'payment-pending':
              servicio.estadoPago === 'Pendiente',

            'payment-abono':
              servicio.estadoPago === 'Abono',

            'service-delivered':
              servicio.estadoEquipo === 'Entregado'
          }"
        >

          <q-card-section>

            <div class="row items-start justify-between">

              <div class="row items-center">

                <q-avatar
                  color="primary"
                  text-color="white"
                  icon="smartphone"
                  size="48px"
                />

                <div class="q-ml-md">

                  <div class="text-h6 text-weight-bold">
                    {{ servicio.marca }}
                    {{ servicio.modelo }}
                  </div>

                  <div class="text-body1 text-grey-7">
                    {{ servicio.cliente }}
                  </div>

                </div>

              </div>

              <q-badge
                :color="
                  obtenerColorPago(
                    servicio.estadoPago
                  )
                "
                :label="servicio.estadoPago"
                class="text-body1"
              />

            </div>

          </q-card-section>


          <q-card-section class="q-pt-none">

            <!-- MARCA -->

            <div class="info-item q-mb-md">

              <q-icon
                name="phone_android"
                size="24px"
                color="primary"
              />

              <div>

                <div class="text-caption text-grey-6">
                  Marca
                </div>

                <div class="text-body1">
                  {{ servicio.marca }}
                </div>

              </div>

            </div>


            <!-- MODELO -->

            <div class="info-item q-mb-md">

              <q-icon
                name="smartphone"
                size="24px"
                color="primary"
              />

              <div>

                <div class="text-caption text-grey-6">
                  Modelo
                </div>

                <div class="text-body1">
                  {{ servicio.modelo }}
                </div>

              </div>

            </div>


            <!-- REPARACIONES -->

            <div class="info-item q-mb-md">

              <q-icon
                name="build"
                size="24px"
                color="primary"
              />

              <div>

                <div class="text-caption text-grey-6">
                  Tipo de reparación
                </div>

                <div class="q-mt-xs q-gutter-xs">

                  <q-chip
                    v-for="
                      reparacion in obtenerReparaciones(servicio)
                    "
                    :key="reparacion"
                    color="primary"
                    text-color="white"
                    class="text-body2"
                  >
                    {{ reparacion }}
                  </q-chip>

                </div>

                <div
                  v-if="servicio.otraReparacion"
                  class="text-body1 q-mt-sm"
                >

                  <strong>
                    Reparación especificada:
                  </strong>

                  {{ servicio.otraReparacion }}

                </div>

              </div>

            </div>


            <!-- TÉCNICO Y FECHA -->

            <div class="row q-col-gutter-md">

              <div class="col-12 col-sm-6">

                <div class="info-item">

                  <q-icon
                    name="person"
                    size="24px"
                    color="primary"
                  />

                  <div>

                    <div class="text-caption text-grey-6">
                      Técnico
                    </div>

                    <div class="text-body1">
                      {{ servicio.tecnico }}
                    </div>

                  </div>

                </div>

              </div>


              <div class="col-12 col-sm-6">

                <div class="info-item">

                  <q-icon
                    name="schedule"
                    size="24px"
                    color="primary"
                  />

                  <div>

                    <div class="text-caption text-grey-6">
                      Recepción
                    </div>

                    <div class="text-body1">
                      {{ formatearFecha(servicio.fecha) }}
                    </div>

                  </div>

                </div>

              </div>

            </div>


            <!-- PRECIO Y MÉTODO DE PAGO -->

            <div class="row q-col-gutter-md q-mt-md">

              <div class="col-12 col-sm-6">

                <div class="info-item">

                  <q-icon
                    name="payments"
                    size="24px"
                    color="primary"
                  />

                  <div>

                    <div class="text-caption text-grey-6">
                      Precio
                    </div>

                    <div class="text-body1 text-weight-bold">
                      {{ formatearPrecio(servicio.precio) }}
                    </div>

                  </div>

                </div>

              </div>


              <div class="col-12 col-sm-6">

                <div class="info-item">

                  <q-icon
                    name="account_balance_wallet"
                    size="24px"
                    color="primary"
                  />

                  <div>

                    <div class="text-caption text-grey-6">
                      Método de pago
                    </div>

                    <div class="text-body1">
                      {{ servicio.metodoPago }}
                    </div>

                  </div>

                </div>

              </div>

            </div>


            <!-- ABONO -->

            <div
              v-if="servicio.estadoPago === 'Abono'"
              class="payment-detail q-mt-md"
            >

              <q-icon
                name="payments"
                size="22px"
                color="warning"
              />

              <span>

                Abono realizado:

                <strong>
                  {{ formatearPrecio(servicio.abono) }}
                </strong>

              </span>

            </div>


            <!-- ESTADO -->

            <div class="q-mt-lg">

              <q-chip
                :color="
                  obtenerColorEstado(
                    servicio.estadoEquipo
                  )
                "
                text-color="white"
                :icon="
                  obtenerIconoEstado(
                    servicio.estadoEquipo
                  )
                "
                :label="servicio.estadoEquipo"
                class="text-body1"
              />

            </div>


            <!-- OBSERVACIONES -->

            <div
              v-if="servicio.observaciones"
              class="observation-box q-mt-md"
            >

              <q-icon
                name="notes"
                size="24px"
              />

              <div>

                <div class="text-caption text-grey-6">
                  Observaciones
                </div>

                <div class="text-body1">
                  {{ servicio.observaciones }}
                </div>

              </div>

            </div>


            <!-- CALIFICACIÓN -->

            <div
              v-if="
                servicio.estadoEquipo === 'Entregado'
              "
              class="q-mt-md"
            >

              <div class="text-body1 text-grey-7">
                Calificación del cliente
              </div>

              <div class="row q-gutter-sm">

                <q-btn
                  v-for="estrella in 5"
                  :key="estrella"
                  flat
                  round
                  size="md"
                  :icon="
                    estrellaActiva(
                      estrella,
                      servicio.calificacion
                    )
                      ? 'star'
                      : 'star_border'
                  "
                  color="warning"
                  @click="calificarServicio(servicio, estrella)"
                />

              </div>

            </div>


            <!-- ENTREGADO -->

            <div
              v-if="
                servicio.estadoEquipo === 'Entregado'
              "
              class="delivered-message q-mt-md"
            >

              <q-icon
                name="lock"
                size="20px"
              />

              Este servicio ya fue entregado y no puede modificarse.

            </div>

          </q-card-section>


          <!-- BOTONES -->

          <q-card-actions
            align="right"
            class="q-pa-md"
          >

            <div
              class="row q-gutter-sm"
            >

              <q-btn
                flat
                color="primary"
                icon="edit"
                label="Editar"
                size="md"
                :disable="servicio.estadoEquipo === 'Entregado'"
                @click="editarServicio(servicio)"
              />

              <q-btn
                flat
                color="negative"
                icon="delete"
                label="Eliminar"
                size="md"
                :disable="servicio.estadoEquipo === 'Entregado'"
                @click="eliminarServicio(servicio)"
              />

            </div>


            <q-badge
              v-if="servicio.estadoEquipo === 'Entregado'"
              color="grey"
              icon="lock"
              label="Registro bloqueado"
              class="text-body2"
            />

          </q-card-actions>

        </q-card>

      </div>

    </div>


    <!-- MODAL -->

    <q-dialog
      v-model="mostrarModal"
      persistent
    >

      <q-card class="form-dialog">

        <q-card-section>

          <div class="row items-center justify-between">

            <div>

              <div class="text-h5 text-weight-bold">
                {{
                  editando
                    ? 'Editar servicio'
                    : 'Nuevo servicio'
                }}
              </div>

              <div class="text-body1 text-grey-6">
                Registra la información del equipo
              </div>

            </div>

            <q-btn
              flat
              round
              dense
              icon="close"
              size="lg"
              @click="mostrarModal = false"
            />

          </div>

        </q-card-section>


        <q-card-section>

          <q-form
            @submit="guardarServicio"
            class="q-gutter-lg"
          >

            <!-- CLIENTE -->

            <q-input
              v-model="formulario.cliente"
              label="Nombre del cliente *"
              outlined
              :maxlength="limitesTexto.cliente"
              counter
              lazy-rules
              :rules="[
                val => validarTexto(
                  val,
                  'Escriba el nombre del cliente'
                )
              ]"
            />


            <!-- MARCA -->

            <q-select
              v-model="formulario.marca"
              :options="marcas"
              label="Marca *"
              outlined
              lazy-rules
              @update:model-value="revisarMarca"
              :rules="[
                val =>
                  !!val ||
                  'Seleccione la marca del equipo'
              ]"
            />


            <!-- MARCA PERSONALIZADA -->

            <q-input
              v-if="formulario.marca === 'Otra'"
              v-model="formulario.otraMarca"
              label="Especifique la marca *"
              placeholder="Ej: Vivo, Infinix, OnePlus..."
              outlined
              :maxlength="limitesTexto.marca"
              counter
              lazy-rules
              :rules="[
                val => validarTexto(
                  val,
                  'Escriba la marca del equipo'
                )
              ]"
            />


            <!-- MODELO -->

            <q-input
              v-model="formulario.modelo"
              label="Modelo *"
              placeholder="Ej: iPhone 12, Galaxy A15..."
              outlined
              :maxlength="limitesTexto.modelo"
              counter
              lazy-rules
              :rules="[
                val => validarTexto(
                  val,
                  'Escriba el modelo del equipo'
                )
              ]"
            />


            <!-- REPARACIONES -->

            <q-select
              v-model="formulario.reparacion"
              :options="tiposReparacion"
              label="Tipo de reparación *"
              outlined
              multiple
              use-chips
              lazy-rules
              @update:model-value="revisarReparaciones"
              :rules="[
                val =>
                  val &&
                  val.length > 0 ||
                  'Seleccione al menos un tipo de reparación'
              ]"
            />


            <!-- REPARACIÓN PERSONALIZADA -->

            <q-input
              v-if="
                formulario.reparacion.includes('Otros')
              "
              v-model="formulario.otraReparacion"
              label="Especifique la reparación *"
              placeholder="Ej: Cambio de cámara, reparación de placa..."
              outlined
              :maxlength="limitesTexto.reparacion"
              counter
              lazy-rules
              :rules="[
                val => validarTexto(
                  val,
                  'Escriba cuál es la reparación'
                )
              ]"
            />


            <!-- TÉCNICO -->

            <q-select
              v-model="formulario.tecnico"
              :options="tecnicos"
              label="Técnico que atendió *"
              outlined
              lazy-rules
              :rules="[
                val =>
                  !!val ||
                  'Seleccione el técnico'
              ]"
            />


            <!-- FECHA -->

            <q-input
              v-model="formulario.fecha"
              label="Fecha y hora de recepción"
              outlined
              readonly
              disable
              hint="Se registra automáticamente"
            >

              <template #prepend>

                <q-icon name="event" />

              </template>

            </q-input>


            <!-- PRECIO -->

            <q-input
              v-model.number="formulario.precio"
              type="number"
              label="Precio cobrado *"
              prefix="$"
              outlined
              lazy-rules
              :rules="[
                val =>
                  val !== null &&
                  val !== '' ||
                  'Ingrese el precio',

                val =>
                  Number(val) >= 0 ||
                  'El precio no puede ser negativo'
              ]"
            />


            <!-- MÉTODO DE PAGO -->

            <q-select
              v-model="formulario.metodoPago"
              :options="metodosPago"
              label="Método de pago *"
              outlined
              lazy-rules
              :rules="[
                val =>
                  !!val ||
                  'Seleccione el método de pago'
              ]"
            />


            <!-- ESTADO DEL PAGO -->

            <q-select
              v-model="formulario.estadoPago"
              :options="estadosPago"
              label="Estado del pago *"
              outlined
              lazy-rules
              @update:model-value="revisarEstadoPago"
              :rules="[
                val =>
                  !!val ||
                  'Seleccione el estado del pago'
              ]"
            />


            <!-- ABONO -->

            <q-input
              v-if="
                formulario.estadoPago === 'Abono'
              "
              v-model.number="formulario.abono"
              type="number"
              label="Valor del abono *"
              prefix="$"
              outlined
              lazy-rules
              :rules="[
                val =>
                  val !== null &&
                  val !== '' ||
                  'Ingrese el valor del abono',

                val =>
                  Number(val) > 0 ||
                  'El abono debe ser mayor a $0',

                val =>
                  Number(val) <=
                  Number(formulario.precio) ||
                  'El abono no puede ser igual o mayor al precio'
              ]"
            />


            <!-- ESTADO DEL EQUIPO -->

            <q-select
              v-model="formulario.estadoEquipo"
              :options="obtenerEstadosEquipoDisponibles()"
              label="Estado del equipo *"
              outlined
              lazy-rules
              @update:model-value="revisarEstadoEquipo"
              :rules="[
                val =>
                  !!val ||
                  'Seleccione el estado del equipo'
              ]"
            />


            <!-- OBSERVACIONES -->

            <q-input
              v-model="formulario.observaciones"
              type="textarea"
              label="Observaciones"
              placeholder="Ej: pantalla partida, no prende..."
              outlined
              :maxlength="limitesTexto.observaciones"
              counter
              autogrow
              :rules="[validarTextoOpcional]"
            />


            <!-- BOTONES -->

            <div class="row justify-end q-gutter-sm">

              <q-btn
                flat
                label="Cancelar"
                color="grey-7"
                size="md"
                @click="mostrarModal = false"
              />

              <q-btn
                type="submit"
                color="primary"
                :label="
                  editando
                    ? 'Guardar cambios'
                    : 'Guardar servicio'
                "
                icon="save"
                unelevated
                size="md"
                :disable="
                  editando &&
                  estadoEquipoOriginal === 'Entregado'
                "
              />

            </div>

          </q-form>

        </q-card-section>

      </q-card>

    </q-dialog>

  </div>
</template>


<style scoped>
.app-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 24px;
  font-size: 18px;
}

.main-content {
  max-width: 1000px;
  margin: 0 auto;
}

.app-header {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
  background: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.service-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.service-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.payment-pending {
  border-left: 6px solid #c10015;
}

.payment-abono {
  border-left: 6px solid #f2c037;
}

.service-delivered {
  opacity: 0.9;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.payment-detail {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #fff8e1;
  border-radius: 8px;
  font-size: 17px;
}

.observation-box {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: #f5f5f5;
  border-radius: 10px;
}

.delivered-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #eeeeee;
  border-radius: 8px;
  color: #616161;
  font-size: 16px;
}

.rating-section {
  padding: 16px;
  background: #fff8e1;
  border-radius: 12px;
}

.empty-state {
  margin: 30px auto;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  text-align: center;
}

.form-dialog {
  width: 700px;
  max-width: 95vw;
  border-radius: 16px;
}

@media (max-width: 600px) {
  .app-container {
    padding: 12px;
    font-size: 17px;
  }

  .app-header {
    padding: 18px;
    border-radius: 12px;
  }

  .form-dialog {
    width: 100%;
  }
}
</style>