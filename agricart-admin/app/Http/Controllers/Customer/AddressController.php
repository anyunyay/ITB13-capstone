<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Http\Requests\AddressValidationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class AddressController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of the user's addresses.
     */
    public function index()
    {
        $user = Auth::user();
        $addresses = $user->addresses()->orderBy('is_default', 'desc')->orderBy('created_at', 'desc')->get();
        
        return Inertia::render('Customer/Profile/address', [
            'user' => $user,
            'addresses' => $addresses
        ]);
    }

    /**
     * Store a newly created address.
     */
    public function store(AddressValidationRequest $request)
    {
        $user = Auth::user();
        $validated = $request->validated();

        DB::transaction(function () use ($user, $validated) {
            // If this is set as default, remove default from other addresses
            if ($validated['is_default']) {
                $user->addresses()->update(['is_default' => false]);
            }
            
            // If this is the first address, make it default
            if ($user->addresses()->count() === 0) {
                $validated['is_default'] = true;
            }

            $user->addresses()->create($validated);
        });

        return redirect()->back()->with('success', 'Address added successfully.');
    }

    /**
     * Display the specified address.
     */
    public function show(Address $address)
    {
        $this->authorize('view', $address);
        
        return response()->json($address);
    }

    /**
     * Update the specified address.
     */
    public function update(AddressValidationRequest $request, Address $address)
    {
        $this->authorize('update', $address);
        $validated = $request->validated();

        DB::transaction(function () use ($address, $validated) {
            // If this is set as default, remove default from other addresses
            if ($validated['is_default']) {
                $address->user->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
            }
            
            $address->update($validated);
        });

        return redirect()->back()->with('success', 'Address updated successfully.');
    }

    /**
     * Remove the specified address.
     */
    public function destroy(Address $address)
    {
        $this->authorize('delete', $address);
        
        // If deleting the default address, make another address default
        if ($address->is_default) {
            $nextAddress = $address->user->addresses()->where('id', '!=', $address->id)->first();
            if ($nextAddress) {
                $nextAddress->update(['is_default' => true]);
            }
        }
        
        $address->delete();

        return redirect()->back()->with('success', 'Address deleted successfully.');
    }

    /**
     * Set an address as default.
     */
    public function setDefault(Address $address)
    {
        $this->authorize('update', $address);
        
        DB::transaction(function () use ($address) {
            // Remove default from all other addresses
            $address->user->addresses()->update(['is_default' => false]);
            
            // Set this address as default
            $address->update(['is_default' => true]);
        });

        return redirect()->back()->with('success', 'Default address updated successfully.');
    }

    /**
     * Update main address fields in user profile.
     */
    public function updateMainAddress(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'address' => 'nullable|string|max:500',
            'barangay' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
        ]);

        $user->update($validated);

        return redirect()->back()->with('success', 'Main address updated successfully.');
    }

    /**
     * Update main address fields in user profile (PUT method).
     */
    public function updateMainAddressFields(Request $request)
    {
        return $this->updateMainAddress($request);
    }

    /**
     * Get current address for the user.
     */
    public function getCurrentAddress()
    {
        $user = Auth::user();
        $defaultAddress = $user->defaultAddress;
        
        return response()->json([
            'default_address' => $defaultAddress,
            'main_address' => [
                'address' => $user->address,
                'barangay' => $user->barangay,
                'city' => $user->city,
                'province' => $user->province,
            ]
        ]);
    }
}
