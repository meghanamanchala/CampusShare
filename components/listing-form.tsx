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
      setImageError('You can upload a maximum of 5 images per listing.');
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
    <Card className="overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] border border-stone-light bg-white shadow-soft">
      <CardHeader className="border-b border-stone-light/80 bg-cream/40 px-4 py-5 sm:px-6 sm:py-6">
        <div className="inline-flex w-fit items-center rounded-full bg-green-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-green">
          Campus Listing
        </div>

        <CardTitle className="mt-4 font-serif text-2xl sm:text-3xl md:text-4xl text-ink">
          Post an Item
        </CardTitle>

        <CardDescription className="max-w-xl text-sm sm:text-base leading-6 sm:leading-7 text-ink-3">
          Add a photo and short description so students can find your item quickly.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 px-4 py-5 sm:px-6 sm:py-8">
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
            <Label htmlFor="condition">Condition</Label>

            <select
              id="condition"
              name="condition"
              className="h-12 w-full rounded-xl border border-stone-light px-4"
            >
              <option value="">Select condition</option>
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickupLocation">
              Pickup Location
            </Label>

            <Input
              id="pickupLocation"
              name="pickupLocation"
              placeholder="Library Entrance"
            />
          </div>


          <div className="grid gap-4 md:grid-cols-2">
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

            {listingType === 'For sale' && (
              <div className="space-y-3">
                <Label htmlFor="price">Price</Label>

                <Input
                  id="price"
                  name="price"
                  placeholder="₹600"
                  required
                />

                <label className="flex items-center gap-2 text-sm text-ink-2">
                  <input
                    type="checkbox"
                    name="negotiable"
                  />
                  Negotiable
                </label>
              </div>
            )}
          </div>

          {listingType === 'Borrow' && (
            <div className="space-y-4 rounded-xl border border-stone-light p-4">
              <h3 className="font-medium text-ink">
                Borrow Details
              </h3>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="borrowType"
                    value="request"
                  />
                  I need to borrow this
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="borrowType"
                    value="offer"
                    defaultChecked
                  />
                  I am lending this out
                </label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="borrowDuration">
                  Maximum Duration
                </Label>

                <Input
                  id="borrowDuration"
                  name="borrowDuration"
                  placeholder="7 days"
                />
              </div>
            </div>
          )}


          <div className="space-y-3">
            <Label htmlFor="contactMethod">
              Contact Method
            </Label>

            <select
              id="contactMethod"
              name="contactMethod"
              className="h-12 w-full rounded-xl border border-stone-light px-4"
            >
              <option value="email">
                Share Institutional Email
              </option>

              <option value="phone">
                WhatsApp / Phone
              </option>

              <option value="chat">
                In-App Chat
              </option>
            </select>
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
            <div className="flex items-center justify-between">
              <Label htmlFor="image">Item Photos ({selectedFiles.length}/5)</Label>
              <span className="text-xs text-ink-3">Upload up to 5 photos</span>
            </div>

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
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedFiles.map((item, index) => (
                    <div
                      key={`${item.url}-${index}`}
                      className="group relative h-32 w-full overflow-hidden rounded-2xl border border-stone-light bg-cream-dark shadow-sm"
                    >
                      <img
                        src={item.url}
                        alt={`Photo ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-2 top-2 rounded-full bg-ink/80 p-1.5 text-cream transition hover:bg-red-600"
                        aria-label={`Remove photo ${index + 1}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <span className="absolute bottom-1.5 left-2 rounded-md bg-ink/70 px-1.5 py-0.5 text-[10px] font-semibold text-cream">
                        {index === 0 ? 'Primary' : `#${index + 1}`}
                      </span>
                    </div>
                  ))}
                </div>

                {selectedFiles.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-stone bg-cream/40 py-3 text-xs font-semibold text-ink transition hover:bg-cream"
                  >
                    <ImagePlus className="h-4 w-4" />
                    Add More Photos ({5 - selectedFiles.length} remaining)
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-stone bg-cream/60 px-4 py-8 sm:px-6 sm:py-10 text-center transition hover:border-ink hover:bg-cream"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <ImagePlus className="h-5 w-5 text-ink-2" />
                </span>
                <span className="mt-4 text-sm font-medium text-ink">
                  Upload Item Photos (Up to 5)
                </span>
                <span className="mt-1 text-xs text-ink-3">
                  JPEG, PNG, WebP, or GIF up to 5 MB each
                </span>
              </button>
            )}

            {imageError ? (
              <p className="text-sm text-red-600">{imageError}</p>
            ) : null}
          </div>



          <div className="rounded-xl sm:rounded-2xl border border-stone-light bg-cream-dark p-4">
            <h3 className="font-medium text-ink">Tips for faster responses</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-3">
              <li>Add a clear photo in good lighting</li>
              <li>Mention condition and pickup location in the description</li>
              <li>Use a specific title students can search for</li>
            </ul>
          </div>

          <div
            className={`rounded-xl sm:rounded-2xl border px-4 py-3 text-sm ${state.status === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : state.status === 'success'
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-neutral-200 bg-neutral-50 text-neutral-600'
              }`}
          >
            {state.message}
          </div>
        </CardContent>

        <CardFooter
          className="
  sticky
  bottom-0
  z-20
  bg-white
  border-t
  border-stone-light
  px-4
  py-4
  shadow-[0_-4px_12px_rgba(0,0,0,0.05)]
"
        >

          <Button
            type="submit"
            disabled={pending || Boolean(imageError)}
            className="h-11 sm:h-12 w-full rounded-xl bg-ink text-cream hover:bg-ink-2"
          >
            {pending ? 'Posting...' : 'Post Listing'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
