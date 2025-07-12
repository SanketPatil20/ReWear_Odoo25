import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiPlus, FiPackage, FiTrendingUp, FiUser } from 'react-icons/fi';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [userItems, setUserItems] = useState([]);
  const [swapRequestsSent, setSwapRequestsSent] = useState([]);
  const [swapRequestsReceived, setSwapRequestsReceived] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [itemsRes, swapsSentRes, swapsReceivedRes] = await Promise.all([
          axios.get('/items/user/me'),
          axios.get('/swaps/my-requests'),
          axios.get('/swaps/my-items')
        ]);
        setUserItems(itemsRes.data);
        setSwapRequestsSent(swapsSentRes.data);
        setSwapRequestsReceived(swapsReceivedRes.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleAcceptSwap = async (swapId) => {
    try {
      await axios.put(`/swaps/${swapId}/accept`);
      // Refresh the data
      const [swapsSentRes, swapsReceivedRes] = await Promise.all([
        axios.get('/swaps/my-requests'),
        axios.get('/swaps/my-items')
      ]);
      setSwapRequestsSent(swapsSentRes.data);
      setSwapRequestsReceived(swapsReceivedRes.data);
      alert('Swap request accepted!');
    } catch (error) {
      console.error('Error accepting swap:', error);
      alert('Error accepting swap request');
    }
  };

  const handleRejectSwap = async (swapId) => {
    try {
      await axios.put(`/swaps/${swapId}/reject`);
      // Refresh the data
      const [swapsSentRes, swapsReceivedRes] = await Promise.all([
        axios.get('/swaps/my-requests'),
        axios.get('/swaps/my-items')
      ]);
      setSwapRequestsSent(swapsSentRes.data);
      setSwapRequestsReceived(swapsReceivedRes.data);
      alert('Swap request rejected');
    } catch (error) {
      console.error('Error rejecting swap:', error);
      alert('Error rejecting swap request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-primary-100 p-3 rounded-full">
                <FiTrendingUp className="text-primary-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Points Balance</p>
                <p className="text-2xl font-bold text-gray-900">{user?.points || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <FiPackage className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">My Items</p>
                <p className="text-2xl font-bold text-gray-900">{userItems.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <FiUser className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Swap Requests</p>
                <p className="text-2xl font-bold text-gray-900">{swapRequestsReceived.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/add-item"
              className="btn-primary inline-flex items-center"
            >
              <FiPlus className="mr-2" />
              List New Item
            </Link>
            <Link
              to="/browse"
              className="btn-secondary inline-flex items-center"
            >
              Browse Items
            </Link>
          </div>
        </div>

        {/* My Items */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">My Items</h2>
            <Link to="/add-item" className="text-primary-600 hover:text-primary-700">
              Add New Item
            </Link>
          </div>
          
          {userItems.length === 0 ? (
            <div className="text-center py-8">
              <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No items yet</h3>
              <p className="mt-1 text-sm text-gray-500">Start by listing your first item.</p>
              <div className="mt-6">
                <Link to="/add-item" className="btn-primary">
                  List Your First Item
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userItems.slice(0, 6).map((item) => (
                <div key={item._id} className="border rounded-lg overflow-hidden">
                  <img 
                    src={`http://localhost:5001/uploads/${item.images[0]}`}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <div className="flex justify-between items-center text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.status === 'available' ? 'bg-green-100 text-green-800' :
                        item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        item.status === 'swapped' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-primary-600 font-semibold">
                        {item.pointsValue} points
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Swap Requests Received (for your items) */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Swap Requests for Your Items</h2>
          
          {swapRequestsReceived.length === 0 ? (
            <div className="text-center py-8">
              <FiUser className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No swap requests yet</h3>
              <p className="mt-1 text-sm text-gray-500">When someone wants to swap for your items, they'll appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {swapRequestsReceived.map((swap) => (
                <div key={swap._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{swap.itemRequested?.title}</h4>
                      <p className="text-sm text-gray-600">
                        Requested by {swap.requester?.name}
                      </p>
                      {swap.swapType === 'direct' && swap.itemOffered && (
                        <p className="text-sm text-gray-600">
                          Offering: {swap.itemOffered.title}
                        </p>
                      )}
                      {swap.swapType === 'points' && (
                        <p className="text-sm text-gray-600">
                          Offering: {swap.pointsUsed} points
                        </p>
                      )}
                      {swap.message && (
                        <p className="text-sm text-gray-600 mt-1">
                          Message: "{swap.message}"
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(swap.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        swap.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        swap.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        swap.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {swap.status}
                      </span>
                      {swap.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAcceptSwap(swap._id)}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectSwap(swap._id)}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Swap Requests Sent (by you) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Swap Requests</h2>
          
          {swapRequestsSent.length === 0 ? (
            <div className="text-center py-8">
              <FiUser className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No swap requests sent</h3>
              <p className="mt-1 text-sm text-gray-500">Start browsing items to make your first swap request.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {swapRequestsSent.slice(0, 5).map((swap) => (
                <div key={swap._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{swap.itemRequested?.title}</h4>
                      <p className="text-sm text-gray-600">
                        Requested from {swap.itemRequested?.owner?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(swap.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      swap.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      swap.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      swap.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {swap.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
