import React, { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'
import FormStock from './components/FormStock'
import { useProductos } from '../../../hooks/useProductos'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'

const TallasPage = ({ idProduct }) => {
  TallasPage.propTypes = {
    idProduct: PropTypes.string,
  }
  const [draw, setDraw] = useState(0)
  const [StockSelected, setStockSelected] = useState(null)
  const {
    getStockByProductId,
    StockProduct,
    getProductById,
    dataDetalle,
    getStocLogsByProductId,
    StockProductLogs,
  } = useProductos()
  const [isLoading, setisLoading] = useState(true)
  //const { idProduct } = useParams()

  useEffect(() => {
    if (idProduct) {
      getAllDataProductStock(idProduct)
    }
  }, [idProduct, draw])

  const getAllDataProductStock = async (id) => {
    try {
      setisLoading(true)
      await getStockByProductId(id)
      await getProductById(id)
      await getStocLogsByProductId(id)
    } catch (error) {
      console.log(error)
    } finally {
      setisLoading(false)
    }
  }

  return (
    <div className="mb-4">
      {isLoading && (
        <div className="d-flex justify-content-center my-5">
          <div
            className="spinner-border text-primary"
            style={{ width: '3em', height: '3em' }}
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      {!isLoading && (
        <div>
          <div className={`card card-body `}>
            <span className="text-center">Gestion de tallas</span>
            {dataDetalle && (
              <div className={`card card-body `}>
                <div className="d-flex justify-content-between align-items-center">
                  <span>{dataDetalle?.name}</span>
                  <div>
                    <img
                      src={dataDetalle?.imageBase64}
                      className="rounded-circle"
                      alt="NO_IMAGEN"
                      style={{ width: '50px', height: '50px' }}
                    />
                  </div>
                </div>
              </div>
            )}
            <hr />
            <div className="row  mt-3">
              <div className="col-md-5">
                {StockSelected ? (
                  <FormStock
                    idProduct={idProduct}
                    StockProduct={StockSelected}
                    allStock={() => {
                      setDraw((status) => ++status)
                    }}
                    cancel={() => {
                      setStockSelected(null)
                    }}
                  />
                ) : (
                  <FormStock
                    idProduct={idProduct}
                    allStock={() => {
                      setDraw((status) => ++status)
                    }}
                    cancel={() => {
                      setStockSelected(null)
                    }}
                  />
                )}
              </div>
              <div className="col-md-7">
                {StockProduct &&
                  StockProduct.map((stock) => (
                    <div key={stock._id} className="card border mb-3">
                      <div className="card-body">
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="card-text">Talla : {stock.size}</span>
                          <span className="card-text">Stock : {stock.stock}</span>
                          <button
                            type="button"
                            onClick={() => {
                              console.log(stock)
                              setStockSelected(stock)
                            }}
                            className="btn btn-primary"
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className={`card card-body mt-4`}>
            <span className="text-center">Registro de Stock del Producto</span>
            <hr />
            <div className="table-responsive">
              <table className="table ">
                <thead>
                  <tr>
                    <th scope="col">Fecha</th>
                    <th scope="col">Talla</th>
                    <th scope="col">Cantidad</th>
                    <th scope="col">Descripcion</th>
                    <th scope="col">Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {StockProductLogs &&
                    StockProductLogs.map((log) => (
                      <tr className="" key={log._id}>
                        <td scope="row">{new Date(log.createdTime).toLocaleDateString()}</td>
                        <td>{log.size}</td>
                        <td>{log.cantidad}</td>
                        <td>{log.descripcion}</td>
                        <td>{log.user}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TallasPage
