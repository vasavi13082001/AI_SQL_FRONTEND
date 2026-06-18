import { Toaster } from 'react-hot-toast'

const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        className: 'text-sm',
      }}
    />
  )
}

export default ToastProvider
