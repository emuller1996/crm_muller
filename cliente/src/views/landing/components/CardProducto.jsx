import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { ViewDollar } from '../../../utils'
import { getImageByidService } from '../../../services/images.services'
import './CardProducto.css'
import { Link } from 'react-router-dom'
const CardProducto = ({ producto }) => {
  CardProducto.propTypes = {
    producto: PropTypes.object,
  }
  const [imagesBase64, setimagesBase64] = useState(null)

  const [isLoading, setisLoading] = useState(true)

  useEffect(() => {
    if (producto.image_id) {
      console.log('SI')
      getImage()
    }
  }, [])
  console.log(producto.image_id)

  let html = ``
  let htmlText = ``
  if (producto?.gender === 'men') {
    html += `<i class="fa-solid fa-mars me-2 fa-xl" style="color: #2a95ff;"></i>`
    htmlText += `Hombre`
  }
  if (producto?.gender === 'women') {
    html += `<i class="fa-solid fa-venus me-2 fa-xl" style="color: #ff2a8b;"></i>`
    htmlText += `Mujer / Dama`
  }
  if (producto?.gender === 'kid') {
    html += `<i class="fa-solid fa-children me-2 fa-xl" style="color:#a869e4;"></i>`
    htmlText += `Niño / Niña`
  }

  const getImage = async () => {
    try {
      setisLoading(true)
      const r = await getImageByidService(producto.image_id)
      console.log(r.data)
      setimagesBase64(r.data.image)
    } catch (error) {
      console.log(error)
    } finally {
      setisLoading(false)
    }
  }

  return (
    <div key={producto._id} className="col-sm-6 col-md-4">
      <div className="card text-dark h-100 card-product">
        {producto.image_id && !isLoading && (
          <img
            className="card-img-top"
            style={{ height: '350px' }}
            src={`${imagesBase64}`}
            alt="Title"
          />
        )}
        {!producto.image_id && (
          <div className="p-2">
            <img
              className="card-img-top"
              style={{ height: '320px', opacity: '0.2' }}
              src={`https://esmuller.cloud/assets/Logo-LBxHafXJ.png`}
              alt="Title"
            />
          </div>
        )}
        <div className="card-body mt-2">
          <h4 className="card-title fs-4">{producto?.name}</h4>
          <p className="card-text m-0 fs-5 fw-semibold">{ViewDollar(producto?.price)}</p>
          <p className="card-text text-center  m-0 text-muted">{producto?.categoria?.name}</p>
          <div className="d-flex justify-content-between">
            <span className="card-text text-muted">{htmlText}</span>
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>
          <div className="text-center">
            <Link to={`/eco/${producto._id}/producto`}>
              <button className="button-ecomerce">
                <i className="fa-solid fa-eye"></i>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardProducto
