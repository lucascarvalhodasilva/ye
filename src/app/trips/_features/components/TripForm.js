import React, { useEffect, useRef, useState } from 'react';
import NumberInput from '@/components/NumberInput';
import CustomDatePicker from '@/components/CustomDatePicker';
import CustomTimePicker from '@/components/CustomTimePicker';
import { CameraSource } from '@capacitor/camera';

/**
 * @typedef {Object} CommuteMode
 * @property {boolean} active - Whether this mode is active
 * @property {number} [distance] - Distance in km (for car, motorcycle, bike)
 * @property {string} [cost] - Cost in euros (for public transport)
 */

/**
 * @typedef {Object} TripFormData
 * @property {string} date - Start date
 * @property {string} endDate - End date
 * @property {string} startTime - Departure time
 * @property {string} endTime - Return time
 * @property {Object.<string, CommuteMode>} commute - Commute modes configuration
 */

/**
 * @typedef {Object} TripFormProps
 * @property {TripFormData} formData - Current form data
 * @property {Function} setFormData - Function to update form data
 * @property {Function} handleSubmit - Form submission handler
 * @property {string} [submitError] - Error message to display
 * @property {string|number|null} editingId - ID of entry being edited, or null for new entry
 * @property {Function} cancelEdit - Function to cancel editing
 * @property {boolean} hasChanges - Whether form has unsaved changes
 * @property {string} [tempPublicTransportReceipt] - Base64 receipt image
 * @property {boolean} showPublicTransportCameraOptions - Whether to show camera options modal
 * @property {Function} setShowPublicTransportCameraOptions - Toggle camera options modal
 * @property {Function} takePublicTransportPicture - Function to capture receipt photo
 * @property {Function} removePublicTransportReceipt - Function to remove receipt
 */

/**
 * Form component for creating and editing trip entries.
 * Handles date/time selection, transport mode configuration, and receipt uploads.
 * 
 * @param {TripFormProps} props - Component props
 * @returns {JSX.Element} The rendered trip form
 */
