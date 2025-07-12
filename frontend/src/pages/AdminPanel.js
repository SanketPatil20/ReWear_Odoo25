import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiTrash2, FiUsers, FiPackage, FiTrendingUp } from 'react-icons/fi';
import axios from 'axios';

const AdminPanel = () => {
  const [pendingItems, setPendingItems] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pendingRes, statsRes] = await Promise.all([
        axios.get('/admin/pending-items'),
        axios.get('/admin/stats')
      ]);
      setPendingItems(pendingRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (itemId) => {
    try {
      await axios.put(`/admin/approve-item/${itemId}`);
      setPendingItems(prev => prev.filter(item => item._id !== itemId));
      fetchData(); // Refresh stats
    } catch (error) {
      console.error('Error approving item:', error);
    }
  };

  const handleReject = async (itemId) => {
    try {
      await axios.put(`/admin/reject-item/${itemId}`);
      setPendingItems(prev => prev.filter(item => item._id !== itemId));
      fetchData(); // Refresh stats
    } catch (error) {
      console.error('Error rejecting item:', error);
    }
  };

  const handleRemove = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      try {
        await axios.delete(`/admin/remove-item/${itemId}`);
        setPendingItems(prev => prev.filter(item => item._id !== itemId));
        fetchData(); // Refresh stats
      } catch (error) {
        console.error('Error removing item:', error);
      }
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">Manage the ReWear platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <FiUsers className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <FiPackage className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalItems || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <FiPackage className="text-yellow-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingItems || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <FiTrendingUp className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Swaps</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedSwaps || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending Items ({pendingItems.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'pending' && (
              <div>
                {pendingItems.length === 0 ? (
                  <div className="text-center py-8">
                    <FiCheck className="mx-auto h-12 w-12 text-green-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No pending items</h3>
                    <p className="mt-1 text-sm text-gray-500">All items have been reviewed.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pendingItems.map((item) => (
                      <div key={item._id} className="border rounded-lg p-6">
                        <div className="flex items-start space-x-4">
                          <img
                            src={`http://localhost:5001/uploads/${item.images[0]}`}
                            alt={item.title}
                            className="w-24 h-24 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{item.title}</h3>
                            <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Category:</span> {item.category}
                              </div>
                              <div>
                                <span className="font-medium">Size:</span> {item.size}
                              </div>
                              <div>
                                <span className="font-medium">Condition:</span> {item.condition}
                              </div>
                              <div>
                                <span className="font-medium">Points:</span> {item.pointsValue}
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              Listed by: {item.owner?.name} ({item.owner?.email})
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprove(item._id)}
                              className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                              title="Approve"
                            >
                              <FiCheck />
                            </button>
                            <button
                              onClick={() => handleReject(item._id)}
                              className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                              title="Reject"
                            >
                              <FiX />
                            </button>
                            <button
                              onClick={() => handleRemove(item._id)}
                              className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                              title="Remove"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 