'use client';

import { useActionState, useState } from 'react';
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

const initialState: ListingActionState = {
  status: 'idle',
  message: 'Fill in the details and publish your listing.',
};

type ListingFormProps = {
  defaultOwnerName: string;
};

export function ListingForm({ defaultOwnerName }: ListingFormProps) {
  const [state, formAction, pending] = useActionState(
    createListingAction,
    initialState
  );

  const [listingType, setListingType] = useState('Free');

  return (
    <Card className="overflow-hidden rounded-[2rem] border border-stone-light bg-white shadow-soft">
      <CardHeader className="pb-6">
        <div className="inline-flex w-fit items-center rounded-full bg-green-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-green">
          Campus Listing
        </div>

        <CardTitle className="mt-4 font-serif text-4xl text-ink">
          Post an Item
        </CardTitle>

        <CardDescription className="text-ink-3">
          Your listing will instantly appear in the campus feed.
        </CardDescription>
      </CardHeader>

      <form action={formAction} encType="multipart/form-data">
        <CardContent className="space-y-6">
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
            <Label htmlFor="ownerName">Your Name</Label>
            <Input
              id="ownerName"
              name="ownerName"
              defaultValue={defaultOwnerName}
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Item Photo</Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              className="cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemType">Listing Type</Label>

            <select
              id="itemType"
              name="itemType"
              value={listingType}
              onChange={(e) => setListingType(e.target.value)}
              className="h-12 w-full rounded-xl border border-stone-light bg-white px-4 text-sm text-ink"
            >
              <option value="Free">Free</option>
              <option value="For sale">For Sale</option>
              <option value="Borrow">Borrow</option>
            </select>
          </div>

          {listingType === 'For sale' && (
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>

              <Input
                id="price"
                name="price"
                placeholder="₹600"
                inputMode="numeric"
                className="h-12"
              />
            </div>
          )}

          <div className="rounded-2xl bg-cream-dark p-4 text-sm text-ink-2">
            {listingType === 'For sale'
              ? 'Enter the selling price for your item.'
              : 'No price required for Free or Borrow listings.'}
          </div>

          <div className="rounded-2xl border border-stone-light bg-cream-dark p-4">
            <h3 className="font-medium text-ink">
              Tips for faster responses
            </h3>

            <ul className="mt-3 space-y-2 text-sm text-ink-3">
              <li>📷 Add a clear photo</li>
              <li>📝 Use a descriptive title</li>
              <li>💰 Set a realistic price</li>
              <li>⚡ Respond quickly to interested students</li>
            </ul>
          </div>
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${state.status === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : state.status === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-neutral-200 bg-neutral-50 text-neutral-600'
              }`}
          >
            {state.message}
          </div>
        </CardContent>

        <CardFooter className="px-6 pb-6 pt-2">
          <Button
            type="submit"
            disabled={pending}
            className="h-12 w-full rounded-xl bg-ink text-cream hover:bg-ink-2"
          >
            {pending ? 'Posting...' : 'Post Listing'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}