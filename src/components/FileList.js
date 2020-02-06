import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import PropTypes from 'prop-types'
import useKeyPress from '../hooks/useKeyPress.js'

const FileList = ({ files, onFileClick, onSaveEdit, onFileDelete }) => {
  const [ editStatus, setEditStatus ] = useState(false)
  const [ value, setValue ] = useState('')
  const enterPressed = useKeyPress(13)
  const escPressed = useKeyPress(27)
  let node = useRef(null)

  const closeEdit = () => {
    setEditStatus(false)
    setValue('')
  }
  useEffect(() => {
    // const handleInputEvent = (event) => {
    //   const { keyCode } = event 
    //   if (keyCode === 13 && editStatus) {
    //     const editItem = files.find(file => file.id === editStatus)
    //     onSaveEdit(editItem.id, value)
    //     setEditStatus(false)
    //     setValue('')
    //   } else if (keyCode === 27 && editStatus) {
    //     closeEdit(event)
    //   }
    // }
    // document.addEventListener('keyup', handleInputEvent)
    // return () => {
    //   document.removeEventListener('keyup', handleInputEvent)
    // }
    if (enterPressed && editStatus) {
        const editItem = files.find(file => file.id === editStatus)
        onSaveEdit(editItem.id, value)
        setEditStatus(false)
        setValue('')
    }
    if (escPressed && editStatus) {
      closeEdit()
    }
  })
  useEffect(() => {
    if (editStatus) {
      node.current.focus()
    }
  }, [editStatus])
  return (
    <ul className="list-group list-group-flush file-list">
      {
        files.map(file => (
          <li 
            className="list-group-item bg-light d-flex align-items-center file-item row mx-0 px-1"
            key={file.id}
          >
            {
              file.id !== editStatus && 
              <>
                <span className="col-2">
                  <FontAwesomeIcon 
                    icon={faMarkdown}
                    size="lg"
                  />
                </span>
                <span 
                  className="col-6 c-link"
                  onClick={() => { onFileClick(file.id) }}
                >{file.title}</span>
                <button
                  type="button"
                  className="icon-button col-2" 
                  onClick={() => { setEditStatus(file.id); setValue(file.title) }}
                >
                  <FontAwesomeIcon 
                    icon={faEdit} 
                    title="编辑"
                    size="lg"
                  />
                </button>
                <button
                  type="button"
                  className="icon-button col-2" 
                  onClick={() => { onFileDelete(file.id) }}
                >
                  <FontAwesomeIcon 
                    icon={faTrash} 
                    title="删除"
                    size="lg"
                  />
                </button>
              </>
            }
            {
              file.id === editStatus && 
              <>
                <input
                  className="form-control col-10"
                  value={value}
                  onChange={(e) => {setValue(e.target.value)}}
                  ref={node}
                />
                <button
                  type="button"
                  className="icon-button col-2" 
                  onClick={ closeEdit }
                >
                  <FontAwesomeIcon 
                    icon={faTimes} 
                    title="关闭"
                    size="lg"
                  />           
                </button>          
              </>
            }
          </li>
        ))
      }
    </ul>
  )
}

FileList.propTypes = {
  files: PropTypes.array,
  onFileClick: PropTypes.func,
  onFileDelete: PropTypes.func,
  onSaveEdit: PropTypes.func
}

export default FileList