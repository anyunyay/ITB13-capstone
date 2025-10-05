<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AddressController extends Controller
{
    /**
     * Display a listing of the customer's addresses.
     */
    public function index()
    {
        /** @var User $user */
        $user = Auth::user();
        $addresses = $user->addresses()->orderBy('is_default', 'desc')->orderBy('created_at', 'desc')->get();
        
        return Inertia::render('Customer/Profile/address', [
            'addresses' => $addresses,
            'user' => $user
        ]);
    }

    /**
     * Store a newly created address.
     */
    public function store(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        
        $validated = $request->validate([
            'street' => 'required|string|max:500',
            'is_default' => 'boolean',
        ]);

        // Set fixed values following registration pattern
        $addressData = [
            'user_id' => $user->id,
            'type' => 'home', // Fixed type
            'label' => null, // No label
            'street' => $validated['street'],
            'barangay' => 'Sala', // Fixed barangay
            'city' => 'Cabuyao', // Fixed city
            'province' => 'Laguna', // Fixed province
            'postal_code' => null, // No postal code
            'is_default' => $validated['is_default'] ?? false,
        ];

        // If this is being set as default, unset any existing default
        if ($addressData['is_default']) {
            $user->addresses()->update(['is_default' => false]);
        }

        // If this is the first address, make it default
        if ($user->addresses()->count() === 0) {
            $addressData['is_default'] = true;
        }

        $address = $user->addresses()->create($addressData);

        // If this address is set as default, update the user's main address fields
        if ($addressData['is_default']) {
            $this->updateUserMainAddress($user, $address);
        }

        return redirect()->back()->with('success', 'Address created successfully');
    }

    /**
     * Display the specified address.
     */
    public function show(Address $address)
    {
        /** @var User $user */
        $user = Auth::user();
        
        // Ensure the address belongs to the authenticated user
        if ($address->user_id !== $user->id) {
            return redirect()->back()->with('error', 'Unauthorized');
        }

        return Inertia::render('Customer/Profile/address', [
            'addresses' => $user->addresses()->orderBy('is_default', 'desc')->orderBy('created_at', 'desc')->get(),
            'user' => $user,
            'selectedAddress' => $address
        ]);
    }

    /**
     * Update the specified address.
     */
    public function update(Request $request, Address $address)
    {
        /** @var User $user */
        $user = Auth::user();
        
        // Ensure the address belongs to the authenticated user
        if ($address->user_id !== $user->id) {
            return redirect()->back()->with('error', 'Unauthorized');
        }

        $validated = $request->validate([
            'street' => 'required|string|max:500',
            'is_default' => 'boolean',
        ]);

        // If this is being set as default, unset any existing default
        if ($validated['is_default']) {
            $user->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        // Only update the street address and is_default flag
        $address->update([
            'street' => $validated['street'],
            'is_default' => $validated['is_default'] ?? $address->is_default,
        ]);

        // If this address is set as default, update the user's main address fields
        if ($validated['is_default']) {
            $this->updateUserMainAddress($user, $address);
        }

        return redirect()->back()->with('success', 'Address updated successfully');
    }

    /**
     * Remove the specified address.
     */
    public function destroy(Address $address)
    {
        /** @var User $user */
        $user = Auth::user();
        
        // Ensure the address belongs to the authenticated user
        if ($address->user_id !== $user->id) {
            return redirect()->back()->with('error', 'Unauthorized');
        }

        // If this is the default address, we need to handle it carefully
        if ($address->is_default) {
            $remainingAddresses = $user->addresses()->where('id', '!=', $address->id)->get();
            
            if ($remainingAddresses->count() > 0) {
                // Set the first remaining address as default
                $newDefault = $remainingAddresses->first();
                $newDefault->update(['is_default' => true]);
                $this->updateUserMainAddress($user, $newDefault);
            } else {
                // No remaining addresses, clear user's main address
                $this->clearUserMainAddress($user);
            }
        }

        $address->delete();

        return redirect()->back()->with('success', 'Address deleted successfully');
    }

    /**
     * Set an address as the default address.
     */
    public function setDefault(Address $address)
    {
        /** @var User $user */
        $user = Auth::user();
        
        // Ensure the address belongs to the authenticated user
        if ($address->user_id !== $user->id) {
            return redirect()->back()->with('error', 'Unauthorized');
        }

        DB::transaction(function () use ($user, $address) {
            // Unset all other default addresses
            $user->addresses()->update(['is_default' => false]);
            
            // Set this address as default
            $address->update(['is_default' => true]);
            
            // Update user's main address fields
            $this->updateUserMainAddress($user, $address);
        });

        return redirect()->back()->with('success', 'Address set as active successfully');
    }

    /**
     * Get the user's current main address from the user table.
     */
    public function getCurrentAddress()
    {
        /** @var User $user */
        $user = Auth::user();
        
        $currentAddress = [
            'street' => $user->address,
            'barangay' => $user->barangay,
            'city' => $user->city,
            'province' => $user->province,
            'postal_code' => null, // Not stored in user table
        ];

        return Inertia::render('Customer/Profile/address', [
            'addresses' => $user->addresses()->orderBy('is_default', 'desc')->orderBy('created_at', 'desc')->get(),
            'user' => $user,
            'currentAddress' => $currentAddress
        ]);
    }

    /**
     * Update the user's main address fields with the default address data.
     */
    private function updateUserMainAddress($user, Address $address)
    {
        $user->update([
            'address' => $address->street,
            'barangay' => $address->barangay,
            'city' => $address->city,
            'province' => $address->province,
        ]);
    }

    /**
     * Clear the user's main address fields.
     */
    private function clearUserMainAddress($user)
    {
        $user->update([
            'address' => null,
            'barangay' => null,
            'city' => null,
            'province' => null,
        ]);
    }
}
