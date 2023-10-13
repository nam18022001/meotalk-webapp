import { toast } from 'react-toastify';

const toastError = (message: string) => {
  toast.error(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'light',
    style: {
      fontSize: '14px',
      fontWeight: 'bold',
    },
  });
};
const toastSuccess = (message: string) => {
  toast.success(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'light',
    style: {
      fontSize: '14px',
      fontWeight: 'bold',
    },
  });
};
const toastWarning = (message: string) => {
  toast.warning(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'light',
    style: {
      fontSize: '14px',
      fontWeight: 'bold',
    },
  });
};

export { toastError, toastSuccess, toastWarning };
