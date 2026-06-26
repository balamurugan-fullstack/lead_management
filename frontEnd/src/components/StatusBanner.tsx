type StatusBannerProps = {
  type: 'success' | 'error';
  message: string;
  onDismiss?: () => void;
};

const StatusBanner = ({ type, message, onDismiss }: StatusBannerProps) => {
  const baseClass = type === 'success'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border-rose-200 bg-rose-50 text-rose-700';

  return (
    <div className={`flex items-start justify-between rounded-lg border px-4 py-3 text-sm ${baseClass}`} role="status">
      <span>{message}</span>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="ml-3 font-semibold hover:opacity-80 cursor-pointer">
          ×
        </button>
      )}
    </div>
  );
};

export default StatusBanner;
