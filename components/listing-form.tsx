'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, X } from 'lucide-react';
import { createListingAction, type ListingActionState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  MAX_DESCRIPTION_LENGTH,
  validateListingImage,
} from '@/lib/listing-utils';

const initialState: ListingActionState = {
  status: 'idle',
  message: 'Fill in the details and publish your listing.',
};

type ListingFormProps = {
  defaultOwnerName: string;
};

export function ListingForm({ defaultOwnerName }: ListingFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, formAction, pending] = useActionState(
    createListingAction,
    initialState
  );

  const [listingType, setListingType] = useState('Free');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<{ file: File; url: string }[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (state.status === 'success' && state.listingId) {
      router.push(`/listings/${state.listingId}`);
    }
  }, [state.status, state.listingId, router]);

  useEffect(() => {
    return () => {
      selectedFiles.forEach((f) => URL.revokeObjectURL(f.url));
    };
  }, [selectedFiles]);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (selectedFiles.length + files.length > 5) {
      setImageError('Maximum 5 images per listing.');
      return;
    }

    const newEntries: { file: File; url: string }[] = [];

    for (const file of files) {
      const validationError = validateListingImage(file);
      if (validationError) {
        setImageError(validationError);
        return;
      }
      newEntries.push({ file, url: URL.createObjectURL(file) });
    }

    setImageError(null);
    setSelectedFiles((prev) => [...prev, ...newEntries]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function removeImage(index: number) {
    setSelectedFiles((prev) => {
      const target = prev[index];
      if (target) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.delete('images');
    formData.delete('image');

    selectedFiles.forEach(({ file }) => {
      formData.append('images', file);
    });

    formAction(formData);
  }

  return (
    <div className="rounded-2xl border border-stone-light/80 bg-white p-5 sm:p-6 shadow-2xs">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Listing Type Toggle Pill Bar */}
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-ink-3">Listing Type</Label>
          <input type="hidden" name="itemType" value={listingType} />
          <div className="mt-2 grid grid-cols-3 gap-1.5 rounded-xl border border-stone-light/80 bg-cream p-1 text-xs font-medium">
            {['Free', 'For sale', 'Borrow'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setListingType(type)}
                className={`rounded-lg py-2 transition ${
                  listingType === type
                    ? 'bg-ink font-semibold text-cream shadow-2xs'
                    : 'text-ink-2 hover:bg-stone-light/50'
                }`}
              >
                {type === 'For sale' ? 'For Sale' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Item Title */}
        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-xs font-semibold text-ink">Item Title *</Label>
          <Input
            id="title"
            name="title"
            placeholder="e.g. MacBook Charger, Graphing Calculator, Study Lamp"
            required
            className="h-10 text-sm border-stone-light/80 focus:border-ink rounded-xl"
          />
        </div>

        {/* Price if For sale */}
        {listingType === 'For sale' && (
          <div className="space-y-1.5 animate-in fade-in duration-200">
            <Label htmlFor="price" className="text-xs font-semibold text-ink">Price (₹) *</Label>
            <Input
              id="price"
              name="price"
              placeholder="e.g. 600"
              required
              className="h-10 text-sm border-stone-light/80 focus:border-ink rounded-xl"
            />
          </div>
        )}

        {/* Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="description" className="text-xs font-semibold text-ink">Description</Label>
            <span className="text-[10px] text-ink-3">
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </span>
          </div>
          <Textarea
            id="description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={MAX_DESCRIPTION_LENGTH}
            placeholder="Item condition, notes, or details..."
            className="min-h-[80px] text-sm border-stone-light/80 focus:border-ink rounded-xl"
          />
        </div>

        {/* Pickup Location & Condition Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="pickupLocation" className="text-xs font-semibold text-ink">Pickup Spot</Label>
            <Input
              id="pickupLocation"
              name="pickupLocation"
              placeholder="e.g. Library / Hostel 4"
              className="h-10 text-sm border-stone-light/80 focus:border-ink rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="condition" className="text-xs font-semibold text-ink">Condition</Label>
            <select
              id="condition"
              name="condition"
              className="h-10 w-full rounded-xl border border-stone-light/80 bg-white px-3 text-sm text-ink outline-none focus:border-ink"
            >
              <option value="">Select condition</option>
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>
          </div>
        </div>

        {/* Owner Name */}
        <div className="space-y-1.5">
          <Label htmlFor="ownerName" className="text-xs font-semibold text-ink">Your Name *</Label>
          <Input
            id="ownerName"
            name="ownerName"
            defaultValue={defaultOwnerName}
            required
            className="h-10 text-sm border-stone-light/80 focus:border-ink rounded-xl"
          />
        </div>

        {/* Upload Photos */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-ink">Item Photos ({selectedFiles.length}/5)</Label>
          <input
            ref={fileInputRef}
            id="image"
            name="images"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={handleImageChange}
          />

          {selectedFiles.length > 0 ? (
            <div className="grid grid-cols-4 gap-2 pt-1">
              {selectedFiles.map((item, index) => (
                <div
                  key={`${item.url}-${index}`}
                  className="group relative h-20 w-full overflow-hidden rounded-xl border border-stone-light/80 bg-cream"
                >
                  <img
                    src={item.url}
                    alt={`Photo ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-1 top-1 rounded-full bg-ink/80 p-1 text-white hover:bg-red-600 transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {selectedFiles.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-20 w-full items-center justify-center rounded-xl border border-dashed border-stone bg-cream/40 hover:bg-cream transition"
                >
                  <ImagePlus className="h-4 w-4 text-ink-3" />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-stone-light/80 bg-cream/30 py-3 text-xs text-ink-2 hover:border-stone hover:bg-cream/60 transition"
            >
              <ImagePlus className="h-4 w-4 text-ink-3" />
              Upload Photos (Optional, up to 5)
            </button>
          )}

          {imageError ? (
            <p className="text-xs text-red-600">{imageError}</p>
          ) : null}
        </div>

        {/* Status Message */}
        {state.status !== 'idle' && (
          <div
            className={`rounded-xl border px-3 py-2 text-xs font-medium ${
              state.status === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-green-200 bg-green-50 text-green-700'
            }`}
          >
            {state.message}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={pending || Boolean(imageError)}
            className="h-11 w-full rounded-xl bg-ink font-medium text-cream hover:bg-ink-2 shadow-2xs transition"
          >
            {pending ? 'Publishing...' : 'Publish Listing'}
          </Button>
        </div>
      </form>
    </div>
  );
}
