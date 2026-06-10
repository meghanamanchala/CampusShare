'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, X } from 'lucide-react';
import { updateListingAction, type ListingActionState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  MAX_DESCRIPTION_LENGTH,
  validateListingImage,
} from '@/lib/listing-utils';

const initialState: ListingActionState = {
  status: 'idle',
  message: 'Update your listing details below.',
};

type EditListingFormProps = {
  listing: {
    id: string;
    title: string;
    ownerName: string;
    description: string;
    itemType: string;
    price: string;
    imageUrl: string | null;
  };
};

export function EditListingForm({ listing }: EditListingFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, formAction, pending] = useActionState(
    updateListingAction,
    initialState
  );

  const [listingType, setListingType] = useState(listing.itemType);
  const [description, setDescription] = useState(listing.description);
  const [imagePreview, setImagePreview] = useState<string | null>(
    listing.imageUrl
  );
  const [imageError, setImageError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(
    listing.imageUrl ? 'Current photo' : null
  );

  useEffect(() => {
    if (state.status === 'success' && state.listingId) {
      router.push(`/listings/${state.listingId}`);
    }
  }, [state.status, state.listingId, router]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview !== listing.imageUrl) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview, listing.imageUrl]);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setImagePreview(listing.imageUrl);
      setSelectedFileName(listing.imageUrl ? 'Current photo' : null);
      setImageError(null);
      return;
    }

    const validationError = validateListingImage(file);

    if (validationError) {
      setImageError(validationError);
      setImagePreview(listing.imageUrl);
      setSelectedFileName(listing.imageUrl ? 'Current photo' : null);
      event.target.value = '';
      return;
    }

    setImageError(null);
    setSelectedFileName(file.name);
    setImagePreview((current) => {
      if (current && current !== listing.imageUrl) {
        URL.revokeObjectURL(current);
      }

      return URL.createObjectURL(file);
    });
  }

  function clearImage() {
    if (imagePreview && imagePreview !== listing.imageUrl) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview(null);
    setSelectedFileName(null);
    setImageError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <Card className="overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] border border-stone-light bg-white shadow-soft">
      <CardHeader className="border-b border-stone-light/80 bg-cream/40 px-4 py-5 sm:px-6 sm:py-6">
        <CardTitle className="font-serif text-3xl sm:text-4xl text-ink">
          Edit Listing
        </CardTitle>
        <CardDescription className="text-ink-3">
          Update details students see in the campus feed.
        </CardDescription>
      </CardHeader>

      <form action={formAction} encType="multipart/form-data">
        <input type="hidden" name="listingId" value={listing.id} />

        <CardContent className="space-y-7 px-4 py-6 sm:px-6 sm:py-8">
          <div className="space-y-2">
            <Label htmlFor="title">Item Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={listing.title}
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={MAX_DESCRIPTION_LENGTH}
            />
            <p className="text-xs text-ink-3">
              {description.length}/{MAX_DESCRIPTION_LENGTH} characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerName">Your Name</Label>
            <Input
              id="ownerName"
              name="ownerName"
              defaultValue={listing.ownerName}
              required
              className="h-12"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="image">Item Photo</Label>

            <input
              ref={fileInputRef}
              id="image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={handleImageChange}
            />

            {imagePreview ? (
              <div className="overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem] border border-stone-light bg-cream-dark">
                <div className="relative flex items-center justify-center bg-white max-h-[500px] min-h-[300px] w-full">
                  <img
                    src={imagePreview}
                    alt="Listing preview"
                    className="max-h-[500px] max-w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute right-3 top-3 rounded-full bg-ink/80 p-2 text-cream transition hover:bg-ink"
                    aria-label="Remove selected image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="break-all px-4 py-3 text-sm text-ink-3">{selectedFileName}</p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-stone bg-cream/60 px-4 py-8 sm:px-6 sm:py-10 text-center transition hover:border-ink hover:bg-cream"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <ImagePlus className="h-5 w-5 text-ink-2" />
                </span>
                <span className="mt-4 text-sm font-medium text-ink">
                  Upload a new photo
                </span>
              </button>
            )}

            {imageError ? (
              <p className="text-sm text-red-600">{imageError}</p>
            ) : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="itemType">Listing Type</Label>
              <select
                id="itemType"
                name="itemType"
                value={listingType}
                onChange={(event) => setListingType(event.target.value)}
                className="h-12 w-full rounded-xl border border-stone-light bg-white px-4 text-sm text-ink outline-none transition focus:border-ink"
              >
                <option value="Free">Free</option>
                <option value="For sale">For Sale</option>
                <option value="Borrow">Borrow</option>
              </select>
            </div>

            {listingType === 'For sale' ? (
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  defaultValue={listing.price}
                  inputMode="numeric"
                  required
                  className="h-12"
                />
              </div>
            ) : null}
          </div>

          <div
            className={`break-words rounded-2xl border px-4 py-3 text-sm ${state.status === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : state.status === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-neutral-200 bg-neutral-50 text-neutral-600'
              }`}
          >
            {state.message}
          </div>
        </CardContent>

        <CardFooter className="border-t border-stone-light/80 bg-cream/30 px-4 py-4 sm:px-6 sm:py-6">
          <Button
            type="submit"
            disabled={pending || Boolean(imageError)}
            className="h-12 w-full rounded-xl bg-ink text-cream hover:bg-ink-2"
          >
            {pending ? 'Saving...' : 'Save changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
