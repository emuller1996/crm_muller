import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { ViewDollar } from '../../../utils'
import { getImageByidService } from '../../../services/images.services'
//import './CardProducto.css'
import { Link } from 'react-router-dom'
import { Card, Placeholder } from 'react-bootstrap'
const CardProductoHolderTest = () => {
  return (
    <div className="col-sm-6 col-md-4">
      <div className="card text-dark h-100 card-products">
        <div className="">
          {/* <img
            className="card-img-top"
            style={{ height: '320px', opacity: '0.2' }}
            src={`https://esmuller.cloud/assets/Logo-LBxHafXJ.png`}
            alt="Title"
          /> */}
          <Placeholder animation="glow">
            <Placeholder
              style={{ height: '350px', width: '100%' }}
              size="10px"
              className="rounded-top"
            />
          </Placeholder>
        </div>

        <div className="card-body mt-2">
          <h4 className="card-title fs-4">
            <Placeholder as={Card.Title} animation="wave">
              <Placeholder xs={12} className="rounded" style={{ height: '30px' }} />
            </Placeholder>
          </h4>
          <Placeholder className="mt-3" as={Card.Text} animation="wave">
            <Placeholder style={{ height: '22px' }} className="rounded" xs={10} />
            <div className="text-center my-3">
              <Placeholder style={{ height: '22px' }} className="rounded" xs={4} />
            </div>
            <div className="d-flex justify-content-between">
              <Placeholder style={{ height: '22px' }} className="rounded" xs={4} />{' '}
              <Placeholder style={{ height: '22px' }} className="rounded" xs={4} />
            </div>
          </Placeholder>
          <div className="text-center">
            {/* <Link to={`/eco/${producto._id}/producto`}>
              <button className="button-ecomerce">
                <i className="fa-solid fa-eye"></i>
              </button>
            </Link> */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardProductoHolderTest
