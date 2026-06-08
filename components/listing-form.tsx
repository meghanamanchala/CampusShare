'use client';

import { useActionState } from 'react';
import { createListingAction, type ListingActionState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

const initialState: ListingActionState = {
  status: 'idle',
  message: 'Post a listing to your live Supabase feed.',
};

type ListingFormProps = {
  defaultOwnerName: string;
};

export function ListingForm({ defaultOwnerName }: ListingFormProps) {
  const [state, formAction, pending] = useActionState(createListingAction, initialState);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-stone-light bg-cream/40">
        <CardTitle>Post a campus listing</CardTitle>
        <CardDescription>
          This form writes directly to your Supabase <span className="font-medium text-ink">listings</span> table.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="grid gap-5 pt-6">
          <div className="grid gap-2">
            <Label htmlFor="title">Item title</Label>
            <Input id="title" name="title" placeholder="MacBook charger, study chair, lab coat..." required />
          </div>

          <div className="grid gap-2 md:grid-cols-2 md:gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ownerName">Your name</Label>
              <Input id="ownerName" name="ownerName" defaultValue={defaultOwnerName} placeholder="Ananya K." required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="icon">Icon</Label>
              <Input id="icon" name="icon" defaultValue="CS" maxLength={3} placeholder="CS" />
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2 md:gap-4">
            <div className="grid gap-2">
              <Label htmlFor="itemType">Listing type</Label>
              <Select id="itemType" name="itemType" defaultValue="Free">
                <option value="Free">Free</option>
                <option value="For sale">For sale</option>
                <option value="Borrow">Borrow</option>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" name="price" placeholder="600" inputMode="numeric" />
            </div>
          </div>

          <p className="text-xs leading-6 text-ink-3">
            Free and borrow posts can leave price blank. For sale posts should use a numeric value only.
          </p>

          <p className={`rounded-xl border px-4 py-3 text-sm ${state.status === 'error' ? 'border-red-200 bg-red-50 text-red-700' : state.status === 'success' ? 'border-green-light bg-green-light text-green' : 'border-stone-light bg-cream text-ink-2'}`}>
            {state.message}
          </p>
        </CardContent>
        <CardFooter className="justify-end border-t border-stone-light bg-cream/30 px-6 py-5">
          <Button type="submit" disabled={pending}>
            {pending ? 'Posting...' : 'Post listing'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}