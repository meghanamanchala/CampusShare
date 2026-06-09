'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, X } from 'lucide-react';
import { createListingAction, type ListingActionState } from '@/app/actions';
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  useEffect(() => {
    if (state.status === 'success' && state.listingId) {
      router.push(`/listings/${state.listingId}`);
    }
  }, [state.status, state.listingId, router]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setImagePreview(null);
      setSelectedFileName(null);
      setImageError(null);
      return;
    }

    const validationError = validateListingImage(file);

    if (validationError) {
      setImageError(validationError);
      setImagePreview(null);
      setSelectedFileName(null);
      event.target.value = '';
      return;
    }

    setImageError(null);
    setSelectedFileName(file.name);
    setImagePreview((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return URL.createObjectURL(file);
    });
  }

  function clearImage() {
    if (imagePreview) {
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
    <Card className="overflow-hidden rounded-[2rem] border border-stone-light bg-white shadow-soft">
      <CardHeader className="border-b border-stone-light/80 bg-cream/40 pb-6">
        <div className="inline-flex w-fit items-center rounded-full bg-green-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-green">
          Campus Listing
        </div>

        <CardTitle className="mt-4 font-serif text-4xl text-ink">
          Post an Item
        </CardTitle>

        <CardDescription className="max-w-xl text-base leading-7 text-ink-3">
          Add a photo and short description so students can find your item quickly.
        </CardDescription>
      </CardHeader>

      <form action={formAction} encType="multipart/form-data">
        <CardContent className="space-y-7 px-6 py-8">
          <div className="space-y-2">
            <Label htmlFor="title">Item Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="MacBook charger, study chair, calculator..."
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
              placeholder="Condition, pickup spot, borrow duration, or anything helpful for the next student..."
            />
            <p className="text-xs text-ink-3">
              Optional. {description.length}/{MAX_DESCRIPTION_LENGTH} characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerName">Your Name</Label>
            <Input
              id="ownerName"
              name="ownerName"
              defaultValue={defaultOwnerName}
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
              <div className="overflow-hidden rounded-[1.5rem] border border-stone-light bg-cream-dark">
                <div className="relative aspect-[16/10] w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Selected item preview"
                    className="h-full w-full object-cover"
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
                <p className="px-4 py-3 text-sm text-ink-3">{selectedFileName}</p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-stone bg-cream/60 px-6 py-10 text-center transition hover:border-ink hover:bg-cream"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <ImagePlus className="h-5 w-5 text-ink-2" />
                </span>
                <span className="mt-4 text-sm font-medium text-ink">
                  Upload a photo
                </span>
                <span className="mt-1 text-xs text-ink-3">
                  JPEG, PNG, WebP, or GIF up to 5 MB
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
                  placeholder="600"
                  inputMode="numeric"
                  required
                  className="h-12"
                />
              </div>
            ) : (
              <div className="rounded-2xl bg-cream-dark px-4 py-3 text-sm leading-6 text-ink-2">
                {listingType === 'Borrow'
                  ? 'Borrow listings do not need a price.'
                  : 'Free listings do not need a price.'}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-stone-light bg-cream-dark p-4">
            <h3 className="font-medium text-ink">Tips for faster responses</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-3">
              <li>Add a clear photo in good lighting</li>
              <li>Mention condition and pickup location in the description</li>
              <li>Use a specific title students can search for</li>
            </ul>
          </div>

          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              state.status === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : state.status === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-neutral-200 bg-neutral-50 text-neutral-600'
            }`}
          >
            {state.message}
          </div>
        </CardContent>

        <CardFooter className="border-t border-stone-light/80 bg-cream/30 px-6 py-6">
          <Button
            type="submit"
            disabled={pending || Boolean(imageError)}
            className="h-12 w-full rounded-xl bg-ink text-cream hover:bg-ink-2"
          >
            {pending ? 'Posting...' : 'Post Listing'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
