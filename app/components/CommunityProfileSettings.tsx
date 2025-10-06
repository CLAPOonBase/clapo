"use client";

import React, { useState } from 'react';
import { Camera, X, Save, Upload } from 'lucide-react';
import { useCommunityProfile } from '@/app/hooks/useCommunityProfile';

interface CommunityProfileSettingsProps {
  communityId: string;
  onClose: () => void;
}

export const CommunityProfileSettings: React.FC<CommunityProfileSettingsProps> = ({ 
  communityId, 
  onClose 
}) => {
  console.log('CommunityProfileSettings rendered with communityId:', communityId);
  const { communityProfile, updateCommunityProfile, loading } = useCommunityProfile(communityId);
  const [formData, setFormData] = useState({
    name: communityProfile?.name || '',
    description: communityProfile?.description || '',
    profile_picture_url: communityProfile?.profile_picture_url || '',
    cover_image_url: communityProfile?.cover_image_url || '',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'profile' | 'cover' | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (file: File, type: 'profile' | 'cover') => {
    setUploading(true);
    setUploadType(type);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }
      
      const uploadResult = await uploadResponse.json();
      console.log(`${type} image uploaded successfully:`, uploadResult.url);
      
      const fieldName = type === 'profile' ? 'profile_picture_url' : 'cover_image_url';
      handleInputChange(fieldName, uploadResult.url);
    } catch (error) {
      console.error(`Failed to upload ${type} picture:`, error);
      alert(`Failed to upload ${type} picture. Please try again.`);
    } finally {
      setUploading(false);
      setUploadType(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateCommunityProfile(communityId, formData);
      onClose();
    } catch (error) {
      console.error('Failed to update community profile:', error);
      alert('Failed to update community profile. Please try again.');
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'profile');
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'cover');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Community Profile Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Image */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Cover Image
            </label>
            <div className="relative">
              <div className="w-full h-32 bg-gray-800 rounded-lg overflow-hidden">
                {formData.cover_image_url ? (
                  <img
                    src={formData.cover_image_url}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera size={32} className="text-gray-400" />
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="hidden"
                id="cover-upload"
              />
              <label
                htmlFor="cover-upload"
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              >
                {uploading && uploadType === 'cover' ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <Upload size={20} className="text-white" />
                )}
              </label>
            </div>
          </div>

          {/* Profile Picture */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gray-800 rounded-full overflow-hidden">
                  {formData.profile_picture_url ? (
                    <img
                      src={formData.profile_picture_url}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera size={24} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                  id="profile-upload"
                />
                <label
                  htmlFor="profile-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-full"
                >
                  {uploading && uploadType === 'profile' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Upload size={16} className="text-white" />
                  )}
                </label>
              </div>
              <div className="flex-1">
                <p className="text-gray-400 text-sm">
                  Click on the profile picture to upload a new one
                </p>
              </div>
            </div>
          </div>

          {/* Community Name */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Community Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter community name"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Describe your community"
              rows={4}
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {formData.description.length}/500
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
