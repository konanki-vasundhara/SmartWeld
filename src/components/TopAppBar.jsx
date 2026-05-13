import { useNavigate } from 'react-router-dom';
import useCurrentLocation from '../hooks/useCurrentLocation';

export default function TopAppBar({ 
  title = "Smart Weld", 
  showBack = false, 
  backUrl = "/dashboard", 
  leftElement,
  rightElement 
}) {
  const navigate = useNavigate();
  const { locationName, loading } = useCurrentLocation();

  const handleBack = () => {
    if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 w-full z-40 bg-surface dark:bg-on-surface border-b border-outline-variant dark:border-outline shadow-sm sticky top-0">
      <div className="flex items-center gap-2">
        {showBack ? (
          <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface">
            <span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
          </button>
        ) : leftElement ? (
          leftElement
        ) : (
          <span className="material-symbols-outlined text-primary" data-icon="location_on">location_on</span>
        )}
        
        {(!showBack && !leftElement) && (
          <span className="font-body-sm font-bold text-on-surface-variant mr-2 hidden md:inline">
            {loading ? 'Detecting location...' : locationName || 'Location unavailable'}
          </span>
        )}

        <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-primary dark:text-primary-fixed">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-sm">
        {rightElement || (
          <button className="p-2 hover:bg-surface-container-high dark:hover:bg-inverse-surface rounded-full transition-colors">
            <span className="material-symbols-outlined text-primary" data-icon="notifications">notifications</span>
          </button>
        )}
      </div>
    </header>
  );
}
