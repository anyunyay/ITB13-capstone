<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\UserAddress;
use App\Models\User;
use App\Models\SalesAudit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AddressController extends Controller
{
    /**
     * Check if the customer has any undelivered orders
     */
    private function hasUndeliveredOrders(User $user): bool
    {
        return SalesAudit::where('customer_id', $user->id)
            ->where('delivery_status', '!=', 'delivered')
            ->exists();
    }

    /**
     * Display a listing of the customer's addresses.
     */
    public function index(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        
        // Always reload addresses from database to ensure fresh data (all addresses)
        $addresses = $user->addresses()
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Check if we should auto-open the add address form
        $autoOpenAddForm = $request->query('add_address') === 'true';
        
        // Check if customer has undelivered orders
        $hasUndeliveredOrders = $this->hasUndeliveredOrders($user);
        
        return Inertia::render('Customer/Profile/address', [
            'addresses' => $addresses,
            'user' => $user,
            'autoOpenAddForm' => $autoOpenAddForm,
            'hasUndeliveredOrders' => $hasUndeliveredOrders,
            'flash' => [
                'success' => session('success'),
                'error' => session('error')
            ]
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
            'is_active' => 'boolean',
        ]);

        // Set fixed values following registration pattern
        $addressData = [
            'user_id' => $user->id,
            'street' => $validated['street'],
            'barangay' => 'Sala', // Fixed barangay
            'city' => 'Cabuyao', // Fixed city
            'province' => 'Laguna', // Fixed province
            'is_active' => $validated['is_active'] ?? false,
        ];

        // Check if an identical address already exists
        $existingAddress = $user->addresses()
            ->where('street', $addressData['street'])
            ->where('barangay', $addressData['barangay'])
            ->where('city', $addressData['city'])
            ->where('province', $addressData['province'])
            ->first();

        if ($existingAddress) {
            return redirect()->back()->with('error', 'This address already exists in your saved addresses.');
        }

        // Create the new address
        if ($addressData['is_active']) {
            // If this is being set as active, handle the activation properly
            $address = DB::transaction(function () use ($user, $addressData) {
                // First, create the new address as active
                $addressData['is_active'] = true;
                $address = $user->addresses()->create($addressData);
                
                // Then, set all other addresses to inactive
                $user->addresses()->where('id', '!=', $address->id)->update([
                    'is_active' => false
                ]);
                
                return $address;
            });
        } else {
            // Create address as inactive
            $addressData['is_active'] = false;
            $address = $user->addresses()->create($addressData);
        }

        return redirect()->back()->with('success', 'Address created successfully');
    }

    /**
     * Display the specified address.
     */
    public function show(UserAddress $address)
    {
        /** @var User $user */
        $user = Auth::user();
        
        // Ensure the address belongs to the authenticated user
        if ($address->user_id !== $user->id) {
            return redirect()->back()->with('error', 'Unauthorized');
        }

        return Inertia::render('Customer/Profile/address', [
            'addresses' => $user->activeAddresses()->orderBy('created_at', 'desc')->get(),
            'user' => $user,
            'selectedAddress' => $address,
            'flash' => [
                'success' => session('success'),
                'error' => session('error')
            ]
        ]);
    }

    /**
     * Update the specified address.
     */
    public function update(Request $request, UserAddress $address)
    {
        /** @var User $user */
        $user = Auth::user();
        
        // Ensure the address belongs to the authenticated user
        if ($address->user_id !== $user->id) {
            return redirect()->back()->with('error', 'Unauthorized');
        }

        // Check if customer has undelivered orders
        if ($this->hasUndeliveredOrders($user)) {
            return redirect()->back()->with('error', 'You cannot modify addresses while you have pending orders. Please wait until all your orders are delivered.');
        }

        $validated = $request->validate([
            'street' => 'required|string|max:500',
            'is_active' => 'boolean',
        ]);

        // Check if an identical address already exists (excluding current address)
        $existingAddress = $user->addresses()
            ->where('id', '!=', $address->id)
            ->where('street', $validated['street'])
            ->where('barangay', $address->barangay) // Keep existing barangay, city, province
            ->where('city', $address->city)
            ->where('province', $address->province)
            ->first();

        if ($existingAddress) {
            return redirect()->back()->with('error', 'This address already exists in your saved addresses.');
        }

        // Update the address
        if ($validated['is_active']) {
            // If this is being set as active, handle the activation properly
            DB::transaction(function () use ($user, $address, $validated) {
                // First, set this address as active
                $address->update([
                    'street' => $validated['street'],
                    'is_active' => true
                ]);
                
                // Then, set all other addresses to inactive
                $user->addresses()->where('id', '!=', $address->id)->update([
                    'is_active' => false
                ]);
            });
        } else {
            // Only update the street address
            $address->update([
                'street' => $validated['street'],
            ]);
        }

        return redirect()->back()->with('success', 'Address updated successfully');
    }

    /**
     * Update the user's main address fields based on the selected address.
     * This method is called from the cart when user selects a different address.
     */
    public function updateMainAddress(Request $request, UserAddress $address)
    {
        /** @var User $user */
        $user = Auth::user();
        
        // Ensure the address belongs to the authenticated user
        if ($address->user_id !== $user->id) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
            return redirect()->back()->with('error', 'Unauthorized');
        }

        DB::transaction(function () use ($user, $address) {
            // First, set this address as active
            $address->update([
                'is_active' => true
            ]);
            
            // Then, set all other addresses to inactive
            $user->addresses()->where('id', '!=', $address->id)->update([
                'is_active' => false
            ]);
        });

        // Refresh the address data after update
        $address->refresh();
        $user->refresh();

        // Get updated addresses for the response
        $updatedAddresses = $user->addresses()->orderBy('created_at', 'desc')->get();
        $updatedActiveAddress = $user->defaultAddress;

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Address updated successfully',
                'addresses' => $updatedAddresses,
                'activeAddress' => $updatedActiveAddress,
                'selectedAddress' => $address
            ]);
        }

        // For Inertia requests, return the updated data
        return redirect()->back()->with([
            'success' => 'Address updated successfully',
            'addresses' => $updatedAddresses,
            'activeAddress' => $updatedActiveAddress
        ]);
    }

    /**
     * Remove the specified address.
     */
    public function destroy(UserAddress $address)
    {
        /** @var User $user */
        $user = Auth::user();
        
        // Ensure the address belongs to the authenticated user
        if ($address->user_id !== $user->id) {
            return redirect()->back()->with('error', 'Unauthorized');
        }

        // Check if customer has undelivered orders
        if ($this->hasUndeliveredOrders($user)) {
            return redirect()->back()->with('error', 'You cannot delete addresses while you have pending orders. Please wait until all your orders are delivered.');
        }

        // If this is the active address, we need to handle it carefully
        if ($address->is_active) {
            $remainingAddresses = $user->addresses()->where('id', '!=', $address->id)->get();
            
            if ($remainingAddresses->count() > 0) {
                // Set the first remaining address as active
                $newActive = $remainingAddresses->first();
                $newActive->update(['is_active' => true]);
            }
        }

        $address->delete();

        return redirect()->back()->with('success', 'Address deleted successfully');
    }

    /**
     * Set an address as active (this becomes the selected address).
     * This method is useful when you want to activate an address.
     */
    public function setActive(UserAddress $address)
    {
        /** @var User $user */
        $user = Auth::user();
        
        // Ensure the address belongs to the authenticated user
        if ($address->user_id !== $user->id) {
            return redirect()->back()->with('error', 'Unauthorized');
        }

        // Check if customer has undelivered orders
        if ($this->hasUndeliveredOrders($user)) {
            return redirect()->back()->with('error', 'You cannot change your active address while you have pending orders. Please wait until all your orders are delivered.');
        }

        DB::transaction(function () use ($user, $address) {
            // First, set this address as active
            $address->update([
                'is_active' => true
            ]);
            
            // Then, set all other addresses to inactive
            $user->addresses()->where('id', '!=', $address->id)->update([
                'is_active' => false
            ]);
        });

        return redirect()->back()->with('success', 'Address set as active successfully');
    }

    /**
     * Set an address as the active address (now serves as default).
     */
    public function setDefault(UserAddress $address)
    {
        /** @var User $user */
        $user = Auth::user();
        
        // Ensure the address belongs to the authenticated user
        if ($address->user_id !== $user->id) {
            return redirect()->back()->with('error', 'Unauthorized');
        }

        DB::transaction(function () use ($user, $address) {
            // First, set this address as active
            $address->update([
                'is_active' => true
            ]);
            
            // Then, set all other addresses to inactive
            $user->addresses()->where('id', '!=', $address->id)->update([
                'is_active' => false
            ]);
        });

        return redirect()->back()->with('success', 'Address set as active successfully');
    }

    /**
     * Get the user's current main address from the user_addresses table.
     */
    public function getCurrentAddress()
    {
        /** @var User $user */
        $user = Auth::user();
        
        $defaultAddress = $user->defaultAddress;
        
        $currentAddress = $defaultAddress ? [
            'street' => $defaultAddress->street,
            'barangay' => $defaultAddress->barangay,
            'city' => $defaultAddress->city,
            'province' => $defaultAddress->province,
        ] : null;

        return Inertia::render('Customer/Profile/address', [
            'addresses' => $user->addresses()->orderBy('created_at', 'desc')->get(),
            'user' => $user,
            'currentAddress' => $currentAddress,
            'flash' => [
                'success' => session('success'),
                'error' => session('error')
            ]
        ]);
    }

    /**
     * Update the user's main address fields with the default address data.
     */
    private function updateUserMainAddress($user, UserAddress $address)
    {
        // Since we're using the user_addresses table, we don't need to update user fields
        // The default address is already tracked in the user_addresses table
        return;
    }

    /**
     * Update the user's main address fields directly.
     */
    public function updateMainAddressFields(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        
        // Check if customer has undelivered orders
        if ($this->hasUndeliveredOrders($user)) {
            return redirect()->back()->with('error', 'You cannot modify your main address while you have pending orders. Please wait until all your orders are delivered.');
        }
        
        $validated = $request->validate([
            'address' => 'required|string|max:500',
            'barangay' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'province' => 'required|string|max:100',
        ]);

        // Check if an identical address already exists in saved addresses
        $existingAddress = $user->addresses()
            ->where('street', $validated['address'])
            ->where('barangay', $validated['barangay'])
            ->where('city', $validated['city'])
            ->where('province', $validated['province'])
            ->first();

        if ($existingAddress) {
            return redirect()->back()->with('error', 'This address already exists in your saved addresses.');
        }

        // Get the current default address
        $currentDefaultAddress = $user->defaultAddress;
        
        // If there's a current default address, update it
        if ($currentDefaultAddress) {
            $currentDefaultAddress->update([
                'street' => $validated['address'],
                'barangay' => $validated['barangay'],
                'city' => $validated['city'],
                'province' => $validated['province'],
            ]);
        } else {
            // Create a new default address if none exists
            $user->addresses()->create([
                'street' => $validated['address'],
                'barangay' => $validated['barangay'],
                'city' => $validated['city'],
                'province' => $validated['province'],
                'is_default' => true,
                'is_active' => true,
            ]);
        }

        return redirect()->back()->with('success', 'Main address updated successfully');
    }

    /**
     * Clear the user's main address fields.
     */
    private function clearUserMainAddress($user)
    {
        // Since we're using the user_addresses table, we don't need to clear user fields
        // We can deactivate the default address instead
        $defaultAddress = $user->defaultAddress;
        if ($defaultAddress) {
            $defaultAddress->update(['is_active' => false]);
        }
    }
}
