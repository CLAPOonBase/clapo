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
    <div className="absolute top-0 inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 w-full max-w-md border border-slate-700/50 shadow-2xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Update Profile</h3>
            <p className="text-sm text-slate-400">Edit your profile information</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-slate-600/50">
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
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Camera className="w-3 h-3 text-white" />
              </div>
            </div>
            
            {/* Upload Controls */}
            <div className="flex items-center space-x-2">
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
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white text-sm rounded-lg transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
              </button>
              {uploadedImage && (
                <button
                  onClick={handleRemoveImage}
                  disabled={isUploading}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white text-sm rounded-lg transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                  <span>Remove</span>
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 text-center">
              Upload a new profile picture (JPEG, PNG, GIF, WebP, max 5MB)
            </p>
          </div>

          {/* Username Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
            <input
              type="text"
              placeholder="Enter username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            />
          </div>
          
          {/* Bio Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
            <textarea
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none"
              rows={3}
              maxLength={200}
            />
            <div className="text-right mt-1">
              <span className="text-xs text-slate-400">{bio.length}/200</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              onClick={handleUpdate}
              disabled={!username.trim() || !hasChanges || isLoading || isUploading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
              className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
