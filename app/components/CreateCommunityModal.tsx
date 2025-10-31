import { useState } from 'react';
import { Plus, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';

interface CreateCommunityModalProps {
  show: boolean;
  onClose: () => void;
  creatorId: string; // pass the logged-in user id
  onCreated?: (community: any) => void; // optional callback after creation
}

export const CreateCommunityModal = ({
  show,
  onClose,
  creatorId,
  onCreated
}: CreateCommunityModalProps) => {
  const [name, setName] = useState('');
  const [communityImage, setCommunityImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCommunityImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setCommunityImage(null);
    setImagePreview('');
  };

  const handleCreate = async () => {
    if (!name.trim()) return;

    // Check if we have a valid creatorId
    if (!creatorId || creatorId.trim() === '') {
      alert('Error: No user session found. Please log in to create a community.');
      return;
    }

    try {
      setLoading(true);

      let profilePictureUrl = null;

      // If there's an image, upload it first using the API route
      if (communityImage) {
        try {
          const formData = new FormData();
          formData.append('file', communityImage);

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            profilePictureUrl = uploadResult.url;
            console.log('Image uploaded successfully:', uploadResult.url);
          } else {
            throw new Error('Upload failed');
          }
        } catch (imageError) {
          console.error('Failed to upload community image:', imageError);
          // Continue without image if upload fails
        }
      }

      // Create the community with all data including image URL
      // Auto-generate description from name if not provided
      const communityData = {
        name: name.trim(),
        description: `Welcome to ${name.trim()}! Join us to connect and share.`,
        creatorId: creatorId,
        ...(profilePictureUrl && { profile_picture_url: profilePictureUrl })
      };

      console.log('Creating community with data:', communityData);
      console.log('CreatorId:', creatorId, 'Type:', typeof creatorId);

      const res = await fetch('https://server.blazeswap.io/api/snaps/communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(communityData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Community creation failed:', errorText);
        throw new Error(`Failed to create community: ${res.status} ${errorText}`);
      }

      const data = await res.json();
      console.log('Community created successfully:', data);

      if (onCreated) onCreated(data);

      // Reset form
      setName('');
      setCommunityImage(null);
      setImagePreview('');
      onClose();
    } catch (err) {
      console.error(err);
      alert(`Error creating community: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="absolute top-0 inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black border-2 border-gray-700/70 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-[#6e54ff] rounded-xl flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Create Community</h3>
            <p className="text-sm text-gray-400">Build your own space</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Community Name</label>
            <input
              type="text"
              placeholder="Enter community name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="w-full px-4 py-3 bg-gray-800/50 text-white rounded-xl border-2 border-gray-700/70 focus:border-[#6e54ff] focus:outline-none transition-all duration-200"
            />
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Community Picture</label>
            <div className="space-y-3">
              {!imagePreview ? (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-700/70 border-dashed rounded-xl cursor-pointer bg-gray-800/30 hover:bg-gray-800/50 hover:border-[#6e54ff] transition-all duration-200">
                  <div className="flex flex-col items-center justify-center py-6">
                    <ImageIcon className="w-10 h-10 mb-3 text-[#6e54ff]" />
                    <p className="text-sm text-gray-300 font-medium">Click to upload picture</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              ) : (
                <div className="relative">
                  <Image
                    src={imagePreview}
                    alt="Community preview"
                    width={400}
                    height={200}
                    className="w-full h-40 object-cover rounded-xl border-2 border-gray-700/70"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl border-2 border-gray-700/70 transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!name.trim() || loading}
              className="flex-1 px-6 py-3 bg-[#6e54ff] hover:bg-[#5a45d9] disabled:bg-gray-700 disabled:border-gray-700/70 text-white font-medium rounded-xl border-2 border-[#6e54ff] disabled:border-gray-700/70 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
