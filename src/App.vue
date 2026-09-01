<script setup>
import { ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { Dialog } from 'quasar'

const servicios = useLocalStorage('servicios-tecnicos', [])

const mostrarModal = ref(false)
const editando = ref(false)
const idEditando = ref(null)

const formulario = ref({
  cliente: '',
  equipo: '',
  reparacion: '',
  tecnico: '',
  fecha: '',
  precio: null,
  metodoPago: '',
  estadoPago: '',
  estadoEquipo: '',
  calificacion: null,
  observaciones: ''
})

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

function limpiarFormulario() {
  formulario.value = {
    cliente: '',
    equipo: '',
    reparacion: '',
    tecnico: '',
    fecha: '',
    precio: null,
    metodoPago: '',
    estadoPago: '',
    estadoEquipo: '',
    calificacion: null,
    observaciones: ''
  }
}

function abrirNuevoServicio() {
  limpiarFormulario()
  editando.value = false
  idEditando.value = null
  mostrarModal.value = true
}

function guardarServicio() {
  if (editando.value === true) {
    const indice = servicios.value.findIndex(
      servicio => servicio.id === idEditando.value
    )

    if (indice !== -1) {
      servicios.value[indice] = {
        id: idEditando.value,
        cliente: formulario.value.cliente,
        equipo: formulario.value.equipo,
        reparacion: formulario.value.reparacion,
        tecnico: formulario.value.tecnico,
        fecha: formulario.value.fecha,
        precio: formulario.value.precio,
        metodoPago: formulario.value.metodoPago,
        estadoPago: formulario.value.estadoPago,
        estadoEquipo: formulario.value.estadoEquipo,
        calificacion: formulario.value.calificacion,
        observaciones: formulario.value.observaciones
      }
    }
  } else {
    const nuevoServicio = {
      id: Date.now(),
      cliente: formulario.value.cliente,
      equipo: formulario.value.equipo,
      reparacion: formulario.value.reparacion,
      tecnico: formulario.value.tecnico,
      fecha: formulario.value.fecha,
      precio: formulario.value.precio,
      metodoPago: formulario.value.metodoPago,
      estadoPago: formulario.value.estadoPago,
      estadoEquipo: formulario.value.estadoEquipo,
      calificacion: formulario.value.calificacion,
      observaciones: formulario.value.observaciones
    }

    servicios.value.push(nuevoServicio)
  }

  mostrarModal.value = false
  limpiarFormulario()
  editando.value = false
  idEditando.value = null
}

function editarServicio(servicio) {
  formulario.value = {
    cliente: servicio.cliente,
    equipo: servicio.equipo,
    reparacion: servicio.reparacion,
    tecnico: servicio.tecnico,
    fecha: servicio.fecha,
    precio: servicio.precio,
    metodoPago: servicio.metodoPago,
    estadoPago: servicio.estadoPago,
    estadoEquipo: servicio.estadoEquipo,
    calificacion: servicio.calificacion,
    observaciones: servicio.observaciones
  }

  idEditando.value = servicio.id
  editando.value = true
  mostrarModal.value = true
}

function eliminarServicio(id) {
  Dialog.create({
    title: 'Eliminar servicio',
    message: '¿Está seguro de que desea eliminar este servicio?',
    cancel: true,
    persistent: true,
    ok: {
      label: 'Eliminar',
      color: 'negative'
    },
    cancel: {
      label: 'Cancelar'
    }
  }).onOk(() => {
    servicios.value = servicios.value.filter(
      servicio => servicio.id !== id
    )
  })
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
  if (precio === null || precio === '') {
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
</script>

<template>
  <div class="app-container">

    <header class="app-header">
      <div>
        <div class="text-h4 text-weight-bold">
          TecnoFix
        </div>

        <div class="text-subtitle2 text-grey-7">
          Servicio técnico de celulares y tablets
        </div>
      </div>

      <q-icon
        name="phone_android"
        size="42px"
        color="primary"
      />
    </header>

    <div class="q-mt-lg">
      <q-btn
        color="primary"
        icon="add"
        label="Nuevo servicio"
        unelevated
        class="full-width"
        @click="abrirNuevoServicio"
      />
    </div>

    <div class="row items-center justify-between q-mt-xl q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold">
          Servicios registrados
        </div>

        <div class="text-caption text-grey-7">
          Equipos actualmente registrados en el taller
        </div>
      </div>

      <q-badge
        color="primary"
        :label="servicios.length"
      />
    </div>

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

      <div class="text-body2 text-grey-6 q-mt-sm">
        Comienza registrando el primer equipo del taller.
      </div>
    </div>

    <div
      v-for="servicio in servicios"
      :key="servicio.id"
      class="q-mb-md"
    >
      <q-card
        bordered
        class="service-card"
        :class="{
          'payment-pending': servicio.estadoPago === 'Pendiente',
          'payment-abono': servicio.estadoPago === 'Abono'
        }"
      >

        <q-card-section>

          <div class="row items-start justify-between">

            <div class="row items-center">

              <q-avatar
                color="primary"
                text-color="white"
                icon="smartphone"
              />

              <div class="q-ml-md">

                <div class="text-h6 text-weight-bold">
                  {{ servicio.equipo }}
                </div>

                <div class="text-body2 text-grey-7">
                  {{ servicio.cliente }}
                </div>

              </div>

            </div>

            <q-badge
              :color="obtenerColorPago(servicio.estadoPago)"
              :label="servicio.estadoPago"
            />

          </div>

        </q-card-section>

        <q-card-section class="q-pt-none">

          <div class="row q-col-gutter-md">

            <div class="col-12 col-sm-6">
              <div class="info-item">

                <q-icon
                  name="build"
                  size="20px"
                  color="primary"
                />

                <div>

                  <div class="text-caption text-grey-6">
                    Reparación
                  </div>

                  <div class="text-body1">
                    {{ servicio.reparacion }}
                  </div>

                </div>

              </div>
            </div>

            <div class="col-12 col-sm-6">
              <div class="info-item">

                <q-icon
                  name="person"
                  size="20px"
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

          </div>

          <div class="row q-col-gutter-md q-mt-md">

            <div class="col-12 col-sm-6">
              <div class="info-item">

                <q-icon
                  name="schedule"
                  size="20px"
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

            <div class="col-12 col-sm-6">
              <div class="info-item">

                <q-icon
                  name="payments"
                  size="20px"
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

          </div>

          <div class="q-mt-lg">

            <q-chip
              :color="obtenerColorEstado(servicio.estadoEquipo)"
              text-color="white"
              :icon="obtenerIconoEstado(servicio.estadoEquipo)"
              :label="servicio.estadoEquipo"
            />

          </div>

          <div class="q-mt-sm text-body2">

            <span class="text-grey-7">
              Método de pago:
            </span>

            {{ servicio.metodoPago }}

          </div>

          <div
            v-if="servicio.observaciones"
            class="observation-box q-mt-md"
          >

            <q-icon
              name="notes"
              size="20px"
            />

            <div>

              <div class="text-caption text-grey-6">
                Observaciones
              </div>

              <div class="text-body2">
                {{ servicio.observaciones }}
              </div>

            </div>

          </div>

          <div
            v-if="servicio.calificacion"
            class="q-mt-md"
          >

            <div class="text-caption text-grey-6">
              Calificación del cliente
            </div>

            <div>

              <q-icon
                v-for="estrella in 5"
                :key="estrella"
                name="star"
                size="22px"
                :color="estrellaActiva(estrella, servicio.calificacion) ? 'warning' : 'grey-4'"
              />

            </div>

          </div>

        </q-card-section>

        <q-card-actions align="right">

          <q-btn
            flat
            color="primary"
            icon="edit"
            label="Editar"
            @click="editarServicio(servicio)"
          />

          <q-btn
            flat
            color="negative"
            icon="delete"
            label="Eliminar"
            @click="eliminarServicio(servicio.id)"
          />

        </q-card-actions>

      </q-card>
    </div>

    <q-dialog v-model="mostrarModal">

      <q-card class="form-dialog">

        <q-card-section>

          <div class="row items-center justify-between">

            <div>

              <div class="text-h6 text-weight-bold">
                {{ editando ? 'Editar servicio' : 'Nuevo servicio' }}
              </div>

              <div class="text-caption text-grey-6">
                Registra la información del equipo
              </div>

            </div>

            <q-btn
              flat
              round
              dense
              icon="close"
              @click="mostrarModal = false"
            />

          </div>

        </q-card-section>

        <q-card-section>

          <q-form
            @submit="guardarServicio"
            class="q-gutter-md"
          >

            <q-input
              v-model="formulario.cliente"
              label="Nombre del cliente"
              outlined
              :rules="[
                val => !!val || 'El nombre del cliente es obligatorio'
              ]"
            />

            <q-input
              v-model="formulario.equipo"
              label="Marca y modelo"
              placeholder="Ej: iPhone 12, Samsung A15"
              outlined
              :rules="[
                val => !!val || 'La marca y modelo son obligatorios'
              ]"
            />

            <q-select
              v-model="formulario.reparacion"
              :options="tiposReparacion"
              label="Tipo de reparación"
              outlined
              :rules="[
                val => !!val || 'Seleccione el tipo de reparación'
              ]"
            />

            <q-select
              v-model="formulario.tecnico"
              :options="tecnicos"
              label="Técnico que atendió"
              outlined
              :rules="[
                val => !!val || 'Seleccione el técnico'
              ]"
            />

            <q-input
              v-model="formulario.fecha"
              type="datetime-local"
              label="Fecha y hora de recepción"
              outlined
              :rules="[
                val => !!val || 'Ingrese la fecha y hora'
              ]"
            />

            <q-input
              v-model.number="formulario.precio"
              type="number"
              label="Precio cobrado"
              prefix="$"
              outlined
              :rules="[
                val => val !== null && val !== '' || 'Ingrese el precio',
                val => Number(val) >= 0 || 'El precio no puede ser negativo'
              ]"
            />

            <q-select
              v-model="formulario.metodoPago"
              :options="metodosPago"
              label="Método de pago"
              outlined
              :rules="[
                val => !!val || 'Seleccione el método de pago'
              ]"
            />

            <q-select
              v-model="formulario.estadoPago"
              :options="estadosPago"
              label="Estado del pago"
              outlined
              :rules="[
                val => !!val || 'Seleccione el estado del pago'
              ]"
            />

            <q-select
              v-model="formulario.estadoEquipo"
              :options="estadosEquipo"
              label="Estado del equipo"
              outlined
              :rules="[
                val => !!val || 'Seleccione el estado del equipo'
              ]"
            />

            <div v-if="formulario.estadoEquipo === 'Entregado'">

              <div class="text-subtitle2">
                Calificación del cliente
              </div>

              <div class="row q-mt-sm">

                <q-btn
                  v-for="estrella in 5"
                  :key="estrella"
                  flat
                  round
                  :icon="estrellaActiva(estrella, formulario.calificacion) ? 'star' : 'star_border'"
                  color="warning"
                  @click="formulario.calificacion = estrella"
                />

              </div>

            </div>

            <q-input
              v-model="formulario.observaciones"
              type="textarea"
              label="Observaciones"
              placeholder="Ej: pantalla partida, no prende..."
              outlined
              autogrow
            />

            <div class="row justify-end q-gutter-sm">

              <q-btn
                flat
                label="Cancelar"
                color="grey-7"
                @click="mostrarModal = false"
              />

              <q-btn
                type="submit"
                color="primary"
                :label="editando ? 'Guardar cambios' : 'Guardar servicio'"
                icon="save"
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
  padding: 20px;
}

.app-header {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
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
  border-left: 5px solid #C10015;
}

.payment-abono {
  border-left: 5px solid #F2C037;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.observation-box {
  display: flex;
  gap: 10px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 10px;
}

.empty-state {
  max-width: 1000px;
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
    padding: 10px;
  }

  .app-header {
    padding: 16px;
    border-radius: 12px;
  }

  .form-dialog {
    width: 100%;
  }

}

</style>