import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiX } from 'react-icons/fi';
import axios from 'axios';

const AddItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: '',
    size: '',
    condition: '',
    pointsValue: '',
    tags: '',
    brand: '',
    color: '',
    material: ''
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.type) {
      newErrors.type = 'Type is required';
    }

    if (!formData.size) {
      newErrors.size = 'Size is required';
    }

    if (!formData.condition) {
      newErrors.condition = 'Condition is required';
    }

    if (!formData.pointsValue) {
      newErrors.pointsValue = 'Points value is required';
    } else if (formData.pointsValue < 10 || formData.pointsValue > 500) {
      newErrors.pointsValue = 'Points value must be between 10 and 500';
    }

    if (images.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          // Convert pointsValue to number if it's a number field
          if (key === 'pointsValue') {
            formDataToSend.append(key, parseInt(formData[key]));
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      // Add images
      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      // Debug: Check if user is authenticated
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('Form data being sent:', Object.fromEntries(formDataToSend.entries()));

      const response = await axios.post('/items', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Success response:', response.data);
      alert('Item listed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating item:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      if (error.response?.data?.errors) {
        const serverErrors = {};
        error.response.data.errors.forEach(err => {
          serverErrors[err.param] = err.msg;
        });
        setErrors(serverErrors);
        console.log('Validation errors:', serverErrors);
      } else if (error.response?.data?.message) {
        // Show general error message
        alert(`Error: ${error.response.data.message}`);
        console.log('Server error message:', error.response.data.message);
      } else if (error.message) {
        alert(`Network Error: ${error.message}`);
        console.log('Network error:', error.message);
      } else {
        alert('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">List New Item</h1>
          <p className="text-gray-600">Share your clothing with the community</p>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Images Upload */}
            <div>
              <label className="form-label">Images (up to 5)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                      <span>Upload images</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB each</p>
                </div>
              </div>
              {errors.images && (
                <p className="mt-1 text-sm text-red-600">{errors.images}</p>
              )}
              
              {/* Image Preview */}
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="form-label">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="e.g., Vintage Denim Jacket"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label htmlFor="pointsValue" className="form-label">Points Value</label>
                <input
                  type="number"
                  id="pointsValue"
                  name="pointsValue"
                  min="10"
                  max="500"
                  value={formData.pointsValue}
                  onChange={handleChange}
                  className={`input-field ${errors.pointsValue ? 'border-red-500' : ''}`}
                  placeholder="10-500"
                />
                {errors.pointsValue && (
                  <p className="mt-1 text-sm text-red-600">{errors.pointsValue}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className={`input-field ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Describe your item in detail..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Category and Type */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="form-label">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`input-field ${errors.category ? 'border-red-500' : ''}`}
                >
                  <option value="">Select category</option>
                  <option value="tops">Tops</option>
                  <option value="bottoms">Bottoms</option>
                  <option value="dresses">Dresses</option>
                  <option value="outerwear">Outerwear</option>
                  <option value="shoes">Shoes</option>
                  <option value="accessories">Accessories</option>
                  <option value="other">Other</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              <div>
                <label htmlFor="type" className="form-label">Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={`input-field ${errors.type ? 'border-red-500' : ''}`}
                >
                  <option value="">Select type</option>
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                  <option value="sportswear">Sportswear</option>
                  <option value="vintage">Vintage</option>
                  <option value="designer">Designer</option>
                  <option value="other">Other</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                )}
              </div>
            </div>

            {/* Size and Condition */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="size" className="form-label">Size</label>
                <select
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className={`input-field ${errors.size ? 'border-red-500' : ''}`}
                >
                  <option value="">Select size</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                  <option value="One Size">One Size</option>
                </select>
                {errors.size && (
                  <p className="mt-1 text-sm text-red-600">{errors.size}</p>
                )}
              </div>

              <div>
                <label htmlFor="condition" className="form-label">Condition</label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className={`input-field ${errors.condition ? 'border-red-500' : ''}`}
                >
                  <option value="">Select condition</option>
                  <option value="new">New</option>
                  <option value="like-new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="worn">Worn</option>
                </select>
                {errors.condition && (
                  <p className="mt-1 text-sm text-red-600">{errors.condition}</p>
                )}
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="brand" className="form-label">Brand (Optional)</label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Nike, Zara"
                />
              </div>

              <div>
                <label htmlFor="color" className="form-label">Color (Optional)</label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Blue, Red"
                />
              </div>

              <div>
                <label htmlFor="material" className="form-label">Material (Optional)</label>
                <input
                  type="text"
                  id="material"
                  name="material"
                  value={formData.material}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Cotton, Denim"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tags" className="form-label">Tags (Optional)</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., vintage, sustainable, designer (comma separated)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Add tags to help others find your item
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'List Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItem; 
