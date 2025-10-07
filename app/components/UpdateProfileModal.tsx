import { useState, useEffect, useRef } from 'react';
import { User, Camera, Upload, X } from 'lucide-react';
import Image from 'next/image';

interface UpdateProfileModalProps {
  show: boolean;
  onClose: () => void;
  onUpdate: (data: { username?: string; bio?: string; avatarUrl?: string }) => void;
  currentProfile: {
    username: string;
    bio?: string;
    avatar_url?: string;
  };
}

export const UpdateProfileModal = ({
  show,
  onClose,
  onUpdate,
  currentProfile
}: UpdateProfileModalProps) => {
  const [username, setUsername] = useState(currentProfile.username || '');
  const [bio, setBio] = useState(currentProfile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentProfile.avatar_url || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form when currentProfile changes
  useEffect(() => {
    setUsername(currentProfile.username || '');
    setBio(currentProfile.bio || '');
    setAvatarUrl(currentProfile.avatar_url || '');
    setUploadedImage(null);
    setPreviewUrl('');
  }, [currentProfile]);

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 5MB' };
    }
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Only JPEG, PNG, GIF, and WebP images are allowed' };
    }
    return { isValid: true };
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    setUploadedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setAvatarUrl(result.url);
      setPreviewUrl(result.url);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
      setUploadedImage(null);
      setPreviewUrl('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setPreviewUrl('');
    setAvatarUrl(currentProfile.avatar_url || '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpdate = async () => {
    if (!username.trim()) return;
    
    setIsLoading(true);
    try {
      const updateData: { username?: string; bio?: string; avatarUrl?: string } = {};
      
      if (username.trim() !== currentProfile.username) {
        updateData.username = username.trim();
      }
      if (bio.trim() !== (currentProfile.bio || '')) {
        updateData.bio = bio.trim();
      }
      if (avatarUrl !== (currentProfile.avatar_url || '')) {
        updateData.avatarUrl = avatarUrl;
      }
      
      await onUpdate(updateData);
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = 
    username.trim() !== currentProfile.username ||
    bio.trim() !== (currentProfile.bio || '') ||
    avatarUrl !== (currentProfile.avatar_url || '');

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black border-2 border-gray-700/70 rounded-xl p-4 w-full max-w-lg shadow-custom">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
              backgroundColor: "#6E54FF",
              boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
            }}>
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Update Profile</h3>
              <p className="text-sm text-gray-400">Edit your profile information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading || isUploading}
            className="w-8 h-8 rounded-full bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-600">
                <Image
                  src={previewUrl || avatarUrl || currentProfile.avatar_url || '/4.png'}
                  alt="Profile avatar"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/4.png';
                  }}
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-full">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{
                backgroundColor: "#6E54FF",
                boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
              }}>
                <Camera className="w-3 h-3 text-white" />
              </div>
            </div>
            
            {/* Upload Controls */}
            <div className="flex items-center space-x-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/50 text-white text-sm rounded-xl border border-gray-600/30 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
              </button>
              {uploadedImage && (
                <button
                  onClick={handleRemoveImage}
                  disabled={isUploading}
                  className="px-3 py-2 bg-red-600/80 hover:bg-red-600 disabled:bg-red-800/50 text-white text-sm rounded-xl border border-red-500/30 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                  <span>Remove</span>
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 text-center">
              Upload a new profile picture (JPEG, PNG, GIF, WebP, max 5MB)
            </p>
          </div>

          {/* Username Field */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">Username</label>
            <input
              type="text"
              placeholder="Enter username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2.5 bg-black border-2 border-gray-700/70 text-white rounded-xl focus:border-[#6E54FF]/50 focus:outline-none transition-all duration-200 placeholder:text-gray-500"
            />
          </div>

          {/* Bio Field */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">Bio</label>
            <textarea
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2.5 bg-black border-2 border-gray-700/70 text-white rounded-xl focus:border-[#6E54FF]/50 focus:outline-none transition-all duration-200 resize-none placeholder:text-gray-500"
              rows={4}
              maxLength={200}
            />
            <div className="text-right mt-1">
              <span className="text-xs text-gray-400">{bio.length}/200</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              onClick={handleUpdate}
              disabled={!username.trim() || !hasChanges || isLoading || isUploading}
              className="flex-1 px-6 py-2 text-white text-sm font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              style={{
                backgroundColor: !username.trim() || !hasChanges || isLoading || isUploading ? "#6B7280" : "#6E54FF",
                boxShadow: !username.trim() || !hasChanges || isLoading || isUploading ? "none" : "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
              }}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Update Profile'
              )}
            </button>

            <button
              onClick={onClose}
              disabled={isLoading || isUploading}
              className="flex-1 px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white text-sm font-medium rounded-full border border-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
