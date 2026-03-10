import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AddressForm from '../components/AddressForm';
import '../styles/Profile.css';

const Profile = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    profilePicture: '',
    addresses: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [activeTab, setActiveTab] = useState('personal');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null);
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userData = JSON.parse(localStorage.getItem('quikry_user'));
    if (!userData) {
      navigate('/login');
      return;
    }
    
    // Load saved location as default address if no addresses exist
    if (!userData.addresses || userData.addresses.length === 0) {
      const savedLocation = localStorage.getItem('selectedLocation');
      if (savedLocation) {
        const location = JSON.parse(savedLocation);
        userData.addresses = [{
          addressType: 'current',
          houseNo: location.houseNo || '',
          street: location.street || location.title || '',
          landmark: location.landmark || '',
          area: location.area || '',
          city: location.city || '',
          state: location.state || '',
          pincode: location.pincode || location.zipCode || '',
          fullAddress: location.address || location.fullAddress || '',
          isDefault: true
        }];
      }
    }
    
    setUser(userData);
    setEditedUser(userData);
  }, [navigate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedUser({ ...user });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedUser({ ...user });
  };

  const handleSaveEdit = async () => {
    try {
      // Update user data in localStorage
      localStorage.setItem('quikry_user', JSON.stringify(editedUser));
      setUser(editedUser);
      setIsEditing(false);
      setMessage('Profile updated successfully!');
      setMessageType('success');
      
      // Hide message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('quikry_user');
    navigate('/login');
  };

  const handleAddAddress = () => {
    setAddressToEdit(null);
    setEditingAddressIndex(null);
    setShowAddressModal(true);
  };

  const handleEditAddress = (index) => {
    const address = user.addresses[index];
    setAddressToEdit(address);
    setEditingAddressIndex(index);
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (addressData) => {
    try {
      // Create the complete address object from AddressForm data
      const newAddress = {
        houseNo: addressData.houseNo,
        street: addressData.street,
        landmark: addressData.landmark,
        area: addressData.area,
        city: addressData.city,
        state: addressData.state,
        pincode: addressData.pincode,
        fullAddress: addressData.fullAddress,
        addressType: addressData.addressType,
        customLabel: addressData.customLabel,
        label: addressData.label,
        isDefault: false,
        // Keep old structure for backward compatibility with Cart
        type: addressData.addressType,
        zipCode: addressData.pincode
      };

      let response;
      if (editingAddressIndex !== null) {
        // UPDATE EXISTING ADDRESS
        const addressToUpdate = user.addresses[editingAddressIndex];
        if (addressToUpdate._id) {
          response = await fetch(`http://localhost:8000/api/user/addresses/${user._id}/${addressToUpdate._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAddress)
          });
        }
      } else {
        // ADD NEW ADDRESS
        response = await fetch(`http://localhost:8000/api/user/addresses/${user._id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAddress)
        });
      }

      if (response) {
        const data = await response.json();
        if (data.success) {
          // Fetch updated addresses from database
          const fetchResponse = await fetch(`http://localhost:8000/api/user/addresses/${user._id}`);
          const fetchData = await fetchResponse.json();
          
          if (fetchData.success) {
            const updatedUser = { ...user, addresses: fetchData.addresses };
            localStorage.setItem('quikry_user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setShowAddressModal(false);
            setMessage(editingAddressIndex !== null ? 'Address updated in database!' : 'Address saved permanently!');
            setMessageType('success');
            setTimeout(() => setMessage(''), 3000);
          }
        } else {
          throw new Error(data.message || 'Failed to save address');
        }
      }
    } catch (error) {
      console.error('Error saving address:', error);
      setMessage('❌ Failed to save address. Please check your connection.');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteAddress = async (index) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const addressToDelete = user.addresses[index];
        if (addressToDelete._id) {
          const response = await fetch(`http://localhost:8000/api/user/addresses/${user._id}/${addressToDelete._id}`, {
            method: 'DELETE'
          });

          const data = await response.json();
          if (data.success) {
            // Fetch updated addresses from database
            const fetchResponse = await fetch(`http://localhost:8000/api/user/addresses/${user._id}`);
            const fetchData = await fetchResponse.json();
            
            if (fetchData.success) {
              const updatedUser = { ...user, addresses: fetchData.addresses };
              localStorage.setItem('quikry_user', JSON.stringify(updatedUser));
              setUser(updatedUser);
              setMessage('Address deleted permanently!');
              setMessageType('success');
              setTimeout(() => setMessage(''), 3000);
            }
          } else {
            throw new Error(data.message || 'Failed to delete address');
          }
        }
      } catch (error) {
        console.error('Error deleting address:', error);
        setMessage('❌ Failed to delete address. Please try again.');
        setMessageType('error');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const handleSetDefaultAddress = async (index) => {
    try {
      const addressToSetDefault = user.addresses[index];
      if (addressToSetDefault._id) {
        const response = await fetch(`http://localhost:8000/api/user/addresses/${user._id}/${addressToSetDefault._id}/set-default`, {
          method: 'PUT'
        });

        const data = await response.json();
        if (data.success) {
          // Fetch updated addresses from database
          const fetchResponse = await fetch(`http://localhost:8000/api/user/addresses/${user._id}`);
          const fetchData = await fetchResponse.json();
          
          if (fetchData.success) {
            const updatedUser = { ...user, addresses: fetchData.addresses };
            localStorage.setItem('quikry_user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setMessage('Default address updated!');
            setMessageType('success');
            setTimeout(() => setMessage(''), 3000);
          }
        } else {
          throw new Error(data.message || 'Failed to set default address');
        }
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      setMessage('❌ Failed to set default address. Please try again.');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        {message && (
          <div className={`alert alert-${messageType}`}>
            {message}
          </div>
        )}

        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-info">
            <div className="profile-avatar">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} />
              ) : (
                <div className="avatar-placeholder">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <div className="profile-details">
              <h1>{user.name || 'User'}</h1>
              <p>{user.email}</p>
              <p>{user.phone}</p>
            </div>
          </div>
          <div className="profile-actions">
            {!isEditing ? (
              <button className="btn btn-primary" onClick={handleEditClick}>
                <span className="icon">✏️</span> Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button className="btn btn-primary" onClick={handleSaveEdit}>
                  <span className="icon">💾</span> Save
                </button>
                <button className="btn btn-secondary" onClick={handleCancelEdit}>
                  <span className="icon">❌</span> Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Navigation */}
        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => handleTabChange('personal')}
          >
            👤 Personal Information
          </button>
          <button 
            className={`tab ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => handleTabChange('addresses')}
          >
            📍 Address Book
          </button>
          <button 
            className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => handleTabChange('orders')}
          >
            📦 My Orders
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="tab-content">
              <div className="content-grid">
                <div className="info-card">
                  <h3>👤 Basic Information</h3>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={isEditing ? editedUser.name || '' : user.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? 'disabled' : ''}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={isEditing ? editedUser.email || '' : user.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? 'disabled' : ''}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={isEditing ? editedUser.phone || '' : user.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? 'disabled' : ''}
                    />
                  </div>
                </div>
                
                <div className="info-card">
                  <h3>📧 Account Details</h3>
                  <div className="detail-item">
                    <span className="label">Account Type:</span>
                    <span className="value">
                      {user.authProvider === 'google' ? 'Google Account' : 'Email Account'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Member Since:</span>
                    <span className="value">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Last Login:</span>
                    <span className="value">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Today'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Address Book Tab */}
          {activeTab === 'addresses' && (
            <div className="tab-content">
              <div className="address-header">
                <h3>📍 Saved Addresses</h3>
                <button className="btn btn-primary" onClick={handleAddAddress}>
                  ➕ Add New Address
                </button>
              </div>
              {user.addresses && user.addresses.length > 0 ? (
                <div className="addresses-grid">
                  {user.addresses.map((address, index) => (
                    <div key={index} className={`address-card ${address.isDefault ? 'default' : ''}`}>
                      <div className="address-header-row">
                        <h4>
                          {address.addressType === 'home' || address.type === 'home' ? '🏠 Home' : 
                           address.addressType === 'work' || address.type === 'work' ? '🏢 Work' : 
                           address.customLabel ? `📍 ${address.customLabel}` : '📍 Other'}
                        </h4>
                        {address.isDefault && <span className="default-badge">Default</span>}
                      </div>
                      <p className="address-text">
                        {address.houseNo && <><strong>{address.houseNo}</strong><br /></>}
                        {address.street && <>{address.street}<br /></>}
                        {address.landmark && <>Near {address.landmark}<br /></>}
                        {address.area && <>{address.area}<br /></>}
                        {address.city}, {address.state} - {address.pincode || address.zipCode}
                      </p>
                      <div className="address-actions">
                        {!address.isDefault && (
                          <button 
                            className="btn-small btn-secondary" 
                            onClick={() => handleSetDefaultAddress(index)}
                          >
                            Set as Default
                          </button>
                        )}
                        <button 
                          className="btn-small btn-primary" 
                          onClick={() => handleEditAddress(index)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-small btn-danger" 
                          onClick={() => handleDeleteAddress(index)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>📍 No saved addresses yet.</p>
                  <button className="btn btn-primary" onClick={handleAddAddress}>
                    Add Your First Address
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Remove Security Tab - it's been deleted */}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="tab-content">
              <h3>📦 My Orders</h3>
              <div className="orders-link">
                <p>View and manage all your orders.</p>
                <Link to="/orders" className="btn btn-primary">
                  Go to Orders Page
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="profile-footer">
          <button className="btn btn-danger" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Address Modal - Professional Form - Always fully editable */}
      <AddressForm
        isOpen={showAddressModal}
        onClose={() => {
          setShowAddressModal(false);
          setAddressToEdit(null);
          setEditingAddressIndex(null);
        }}
        onSave={handleSaveAddress}
        detectedCity={''}
        detectedState={''}
        detectedPincode={''}
        initialData={addressToEdit}
      />
    </div>
  );
};

export default Profile;