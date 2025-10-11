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
  const [description, setDescription] = useState('');
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
    if (!name.trim() || !description.trim()) return;

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

      // Create the community with all data including image URL (constraint fixed)
      const communityData = {
        name: name.trim(),
        description: description.trim(),
        creatorId: creatorId,
        ...(profilePictureUrl && { profile_picture_url: profilePictureUrl })
      };

      console.log('Creating community with data:', communityData);
      console.log('CreatorId:', creatorId, 'Type:', typeof creatorId);

      const res = await fetch('http://server.blazeswap.io/api/snaps/communities', {
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
      setDescription('');
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
    <div className="absolute top-0 inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 w-full max-w-md border border-slate-700/50 shadow-2xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Create Community</h3>
            <p className="text-sm text-slate-400">Build your own space</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 bg-gray-800 p-2 rounded">
              <div>Creator ID: {creatorId || 'None'}</div>
              <div>Type: {typeof creatorId}</div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Community Name</label>
            <input
              type="text"
              placeholder="Enter community name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              placeholder="Describe your community..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
              rows={3}
            />
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Community Image (Optional)</label>
            <div className="space-y-3">
              {!imagePreview ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-600/50 border-dashed rounded-xl cursor-pointer bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 mb-2 text-slate-400" />
                    <p className="text-sm text-slate-400">Click to upload image</p>
                    <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
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
                    className="w-full h-32 object-cover rounded-xl"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-3 pt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!name.trim() || !description.trim() || loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Community'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
