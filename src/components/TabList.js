import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import './TabList.scss'

const TabList = ({ files, activeId, unSaveIds, onTabClick, onCloseTab }) => {
  return (
    <ul className="nav nav-pills tablist-container">
      {
        files.map(file => {
          const withUnsavedMark = unSaveIds.includes(file.id)
          const finalClassName = classnames({
            'nav-link': true,
            'active': file.id === activeId,
            'withUnsaved': withUnsavedMark
          })
          return (
            <li className="nav-item" key={file.id}>
              <a 
                className={finalClassName}
                href="#"
                onClick={(e) => {e.preventDefault(); onTabClick(file.id)}}
              >
                {file.title}
                <span className="ml-2 close-icon">
                  <FontAwesomeIcon 
                    title="关闭"
                    icon={faTimes}
                    onClick={(e) => {e.stopPropagation(); onCloseTab(file.id)}}
                  />
                </span>
                { withUnsavedMark && <span className="rounded-circle unsaved-icon ml-2"></span> }
              </a>
            </li>
        )})
      }
    </ul>
  )
}

TabList.propTypes = {
  files: PropTypes.array,
  activeId: PropTypes.string,
  unSaveIds: PropTypes.array, 
  onTabClick: PropTypes.func, 
  onCloseTab: PropTypes.func
}

TabList.defaultProps = {
  unSaveIds: []
}

export default TabList