export default function TripForm({ 
  formData, 
  setFormData, 
  handleSubmit, 
  submitError,
  editingId,
  cancelEdit,
  hasChanges,
  tempPublicTransportReceipt,
  showPublicTransportCameraOptions,
  setShowPublicTransportCameraOptions,
  takePublicTransportPicture,
  removePublicTransportReceipt
}) {
  const formRef = useRef(null);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (editingId) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [editingId]);

  const transportModes = [
    { key: 'car', label: 'Auto', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.4,36.1s-.19,1.51,0,2.23c.13.5.26,1.34.78,1.34h2.9c.52,0,.65-.84.78-1.34.19-.72,0-2.23,0-2.23" />
        <rect x="4.5" y="21.66" width="39" height="14.49" rx="4.46" ry="4.46" />
        <path d="M35.14,36.1s-.19,1.51,0,2.23c.13.5.26,1.34.78,1.34h2.9c.52,0,.65-.84.78-1.34.19-.72,0-2.23,0-2.23" />
        <circle cx="10.63" cy="29.46" r="2.23" />
        <path d="M8.96,21.66l2.56-10.03c.44-1.71,2.35-3.34,4.12-3.34h16.71c1.77,0,3.69,1.63,4.12,3.34l2.56,10.03" />
        <circle cx="37.37" cy="29.46" r="2.23" />
      </svg>
    )},
    { key: 'motorcycle', label: 'Motorrad', icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 470 470">
        <path d="m289.602,334.317c4.143,0 7.5-3.357 7.5-7.5v-28.28c0-34.909-28.4-63.31-63.309-63.31-34.909,0-63.31,28.4-63.31,63.31v28.28c0,4.143 3.357,7.5 7.5,7.5h12.501v92.374c0,23.881 19.428,43.309 43.309,43.309s43.309-19.428 43.309-43.309v-69.874c0-4.143-3.357-7.5-7.5-7.5s-7.5,3.357-7.5,7.5v69.874c0,15.609-12.699,28.309-28.309,28.309s-28.309-12.699-28.309-28.309v-92.374h84.118zm-104.119-15v-20.78c0-26.638 21.672-48.31 48.31-48.31s48.309,21.672 48.309,48.31v20.78h-96.619z"/>
        <path d="m279.913,74.912c0-24.765-20.147-44.912-44.913-44.912s-44.913,20.147-44.913,44.912c0,24.766 20.147,44.913 44.913,44.913s44.913-20.147 44.913-44.913zm-44.913,29.913c-16.494,0-29.913-13.419-29.913-29.913 0-16.493 13.419-29.912 29.913-29.912s29.913,13.419 29.913,29.912c0,16.494-13.419,29.913-29.913,29.913z"/>
        <path d="m387.494,67.412h-32.5v-1.735c0-10.373-8.438-18.812-18.812-18.812h-31.705c-11.358-28.25-38.619-46.865-69.477-46.865s-58.119,18.615-69.478,46.865h-31.705c-10.373,0-18.812,8.438-18.812,18.812v1.735h-32.5c-4.143,0-7.5,3.357-7.5,7.5s3.357,7.5 7.5,7.5h32.5v1.736c0,10.373 8.438,18.812 18.812,18.812h31.712c1.219,3.015 2.636,5.927 4.221,8.73-33.963,22.036-54.745,59.912-54.745,100.719v127.665c0,30.372 21.732,56.253 51.675,61.537 0.441,0.078 0.88,0.115 1.313,0.115 3.57,0 6.735-2.56 7.377-6.197 0.72-4.079-2.003-7.97-6.082-8.689-22.762-4.018-39.282-23.686-39.282-46.766v-127.665c0-35.904 18.393-69.213 48.407-88.45 10.295,11.853 24.224,20.42 39.924,23.99 4.047,0.917 8.059-1.612 8.977-5.65 0.918-4.039-1.611-8.058-5.65-8.977-13.814-3.141-25.907-11.126-34.307-22.122-0.113-0.278-0.239-0.554-0.388-0.823-0.442-0.795-1.012-1.471-1.664-2.031-3.128-4.633-5.633-9.727-7.374-15.171-0.993-3.107-3.882-5.216-7.144-5.216h-36.97c-2.102,0-3.812-1.71-3.812-3.812v-18.47c0-2.102 1.71-3.812 3.812-3.812h36.97c3.262,0 6.15-2.108 7.144-5.216 7.965-24.912 30.9-41.649 57.069-41.649s49.104,16.737 57.069,41.649c0.993,3.107 3.882,5.216 7.144,5.216h36.97c2.102,0 3.812,1.71 3.812,3.812v18.472c0,2.102-1.71,3.812-3.812,3.812h-36.97c-3.262,0-6.15,2.108-7.144,5.216-6.425,20.091-23.182,35.474-43.732,40.146-4.039,0.919-6.568,4.938-5.65,8.977 0.791,3.479 3.883,5.839 7.307,5.839 0.551,0 1.11-0.062 1.67-0.188 15.699-3.569 29.627-12.135 39.922-23.987 30.01,19.236 48.409,52.561 48.409,88.447v127.665c0,23.764-17.782,44.005-41.363,47.085-4.107,0.536-7.003,4.301-6.466,8.407 0.493,3.778 3.717,6.53 7.427,6.53 0.324,0 0.651-0.021 0.98-0.064 31.025-4.051 54.422-30.688 54.422-61.958v-127.667c0-40.785-20.789-78.681-54.746-100.717 1.586-2.803 3.002-5.716 4.222-8.732h31.712c10.373,0 18.812-8.438 18.812-18.812v-1.736h32.5c4.143,0 7.5-3.357 7.5-7.5s-3.358-7.5-7.501-7.5z"/>
        <path d="m251.926,222.096c4.143,0 7.5-3.357 7.5-7.5s-3.357-7.5-7.5-7.5h-36.266c-4.143,0-7.5,3.357-7.5,7.5s3.357,7.5 7.5,7.5h36.266z"/>
      </svg>
    )},
    { key: 'bike', label: 'Fahrrad', icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="5.5" cy="17.5" r="3.5" />
        <circle cx="18.5" cy="17.5" r="3.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 6a1 1 0 100-2 1 1 0 000 2zm-3 11.5V14l-3-3 4-3 2 3h3" />
      </svg>
    )},
    { key: 'public_transport', label: 'Andere', icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 472.355 472.355">
        <path d="m405.969,459.552l-30-29.999c-0.001-0.001-23.69-23.69-23.69-23.69 21.389-8.459 37.244-28.988 38.422-52.923l11.887-235.2c1.61-31.295-9.176-60.82-30.372-83.135-21.196-22.315-50.128-34.605-81.465-34.605h-108.975c-31.334,0-60.283,12.289-81.513,34.602-21.23,22.314-32.064,51.838-30.506,83.142l11.932,235.214c1.243,23.884 17.09,44.374 38.433,52.859l-23.735,23.734c-0.001,0.001-30.001,30.001-30.001,30.001-2.145,2.145-2.786,5.371-1.625,8.173 1.16,2.803 3.896,4.63 6.929,4.63h328.975c3.033,0 5.769-1.827 6.929-4.63 1.161-2.802 0.519-6.028-1.625-8.173zm-309.299-107.364l-11.931-235.197c-1.353-27.153 8.021-52.741 26.392-72.049 18.37-19.309 43.459-29.942 70.645-29.942h108.975c27.184,0 52.253,10.631 70.589,29.935s27.665,44.886 26.268,72.041l-11.888,235.217c-1.162,23.604-21.335,42.808-44.969,42.808h-4.632l2.568-50.807c0.911-17.707-5.198-34.418-17.203-47.057s-28.38-19.598-46.11-19.598h-58.299c-17.729,0-34.112,6.959-46.135,19.596-12.022,12.636-18.158,29.346-17.275,47.059l2.577,50.808h-4.465c-23.644-0.001-43.88-19.211-45.107-42.814zm64.59,42.813l-2.615-51.561c-0.675-13.563 3.999-26.335 13.162-35.966s21.688-14.935 35.268-14.935h58.299c13.577,0 26.09,5.302 35.234,14.929s13.797,22.396 13.099,35.962l-2.606,51.571h-149.841zm-19.484,15h188.975c1.447,0 2.881-0.072 4.306-0.178 0.1,0.113 0.196,0.228 0.304,0.336l17.197,17.196h-232.761l17.197-17.196c0.112-0.112 0.212-0.231 0.315-0.349 1.479,0.115 2.966,0.191 4.467,0.191zm-51.979,47.354l15-15h262.761l15,15h-292.761z"/>
        <path d="m353.59,153.684c3.995,0 7.289-3.131 7.49-7.121l1.562-30.878c0.379-7.359-0.302-14.643-2.022-21.649-0.823-3.354-3.83-5.711-7.283-5.711l-234.279,.005c-3.446,0-6.449,2.349-7.279,5.693-1.742,7.019-2.439,14.316-2.071,21.694l1.564,30.847c0.202,3.989 3.496,7.12 7.49,7.12h234.828zm-228.367-50.354l221.932-.006c0.538,3.799 0.708,7.68 0.507,11.596l-1.202,23.764h-220.569l-1.203-23.72c-0.196-3.927-0.016-7.82 0.535-11.634z"/>
        <path d="m354.566,214.713c3.461-2.277 4.42-6.927 2.144-10.388-2.277-3.461-6.93-4.42-10.388-2.144-32.725,21.53-70.812,32.91-110.145,32.91-39.33,0-77.415-11.378-110.138-32.905-3.461-2.278-8.112-1.317-10.388,2.144-2.276,3.46-1.316,8.111 2.144,10.388 35.178,23.142 76.114,35.374 118.382,35.374 42.272,2.84217e-14 83.211-12.234 118.389-35.379z"/>
        <path d="m173.678,191.184c0,12.407 10.094,22.5 22.5,22.5s22.5-10.093 22.5-22.5-10.094-22.5-22.5-22.5-22.5,10.093-22.5,22.5zm30,0c0,4.136-3.364,7.5-7.5,7.5s-7.5-3.364-7.5-7.5 3.364-7.5 7.5-7.5 7.5,3.364 7.5,7.5z"/>
        <path d="m253.678,191.184c0,12.407 10.094,22.5 22.5,22.5s22.5-10.093 22.5-22.5-10.094-22.5-22.5-22.5-22.5,10.093-22.5,22.5zm30,0c0,4.136-3.364,7.5-7.5,7.5s-7.5-3.364-7.5-7.5 3.364-7.5 7.5-7.5 7.5,3.364 7.5,7.5z"/>
        <path d="m291.196,336.313h-110.042c-4.143,0-7.5,3.358-7.5,7.5s3.357,7.5 7.5,7.5h110.042c4.143,0 7.5-3.358 7.5-7.5s-3.357-7.5-7.5-7.5z"/>
      </svg>
    )}
  ];

  return (
    <div 
      className={`rounded-2xl border border-border/50 bg-card/95 backdrop-blur-md shadow-2xl overflow-hidden transition-all duration-300 max-h-[80vh] flex flex-col ${isFlashing ? 'ring-2 ring-primary/50' : ''}`} 
      ref={formRef}
    >
      {/* Modal Header */}
      <div className="flex justify-between items-center p-4 border-b border-border/50 bg-muted/30 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${editingId ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary'}`}>
            {editingId ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {editingId ? 'Eintrag bearbeiten' : 'Neue Dienstreise'}
            </h2>
            <p className="text-[10px] text-muted-foreground">
              {editingId ? 'Änderungen vornehmen' : 'Reisedaten erfassen'}
            </p>
          </div>
        </div>
        <button 
          type="button"
          onClick={cancelEdit}
          className="w-8 h-8 rounded-lg bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form id="trip-form" onSubmit={handleSubmit} className="p-4 space-y-5 overflow-y-auto flex-1">
        
        {/* Section: Reisezeitraum */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
              <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xs font-semibold text-foreground">Reisezeitraum</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Start */}
            <div className="space-y-2 p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-border/30">
              <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Beginn</label>
              <CustomDatePicker
                className="w-full px-3 py-2.5 bg-card rounded-lg border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm text-foreground"
                value={formData.date}
                onChange={e => {
                  const newDate = e.target.value;
                  if (!formData.endDate || formData.endDate < newDate) {
                    setFormData({...formData, date: newDate, endDate: newDate});
                  } else {
                    setFormData({...formData, date: newDate});
                  }
                }}
              />
              <CustomTimePicker
                className="w-full px-3 py-2.5 bg-card rounded-lg border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm text-foreground"
                value={formData.startTime}
                onChange={e => setFormData({...formData, startTime: e.target.value})}
              />
            </div>
            
            {/* End */}
            <div className="space-y-2 p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-border/30">
              <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Ende</label>
              <CustomDatePicker
                className="w-full px-3 py-2.5 bg-card rounded-lg border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm text-foreground"
                min={formData.date}
                value={formData.endDate || formData.date}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
              />
              <CustomTimePicker
                className="w-full px-3 py-2.5 bg-card rounded-lg border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm text-foreground"
                value={formData.endTime}
                onChange={e => setFormData({...formData, endTime: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Section: Verkehrsmittel */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
              <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.4,36.1s-.19,1.51,0,2.23c.13.5.26,1.34.78,1.34h2.9c.52,0,.65-.84.78-1.34.19-.72,0-2.23,0-2.23" />
                <rect x="4.5" y="21.66" width="39" height="14.49" rx="4.46" ry="4.46" />
                <path d="M35.14,36.1s-.19,1.51,0,2.23c.13.5.26,1.34.78,1.34h2.9c.52,0,.65-.84.78-1.34.19-.72,0-2.23,0-2.23" />
                <circle cx="10.63" cy="29.46" r="2.23" />
                <path d="M8.96,21.66l2.56-10.03c.44-1.71,2.35-3.34,4.12-3.34h16.71c1.77,0,3.69,1.63,4.12,3.34l2.56,10.03" />
                <circle cx="37.37" cy="29.46" r="2.23" />
              </svg>
            </div>
            <h3 className="text-xs font-semibold text-foreground">Verkehrsmittel</h3>
          </div>
          
          {/* Toggle Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {transportModes.map(mode => {
              const isActive = formData.commute[mode.key].active;
              return (
                <button
                  key={mode.key}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      commute: {
                        ...prev.commute,
                        [mode.key]: { ...prev.commute[mode.key], active: !isActive }
                      }
                    }));
                  }}
                  className={`px-2 py-2.5 rounded-xl border text-xs font-medium transition-all flex flex-col items-center justify-center gap-1.5 ${
                    isActive 
                      ? 'bg-primary/10 text-primary border-primary/30 shadow-sm' 
                      : 'bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border-border/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {mode.icon}
                  <span className="text-[10px]">{mode.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Inputs */}
          <div className="space-y-2">
            {/* Car Slider */}
            {formData.commute.car.active && (
              <div className="p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-border/30 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center">
                      <svg className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8.4,36.1s-.19,1.51,0,2.23c.13.5.26,1.34.78,1.34h2.9c.52,0,.65-.84.78-1.34.19-.72,0-2.23,0-2.23" />
                        <rect x="4.5" y="21.66" width="39" height="14.49" rx="4.46" ry="4.46" />
                        <path d="M35.14,36.1s-.19,1.51,0,2.23c.13.5.26,1.34.78,1.34h2.9c.52,0,.65-.84.78-1.34.19-.72,0-2.23,0-2.23" />
                        <circle cx="10.63" cy="29.46" r="2.23" />
                        <path d="M8.96,21.66l2.56-10.03c.44-1.71,2.35-3.34,4.12-3.34h16.71c1.77,0,3.69,1.63,4.12,3.34l2.56,10.03" />
                        <circle cx="37.37" cy="29.46" r="2.23" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-foreground">Auto</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{(formData.commute.car.distance * 2).toFixed(1)} km</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="30" 
                  step="0.1"
                  value={formData.commute.car.distance * 2}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) / 2;
                    setFormData(prev => ({
                      ...prev,
                      commute: { ...prev.commute, car: { ...prev.commute.car, distance: val } }
                    }));
                  }}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <p className="text-[10px] text-muted-foreground">Hin- und Rückfahrt zur Arbeitsstätte</p>
              </div>
            )}

            {/* Motorcycle Slider */}
            {formData.commute.motorcycle.active && (
              <div className="p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-border/30 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-orange-500/10 flex items-center justify-center">
                      <svg className="w-3 h-3 text-orange-600" fill="currentColor" viewBox="0 0 470 470">
                        <path d="m289.602,334.317c4.143,0 7.5-3.357 7.5-7.5v-28.28c0-34.909-28.4-63.31-63.309-63.31-34.909,0-63.31,28.4-63.31,63.31v28.28c0,4.143 3.357,7.5 7.5,7.5h12.501v92.374c0,23.881 19.428,43.309 43.309,43.309s43.309-19.428 43.309-43.309v-69.874c0-4.143-3.357-7.5-7.5-7.5s-7.5,3.357-7.5,7.5v69.874c0,15.609-12.699,28.309-28.309,28.309s-28.309-12.699-28.309-28.309v-92.374h84.118zm-104.119-15v-20.78c0-26.638 21.672-48.31 48.31-48.31s48.309,21.672 48.309,48.31v20.78h-96.619z"/>
                        <path d="m279.913,74.912c0-24.765-20.147-44.912-44.913-44.912s-44.913,20.147-44.913,44.912c0,24.766 20.147,44.913 44.913,44.913s44.913-20.147 44.913-44.913zm-44.913,29.913c-16.494,0-29.913-13.419-29.913-29.913 0-16.493 13.419-29.912 29.913-29.912s29.913,13.419 29.913,29.912c0,16.494-13.419,29.913-29.913,29.913z"/>
                        <path d="m387.494,67.412h-32.5v-1.735c0-10.373-8.438-18.812-18.812-18.812h-31.705c-11.358-28.25-38.619-46.865-69.477-46.865s-58.119,18.615-69.478,46.865h-31.705c-10.373,0-18.812,8.438-18.812,18.812v1.735h-32.5c-4.143,0-7.5,3.357-7.5,7.5s3.357,7.5 7.5,7.5h32.5v1.736c0,10.373 8.438,18.812 18.812,18.812h31.712c1.219,3.015 2.636,5.927 4.221,8.73-33.963,22.036-54.745,59.912-54.745,100.719v127.665c0,30.372 21.732,56.253 51.675,61.537 0.441,0.078 0.88,0.115 1.313,0.115 3.57,0 6.735-2.56 7.377-6.197 0.72-4.079-2.003-7.97-6.082-8.689-22.762-4.018-39.282-23.686-39.282-46.766v-127.665c0-35.904 18.393-69.213 48.407-88.45 10.295,11.853 24.224,20.42 39.924,23.99 4.047,0.917 8.059-1.612 8.977-5.65 0.918-4.039-1.611-8.058-5.65-8.977-13.814-3.141-25.907-11.126-34.307-22.122-0.113-0.278-0.239-0.554-0.388-0.823-0.442-0.795-1.012-1.471-1.664-2.031-3.128-4.633-5.633-9.727-7.374-15.171-0.993-3.107-3.882-5.216-7.144-5.216h-36.97c-2.102,0-3.812-1.71-3.812-3.812v-18.47c0-2.102 1.71-3.812 3.812-3.812h36.97c3.262,0 6.15-2.108 7.144-5.216 7.965-24.912 30.9-41.649 57.069-41.649s49.104,16.737 57.069,41.649c0.993,3.107 3.882,5.216 7.144,5.216h36.97c2.102,0 3.812,1.71 3.812,3.812v18.472c0,2.102-1.71,3.812-3.812,3.812h-36.97c-3.262,0-6.15,2.108-7.144,5.216-6.425,20.091-23.182,35.474-43.732,40.146-4.039,0.919-6.568,4.938-5.65,8.977 0.791,3.479 3.883,5.839 7.307,5.839 0.551,0 1.11-0.062 1.67-0.188 15.699-3.569 29.627-12.135 39.922-23.987 30.01,19.236 48.409,52.561 48.409,88.447v127.665c0,23.764-17.782,44.005-41.363,47.085-4.107,0.536-7.003,4.301-6.466,8.407 0.493,3.778 3.717,6.53 7.427,6.53 0.324,0 0.651-0.021 0.98-0.064 31.025-4.051 54.422-30.688 54.422-61.958v-127.667c0-40.785-20.789-78.681-54.746-100.717 1.586-2.803 3.002-5.716 4.222-8.732h31.712c10.373,0 18.812-8.438 18.812-18.812v-1.736h32.5c4.143,0 7.5-3.357 7.5-7.5s-3.358-7.5-7.501-7.5z"/>
                        <path d="m251.926,222.096c4.143,0 7.5-3.357 7.5-7.5s-3.357-7.5-7.5-7.5h-36.266c-4.143,0-7.5,3.357-7.5,7.5s3.357,7.5 7.5,7.5h36.266z"/>
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-foreground">Motorrad</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{(formData.commute.motorcycle.distance * 2).toFixed(1)} km</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="30" 
                  step="0.1"
                  value={formData.commute.motorcycle.distance * 2}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) / 2;
                    setFormData(prev => ({
                      ...prev,
                      commute: { ...prev.commute, motorcycle: { ...prev.commute.motorcycle, distance: val } }
                    }));
                  }}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <p className="text-[10px] text-muted-foreground">Hin- und Rückfahrt zur Arbeitsstätte</p>
              </div>
            )}

            {/* Bike Slider */}
            {formData.commute.bike.active && (
              <div className="p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-border/30 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-green-500/10 flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <circle cx="5.5" cy="17.5" r="3.5" />
                        <circle cx="18.5" cy="17.5" r="3.5" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 6a1 1 0 100-2 1 1 0 000 2zm-3 11.5V14l-3-3 4-3 2 3h3" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-foreground">Fahrrad</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{(formData.commute.bike.distance * 2).toFixed(1)} km</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="30" 
                  step="0.1"
                  value={formData.commute.bike.distance * 2}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) / 2;
                    setFormData(prev => ({
                      ...prev,
                      commute: { ...prev.commute, bike: { ...prev.commute.bike, distance: val } }
                    }));
                  }}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <p className="text-[10px] text-muted-foreground">Hin- und Rückfahrt zur Arbeitsstätte</p>
              </div>
            )}

            {/* Public Transport Input */}
            {formData.commute.public_transport.active && (
              <div className="p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-border/30 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-purple-500/10 flex items-center justify-center">
                    <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 472.355 472.355">
                      <path d="m405.969,459.552l-30-29.999c-0.001-0.001-23.69-23.69-23.69-23.69 21.389-8.459 37.244-28.988 38.422-52.923l11.887-235.2c1.61-31.295-9.176-60.82-30.372-83.135-21.196-22.315-50.128-34.605-81.465-34.605h-108.975c-31.334,0-60.283,12.289-81.513,34.602-21.23,22.314-32.064,51.838-30.506,83.142l11.932,235.214c1.243,23.884 17.09,44.374 38.433,52.859l-23.735,23.734c-0.001,0.001-30.001,30.001-30.001,30.001-2.145,2.145-2.786,5.371-1.625,8.173 1.16,2.803 3.896,4.63 6.929,4.63h328.975c3.033,0 5.769-1.827 6.929-4.63 1.161-2.802 0.519-6.028-1.625-8.173zm-309.299-107.364l-11.931-235.197c-1.353-27.153 8.021-52.741 26.392-72.049 18.37-19.309 43.459-29.942 70.645-29.942h108.975c27.184,0 52.253,10.631 70.589,29.935s27.665,44.886 26.268,72.041l-11.888,235.217c-1.162,23.604-21.335,42.808-44.969,42.808h-4.632l2.568-50.807c0.911-17.707-5.198-34.418-17.203-47.057s-28.38-19.598-46.11-19.598h-58.299c-17.729,0-34.112,6.959-46.135,19.596-12.022,12.636-18.158,29.346-17.275,47.059l2.577,50.808h-4.465c-23.644-0.001-43.88-19.211-45.107-42.814zm64.59,42.813l-2.615-51.561c-0.675-13.563 3.999-26.335 13.162-35.966s21.688-14.935 35.268-14.935h58.299c13.577,0 26.09,5.302 35.234,14.929s13.797,22.396 13.099,35.962l-2.606,51.571h-149.841zm-19.484,15h188.975c1.447,0 2.881-0.072 4.306-0.178 0.1,0.113 0.196,0.228 0.304,0.336l17.197,17.196h-232.761l17.197-17.196c0.112-0.112 0.212-0.231 0.315-0.349 1.479,0.115 2.966,0.191 4.467,0.191zm-51.979,47.354l15-15h262.761l15,15h-292.761z"/>
                      <path d="m353.59,153.684c3.995,0 7.289-3.131 7.49-7.121l1.562-30.878c0.379-7.359-0.302-14.643-2.022-21.649-0.823-3.354-3.83-5.711-7.283-5.711l-234.279,.005c-3.446,0-6.449,2.349-7.279,5.693-1.742,7.019-2.439,14.316-2.071,21.694l1.564,30.847c0.202,3.989 3.496,7.12 7.49,7.12h234.828zm-228.367-50.354l221.932-.006c0.538,3.799 0.708,7.68 0.507,11.596l-1.202,23.764h-220.569l-1.203-23.72c-0.196-3.927-0.016-7.82 0.535-11.634z"/>
                      <path d="m354.566,214.713c3.461-2.277 4.42-6.927 2.144-10.388-2.277-3.461-6.93-4.42-10.388-2.144-32.725,21.53-70.812,32.91-110.145,32.91-39.33,0-77.415-11.378-110.138-32.905-3.461-2.278-8.112-1.317-10.388,2.144-2.276,3.46-1.316,8.111 2.144,10.388 35.178,23.142 76.114,35.374 118.382,35.374 42.272,2.84217e-14 83.211-12.234 118.389-35.379z"/>
                      <path d="m173.678,191.184c0,12.407 10.094,22.5 22.5,22.5s22.5-10.093 22.5-22.5-10.094-22.5-22.5-22.5-22.5,10.093-22.5,22.5zm30,0c0,4.136-3.364,7.5-7.5,7.5s-7.5-3.364-7.5-7.5 3.364-7.5 7.5-7.5 7.5,3.364 7.5,7.5z"/>
                      <path d="m253.678,191.184c0,12.407 10.094,22.5 22.5,22.5s22.5-10.093 22.5-22.5-10.094-22.5-22.5-22.5-22.5,10.093-22.5,22.5zm30,0c0,4.136-3.364,7.5-7.5,7.5s-7.5-3.364-7.5-7.5 3.364-7.5 7.5-7.5 7.5,3.364 7.5,7.5z"/>
                      <path d="m291.196,336.313h-110.042c-4.143,0-7.5,3.358-7.5,7.5s3.357,7.5 7.5,7.5h110.042c4.143,0 7.5-3.358 7.5-7.5s-3.357-7.5-7.5-7.5z"/>
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-foreground">Sonstige Kosten</span>
                </div>
                
                <div>
                  <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide block mb-1.5">Betrag (Gesamt)</label>
                  <NumberInput
                    className="w-full px-3 py-2.5 bg-card rounded-lg border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent text-sm text-foreground"
                    value={formData.commute.public_transport.cost}
                    step="0.01"
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        commute: { ...prev.commute, public_transport: { ...prev.commute.public_transport, cost: val } }
                      }));
                    }}
                    placeholder="0.00 €"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1.5">Taxi, Uber, Bahn, Bus oder andere Tickets</p>
                </div>

                {/* Receipt Upload Section */}
                <div>
                  <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide block mb-1.5">Beleg (optional)</label>
                  {!tempPublicTransportReceipt ? (
                    <button 
                      type="button" 
                      onClick={() => setShowPublicTransportCameraOptions(true)} 
                      className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-2 text-xs font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Beleg fotografieren
                    </button>
                  ) : (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border/50 group">
                      <img 
                        src={`data:image/jpeg;base64,${tempPublicTransportReceipt}`} 
                        alt="Beleg Vorschau" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          type="button" 
                          onClick={removePublicTransportReceipt}
                          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Entfernen
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Error Message - Sticky above button */}
      {submitError && (
        <div className="px-4 pb-2 shrink-0 border-t border-border/50 pt-3 bg-card/95">
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-2">
            <svg className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-red-600 dark:text-red-400">{submitError}</p>
          </div>
        </div>
      )}

      {/* Footer with Submit Button */}
      <div className={`border-t border-border/50 bg-muted/30 p-4 shrink-0 ${submitError ? 'border-t-0 pt-2' : ''}`}>
        <button 
          type="submit" 
          form="trip-form"
          disabled={editingId && !hasChanges}
          className={`w-full px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm shadow-sm ${
            editingId && !hasChanges 
              ? 'bg-muted text-muted-foreground cursor-not-allowed' 
              : editingId
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          }`}
        >
          {editingId ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Aktualisieren
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Hinzufügen
            </>
          )}
        </button>
      </div>

      {/* Camera Options Modal */}
      {showPublicTransportCameraOptions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-md shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-muted/30">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Beleg hinzufügen</h3>
                <p className="text-[10px] text-muted-foreground">Wählen Sie eine Quelle</p>
              </div>
            </div>
            
            <div className="p-4 space-y-2">
              <button
                onClick={() => takePublicTransportPicture && takePublicTransportPicture(CameraSource.Camera)}
                className="w-full p-4 rounded-xl bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-border/50 flex items-center gap-4 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <span className="text-sm font-medium text-foreground block">Kamera</span>
                  <span className="text-[10px] text-muted-foreground">Foto aufnehmen</span>
                </div>
              </button>
              
              <button
                onClick={() => takePublicTransportPicture && takePublicTransportPicture(CameraSource.Photos)}
                className="w-full p-4 rounded-xl bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-border/50 flex items-center gap-4 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <span className="text-sm font-medium text-foreground block">Galerie</span>
                  <span className="text-[10px] text-muted-foreground">Bild auswählen</span>
                </div>
              </button>
            </div>
            
            <div className="p-4 border-t border-border/50 bg-muted/30">
              <button
                onClick={() => setShowPublicTransportCameraOptions(false)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-border/50 text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
