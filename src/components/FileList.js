import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import PropTypes from 'prop-types'
import useKeyPress from '../hooks/useKeyPress.js'
import useContextMenu from '../hooks/useContextMenu.js'
import { getParentNode } from '../utils/helper.js'


const FileList = ({ files, onFileClick, onSaveEdit, onFileDelete }) => {
  const [ editStatus, setEditStatus ] = useState(false)
  const [ value, setValue ] = useState('')
  const enterPressed = useKeyPress(13)
  const escPressed = useKeyPress(27)
  let node = useRef(null)

  const closeEdit = (editItem) => {
    setEditStatus(false)
    setValue('')
    //如果关闭的是新创建的file，需要删除这个元素
    if (editItem.isNew) {
      onFileDelete(editItem.id)
    }
  }
  //添加上下文菜单
 const clickedItem = useContextMenu([
    {
      label: '打开',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if (parentElement) {
          onFileClick(parentElement.dataset.id)
        }
      }
    },
    {
      label: '删除',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if (parentElement) {
          onFileDelete(parentElement.dataset.id)
        }
      }
    },
    {
      label: '重命名',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if (parentElement) {
          setEditStatus(parentElement.dataset.id);
          setValue(parentElement.dataset.title)
        }
      }
    }
  ], '.file-list', [files])

  useEffect(() => {
    const editItem = files.find(file => file.id === editStatus)
    if (enterPressed && editStatus && value.trim() !== '') {
        onSaveEdit(editItem.id, value, editItem.isNew)
        setEditStatus(false)
        setValue('')
    }
    if (escPressed && editStatus) {
      closeEdit(editItem)
    }
  })

  //新建文件改变编辑状态和值
  useEffect(() => {
    const newFile = files.find(file => file.isNew)
    if (newFile) {
      setEditStatus(newFile.id)
      setValue(newFile.title)
    } 
  }, [files])

  //editAutofocus
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
            data-id={file.id}
            data-title={file.title}
          >
            {
              ((file.id !== editStatus) && !file.isNew) && 
              <>
                <span className="col-2">
                  <FontAwesomeIcon 
                    icon={faMarkdown}
                    size="lg"
                  />
                </span>
                <span 
                  className="col-10 c-link"
                  onClick={() => { onFileClick(file.id) }}
                >{file.title}</span>

              </>
            }
            {
              ((file.id === editStatus) || file.isNew) && 
              <>
                <input
                  className="form-control col-10"
                  value={value}
                  onChange={(e) => {setValue(e.target.value)}}
                  ref={node}
                  placeholder="请输入文件名称"
                />
                <button
                  type="button"
                  className="icon-button col-2" 
                  onClick={ () => {closeEdit(file)}}
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