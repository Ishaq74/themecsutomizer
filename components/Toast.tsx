import React from 'react';
import { CheckCircleIcon, XCircleIcon } from './Icons';

// Toast component for portal
export const Toast = ({ message, status, onDismiss }: { message: string, status: 'success' | 'danger', onDismiss: () => void }) => {
  React.useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);
  
  return (
    <div className="toast" data-status={status}>
      {status === 'success' ? <CheckCircleIcon/> : <XCircleIcon/>}
      <span>{message}</span>
    </div>
  )
};