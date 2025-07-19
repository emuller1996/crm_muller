import React, { useEffect, useState } from 'react'
import { CContainer } from '@coreui/react'
import { Button, Modal } from 'react-bootstrap'
import DataTable from 'react-data-table-component'
import { paginationComponentOptions } from '../../utils/optionsConfig'
import FormCategoria from './components/FormCategoria'
import { useCategorias } from '../../hooks/useCategorias'

const CategoriasPage = () => {
  const [show, setShow] = useState(false)

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const [CategoriaSelec, setCategoriaSelec] = useState(null)

  const { getAllCategorias, data: ListCategorias } = useCategorias()

  useEffect(() => {
    getAllCategorias()
  }, [])

  return (
    <div className="">
      <CContainer fluid>
        <Button
          variant="primary"
          onClick={() => {
            handleShow()
            setCategoriaSelec(null)
          }}
        >
          Crear Categorias
        </Button>
        <div className="row g-3 my-3">
          {ListCategorias &&
            ListCategorias.map((cate) => (
              <div key={cate._id} className="col-md-3">
                <div className="card">
                  <div className="card-body d-flex align-items-center justify-content-between">
                    <span>{cate?.name}</span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setCategoriaSelec(cate)
                        handleShow()
                        console.log('Primary')
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
        </div>
        <Modal backdrop={'static'} size="md" centered show={show} onHide={handleClose}>
          <Modal.Body>
            <FormCategoria
              getAllCategorias={getAllCategorias}
              categoria={CategoriaSelec}
              onHide={handleClose}
            />
          </Modal.Body>
        </Modal>
      </CContainer>
    </div>
  )
}

export default CategoriasPage
