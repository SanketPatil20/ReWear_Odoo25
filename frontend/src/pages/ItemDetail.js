import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiMapPin, FiMessageCircle, FiHeart } from 'react-icons/fi';
import axios from 'axios';

const ItemDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapType, setSwapType] = useState('direct');
  const [userItems, setUserItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchItem();
    if (isAuthenticated) {
      fetchUserItems();
    }
  }, [id, isAuthenticated]);

  const fetchItem = async () => {
    try {
      const response = await axios.get(`/items/${id}`);
      setItem(response.data);
    } catch (error) {
      console.error('Error fetching item:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserItems = async () => {
    try {
      const response = await axios.get('/items/user/me');
      setUserItems(response.data.filter(item => item.status === 'available'));
    } catch (error) {
      console.error('Error fetching user items:', error);
    }
  };

  const handleSwapRequest = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (swapType === 'direct' && !selectedItem) {
      alert('Please select an item to offer');
      return;
    }

    try {
      const swapData = {
        itemRequested: id,
        swapType,
        message
      };

      if (swapType === 'direct') {
        swapData.itemOffered = selectedItem;
      } else {
        swapData.pointsUsed = item.pointsValue;
      }

      await axios.post('/swaps', swapData);
      setShowSwapModal(false);
      alert('Swap request sent successfully!');
    } catch (error) {
      console.error('Error creating swap request:', error);
      alert(error.response?.data?.message || 'Error creating swap request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Item not found</h2>
          <p className="text-gray-600">The item you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Image Gallery */}
            <div>
              <div className="aspect-w-1 aspect-h-1 mb-4">
                <img
                  src={`http://localhost:5001/uploads/${item.images[selectedImage]}`}
                  alt={item.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>
              {item.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {item.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-w-1 aspect-h-1 ${
                        selectedImage === index ? 'ring-2 ring-primary-500' : ''
                      }`}
                    >
                      <img
                        src={`http://localhost:5001/uploads/${image}`}
                        alt={`${item.title} ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Item Details */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>
              
              <div className="flex items-center mb-4">
                <FiUser className="text-gray-400 mr-2" />
                <span className="text-gray-600">{item.owner?.name}</span>
                {item.owner?.location && (
                  <>
                    <FiMapPin className="text-gray-400 ml-4 mr-2" />
                    <span className="text-gray-600">{item.owner.location}</span>
                  </>
                )}
              </div>

              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">{item.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-sm font-medium text-gray-500">Category</span>
                  <p className="text-gray-900">{item.category}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Type</span>
                  <p className="text-gray-900">{item.type}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Size</span>
                  <p className="text-gray-900">{item.size}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Condition</span>
                  <p className="text-gray-900">{item.condition}</p>
                </div>
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className="mb-6">
                  <span className="text-sm font-medium text-gray-500">Tags</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary-600">
                    {item.pointsValue} points
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                </div>

                {isAuthenticated && item.owner?._id !== user?._id && item.status === 'available' && (
                  <button
                    onClick={() => setShowSwapModal(true)}
                    className="w-full btn-primary"
                  >
                    <FiMessageCircle className="inline mr-2" />
                    Request Swap
                  </button>
                )}

                {!isAuthenticated && (
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full btn-primary"
                  >
                    Login to Request Swap
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Swap Modal */}
        {showSwapModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Request Swap</h3>
              
              <div className="mb-4">
                <label className="form-label">Swap Type</label>
                <select
                  value={swapType}
                  onChange={(e) => setSwapType(e.target.value)}
                  className="input-field"
                >
                  <option value="direct">Direct Swap</option>
                  <option value="points">Points Redemption</option>
                </select>
              </div>

              {swapType === 'direct' && (
                <div className="mb-4">
                  <label className="form-label">Select Item to Offer</label>
                  <select
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Choose an item...</option>
                    {userItems.map((userItem) => (
                      <option key={userItem._id} value={userItem._id}>
                        {userItem.title} ({userItem.pointsValue} points)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {swapType === 'points' && (
                <div className="mb-4 p-3 bg-blue-50 rounded">
                  <p className="text-sm text-blue-800">
                    You will spend {item.pointsValue} points to redeem this item.
                    Your current balance: {user?.points} points
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="form-label">Message (Optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input-field"
                  rows="3"
                  placeholder="Add a message to your swap request..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSwapModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSwapRequest}
                  className="btn-primary flex-1"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDetail; 