import { useState, useEffect } from 'react';

const useKeyPress = (targetKeyCode) => {
  const [ keyPressed, setKeyPressed ] = useState(false)
  const keyDownHandle = ({keyCode}) => {
    if (keyCode === targetKeyCode) {
      setKeyPressed(true)
    }
  }
  const keyUpHandle = ({keyCode}) => {
    if (keyCode === targetKeyCode)
    setKeyPressed(false)
  }
  useEffect(() => {
    document.addEventListener('keydown', keyDownHandle)
    document.addEventListener('keyup', keyUpHandle)
    return () => {
      document.removeEventListener('keydown', keyDownHandle)
      document.removeEventListener('keyup', keyUpHandle)
    }
  }, []) 
  return keyPressed
}

export default useKeyPress