import React from 'react'
import './Loader.scss'

const Loader = ({ text = '处理中...' }) => {
  return (
    <div className="bg-loading text-center">
      <div className="spinner-border text-info" role="status">
        <span className="sr-only">{text}</span>
      </div>
      <h5 className="text-info">{text}</h5>
    </div>
  )
}

export default Loader