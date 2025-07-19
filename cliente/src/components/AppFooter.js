import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="#" target="_blank" rel="noopener noreferrer">
          AMERIAN SHOP VIP
        </a>
        <span className="ms-1">&copy; 2024.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a
          href="https://emuller1996.github.io/emuller1996/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Müller Dev
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
