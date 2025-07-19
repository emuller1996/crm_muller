/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import PropTypes from 'prop-types'
import L from 'leaflet'
import { usePuntoVenta } from '../../../../hooks/usePuntoVenta'

// Definir el icono personalizado
const customIcon = new L.Icon({
  iconUrl: 'https://www.esmuller.cloud/assets/Logo-LBxHafXJ.png', // Cambia esto por la ruta de tu imagen
  iconSize: [42, 42], // Tamaño del icono
  iconAnchor: [16, 32], // Punto de anclaje
  popupAnchor: [0, -32], // Punto de anclaje del popup
})

export default function PuntosVentasPages({}) {
  const { getAllPuntoVenta, data: ListPuntoVenta, loading, abortController } = usePuntoVenta()

  useEffect(() => {
    getAllPuntoVenta()

    return () => {
      console.log('test')
      console.log(abortController)
      abortController.abort()
    }
  }, [])

  function LocationPicker({ setCoordinates }) {
    LocationPicker.propTypes = {
      setCoordinates: PropTypes.func,
    }
    useMapEvents({
      click(e) {
        //setCoordinates(e.latlng) // Obtiene las coordenadas donde el usuario haga clic
      },
    })

    return null
  }
  return (
    <div>
      <div className="container mt-5">
        <h4 className="text-center ">Puntos Venta</h4>
        <p className="text-center fs-5">¡Conoce nuestros locales en Buenaventura!</p>
        <p
          className="text-center texte-muted  mb-4"
          style={{ textWrap: 'pretty', width: '75%', margin: 'auto', color: '#6d70a3' }}
        >
          Visita nuestros puntos de venta y vive la auténtica experiencia AMERICAN SHOP. 📍 En el
          corazón del Valle del Cauca, te esperamos con los brazos abiertos.
        </p>

        {ListPuntoVenta &&
          ListPuntoVenta.map((punto) => (
            <div key={punto._id} className="card  mb-3" style={{ border: '1px solid #a4b6f1' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between ">
                  <span className="fs-5">{punto?.name}</span>
                  <div>
                    <span className="badge bg-info fs-6 text-uppercase">
                      {punto?.type_sales_point}
                    </span>
                  </div>
                </div>
                <div className="row align-items-center">
                  <div className="col-md-4 col-12">
                    {
                      punto?.base64Image && (
                        <div className=' mb-3 d-flex justify-content-center'>
                          <img src={punto?.base64Image} className='img-fluid rounded overflow-hidden' style={{height:"150px"}} alt="" />
                        </div>
                      )
                    }
                  </div>

                  <div className="col-md-4 col-12">
                    <div className=" d-flex justify-content-start align-items-center">
                      <i className="fa-solid fa-map-location-dot fa-2x"></i>
                      <div>
                        <span className="ms-3 d-block">{punto?.name}</span>
                        <span className="ms-3 d-block">{punto?.city}</span>
                        <span className="ms-3 d-block">{punto?.address}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 col-12">
                    <div className=" d-flex justify-content-start align-items-center">
                      <div>
                        <p style={{ whiteSpace: 'pre' }}>{punto?.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {punto.coordinates && (
                  <>
                    <div
                      className="overflow-hidden rounded"
                      style={{ height: '300px', width: '100%' }}
                    >
                      <MapContainer
                        center={[punto.coordinates.lat, punto.coordinates.lng]}
                        zoom={15}
                        zoomControl={false}
                        touchZoom={false}
                        maxZoom={15}
                        minZoom={15}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {punto.coordinates && (
                          <Marker
                            icon={customIcon}
                            position={[punto.coordinates.lat, punto.coordinates.lng]}
                          >
                            <Popup>
                              {punto?.name}, {punto?.address}
                            </Popup>
                          </Marker>
                        )}
                        <LocationPicker /* setCoordinates={setCoordinates} */ />
                      </MapContainer>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
