import React, { useState, useEffect } from 'react';
import './AddressForm.css';

const AddressForm = ({ isOpen, onClose, onSave, detectedPincode, detectedCity, detectedState, initialData }) => {
  const [formData, setFormData] = useState({
    houseNo: '',
    street: '',
    landmark: '',
    area: '',
    city: detectedCity || '',
    state: detectedState || '',
    pincode: detectedPincode || '',
    addressType: 'home', // home, work, other
    customLabel: ''
  });

  const [errors, setErrors] = useState({});

  // Initialize form only when the modal opens to avoid overwriting user edits
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      // Editing existing address - use values from initialData if present
      setFormData({
        houseNo: initialData.houseNo || '',
        street: initialData.street || '',
        landmark: initialData.landmark || '',
        area: initialData.area || '',
        city: initialData.city || detectedCity || '',
        state: initialData.state || detectedState || '',
        pincode: initialData.pincode || initialData.zipCode || detectedPincode || '',
        addressType: initialData.addressType || initialData.type || 'home',
        customLabel: initialData.customLabel || ''
      });
    } else {
      // Adding new address - seed with detected values if available
      setFormData({
        houseNo: '',
        street: '',
        landmark: '',
        area: '',
        city: detectedCity || '',
        state: detectedState || '',
        pincode: detectedPincode || '',
        addressType: 'home',
        customLabel: ''
      });
    }
    // Only run when modal is opened
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.houseNo.trim()) {
      newErrors.houseNo = 'House/Flat number is required';
    }
    if (!formData.street.trim()) {
      newErrors.street = 'Street/Road name is required';
    }
    if (!formData.area.trim()) {
      newErrors.area = 'Area/Locality is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const fullAddress = [
        formData.houseNo,
        formData.street,
        formData.landmark && `Near ${formData.landmark}`,
        formData.area,
        formData.city,
        formData.state,
        formData.pincode
      ].filter(Boolean).join(', ');

      onSave({
        ...formData,
        fullAddress,
        label: formData.addressType === 'other' ? formData.customLabel : formData.addressType
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="addr-overlay" onClick={onClose}>
      <div className="addr-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="addr-header">
          <h2>📍 Enter Complete Address</h2>
          <button className="addr-close" onClick={onClose}>×</button>
        </div>

        {/* Form */}
        <form className="addr-form" onSubmit={handleSubmit}>
          <div className="addr-content">
            
            {/* GPS Detection Info */}
            {detectedPincode && (
              <div className="addr-info">
                <span className="addr-info-icon">✅</span>
                <div>
                  <strong>Location detected:</strong> {detectedCity}, {detectedState} - {detectedPincode}
                  <br />
                  <small>Please provide your exact house address below</small>
                </div>
              </div>
            )}

            {/* House/Flat Number */}
            <div className="addr-field">
              <label>
                House/Flat/Building No. <span className="addr-required">*</span>
              </label>
              <input
                type="text"
                name="houseNo"
                placeholder="e.g., Flat 301, Building A"
                value={formData.houseNo}
                onChange={handleChange}
                className={errors.houseNo ? 'addr-input-error' : ''}
              />
              {errors.houseNo && <span className="addr-error">{errors.houseNo}</span>}
            </div>

            {/* Street/Road */}
            <div className="addr-field">
              <label>
                Street/Road Name <span className="addr-required">*</span>
              </label>
              <input
                type="text"
                name="street"
                placeholder="e.g., MG Road, Sector 15"
                value={formData.street}
                onChange={handleChange}
                className={errors.street ? 'addr-input-error' : ''}
              />
              {errors.street && <span className="addr-error">{errors.street}</span>}
            </div>

            {/* Landmark */}
            <div className="addr-field">
              <label>Landmark (Optional)</label>
              <input
                type="text"
                name="landmark"
                placeholder="e.g., Near City Mall, Opposite Metro Station"
                value={formData.landmark}
                onChange={handleChange}
              />
            </div>

            {/* Area/Locality */}
            <div className="addr-field">
              <label>
                Area/Locality <span className="addr-required">*</span>
              </label>
              <input
                type="text"
                name="area"
                placeholder="e.g., Koramangala, Indiranagar"
                value={formData.area}
                onChange={handleChange}
                className={errors.area ? 'addr-input-error' : ''}
              />
              {errors.area && <span className="addr-error">{errors.area}</span>}
            </div>

            {/* City, State, Pincode Row */}
            <div className="addr-row">
              <div className="addr-field" style={{ flex: 2 }}>
                <label>
                  City <span className="addr-required">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  className={errors.city ? 'addr-input-error' : ''}
                />
                {errors.city && <span className="addr-error">{errors.city}</span>}
              </div>

              <div className="addr-field" style={{ flex: 2 }}>
                <label>
                  State <span className="addr-required">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                  className={errors.state ? 'addr-input-error' : ''}
                />
                {errors.state && <span className="addr-error">{errors.state}</span>}
              </div>

              <div className="addr-field" style={{ flex: 1 }}>
                <label>
                  Pincode <span className="addr-required">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  placeholder="000000"
                  maxLength="6"
                  value={formData.pincode}
                  onChange={handleChange}
                  className={errors.pincode ? 'addr-input-error' : ''}
                />
                {errors.pincode && <span className="addr-error">{errors.pincode}</span>}
              </div>
            </div>

            {/* Address Type */}
            <div className="addr-field">
              <label>Save address as</label>
              <div className="addr-type-buttons">
                <button
                  type="button"
                  className={`addr-type-btn ${formData.addressType === 'home' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, addressType: 'home' }))}
                >
                  🏠 Home
                </button>
                <button
                  type="button"
                  className={`addr-type-btn ${formData.addressType === 'work' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, addressType: 'work' }))}
                >
                  🏢 Work
                </button>
                <button
                  type="button"
                  className={`addr-type-btn ${formData.addressType === 'other' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, addressType: 'other' }))}
                >
                  📍 Other
                </button>
              </div>
            </div>

            {/* Custom Label for Other */}
            {formData.addressType === 'other' && (
              <div className="addr-field">
                <label>Custom Label</label>
                <input
                  type="text"
                  name="customLabel"
                  placeholder="e.g., Friend's Place, Gym"
                  value={formData.customLabel}
                  onChange={handleChange}
                />
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="addr-footer">
            <button type="button" className="addr-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="addr-btn-save">
              💾 Save Address
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AddressForm;
