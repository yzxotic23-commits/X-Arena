'use client';

import { useState, useEffect } from 'react';
import { X, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChangeAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string;
  onSave: (avatarUrl: string) => Promise<void>;
  onRemove: () => Promise<void>;
  saving?: boolean;
}

export function ChangeAvatarModal({
  isOpen,
  onClose,
  currentAvatar,
  onSave,
  onRemove,
  saving = false,
}: ChangeAvatarModalProps) {
  const [avatarUrl, setAvatarUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar || null);

  useEffect(() => {
    if (isOpen) {
      setAvatarUrl('');
      setPreviewUrl(currentAvatar || null);
    }
  }, [isOpen, currentAvatar]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setAvatarUrl(url);
    // Update preview if valid URL
    if (url.trim()) {
      setPreviewUrl(url.trim());
    } else {
      setPreviewUrl(currentAvatar || null);
    }
  };

  const handleSave = async () => {
    if (!avatarUrl.trim()) {
      return;
    }

    // Validate URL format
    try {
      new URL(avatarUrl.trim());
    } catch {
      alert('URL tidak valid. Pastikan URL dimulai dengan http:// atau https://');
      return;
    }

    // Validate URL has image extension
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const urlLower = avatarUrl.toLowerCase();
    const hasImageExtension = imageExtensions.some(ext => urlLower.includes(ext));

    if (!hasImageExtension) {
      alert('URL harus memiliki ekstensi gambar (.jpg, .png, dll)');
      return;
    }

    await onSave(avatarUrl.trim());
  };

  const handleRemove = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus avatar saat ini?')) {
      await onRemove();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card-glass rounded-lg w-full max-w-md mx-4 shadow-xl border border-card-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-card-border">
          <h2 className="text-xl font-semibold text-foreground-primary font-heading">
            Change Profile Picture
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground-primary transition-colors"
            disabled={saving}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Avatar Display */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-card-border bg-card-inner">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                    onError={() => {
                      // If current input URL fails, fallback to current avatar or null
                      if (avatarUrl.trim()) {
                        setPreviewUrl(currentAvatar || null);
                      } else {
                        setPreviewUrl(null);
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted">
                    <span className="text-2xl">?</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Image URL Input */}
          <div>
            <label className="block text-sm font-semibold text-foreground-primary mb-2">
              IMAGE URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={handleUrlChange}
              placeholder="https://i.imgur.com/example.jpg"
              className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-card-border rounded-lg text-foreground-primary placeholder-muted focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving}
            />
          </div>

          {/* Instructions */}
          <div className="bg-card-inner border border-card-border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground-primary mb-2">
                  How to add avatar:
                </h3>
                <ol className="text-sm text-muted space-y-1 list-decimal list-inside">
                  <li>
                    Upload your image to{' '}
                    <a
                      href="https://imgur.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-primary hover:opacity-80 transition-opacity"
                    >
                      Imgur
                    </a>{' '}
                    or{' '}
                    <a
                      href="https://postimages.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-primary hover:opacity-80 transition-opacity"
                    >
                      Postimages
                    </a>
                  </li>
                  <li>Copy the direct image URL (must include .jpg, .png, etc.)</li>
                  <li>Paste the URL in the input box above</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Remove Current Avatar Button */}
          {currentAvatar && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              disabled={saving}
              className="w-full border-red-600/40 dark:border-red-600/40 text-red-600 dark:text-red-400 hover:bg-red-600/10 dark:hover:bg-red-600/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Current Avatar
            </Button>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center gap-3 p-4 sm:p-6 border-t border-card-border bg-card-inner/20">
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            disabled={saving}
            size="default"
            className="flex-1 h-10"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSave();
            }}
            disabled={saving || !avatarUrl.trim()}
            size="default"
            className="flex-1 h-10"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
