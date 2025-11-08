import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MapPin, Plus, Home, CheckCircle } from 'lucide-react';
import { router } from '@inertiajs/react';
import type { Address } from '../types';

interface AddressSelectorProps {
  addresses: Address[];
  activeAddress: Address | undefined;
  selectedAddressId: number | null;
  onAddressChange: (addressId: number | null) => void;
}

export function AddressSelector({
  addresses,
  activeAddress,
  selectedAddressId,
  onAddressChange,
}: AddressSelectorProps) {
  if (!activeAddress && addresses.length === 0) {
    return (
      <div className="space-y-2.5">
        <p className="text-sm text-green-600 dark:text-green-400">No delivery addresses found. Please add an address to continue.</p>
        <Button
          onClick={() => router.visit('/customer/profile/addresses?add_address=true')}
          className="flex items-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2"
        >
          <Plus className="h-3 w-3" />
          Add Address
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Current Delivery Address Display */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700 rounded-xl p-3 mb-3">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">Current Delivery Address:</h4>
            {selectedAddressId ? (
              (() => {
                if (activeAddress && activeAddress.id === selectedAddressId) {
                  return (
                    <>
                      <span className="font-medium text-green-800 dark:text-green-200 text-sm">{activeAddress.street}</span>
                      <span className="text-xs text-green-600 dark:text-green-400 block">
                        {activeAddress.barangay}, {activeAddress.city}, {activeAddress.province}
                      </span>
                      <span className="text-xs text-green-600 dark:text-green-400 mt-0.5 block">
                        ✓ Active address will be used for delivery
                      </span>
                    </>
                  );
                }
                
                const selectedAddr = addresses.find(addr => addr.id === selectedAddressId);
                return selectedAddr ? (
                  <>
                    <span className="font-medium text-green-800 dark:text-green-200 text-sm">{selectedAddr.street}</span>
                    <span className="text-xs text-green-600 dark:text-green-400 block">
                      {selectedAddr.barangay}, {selectedAddr.city}, {selectedAddr.province}
                    </span>
                    <span className="text-xs text-green-600 dark:text-green-400 mt-0.5 block">
                      ✓ This address will be used for delivery
                    </span>
                  </>
                ) : null;
              })()
            ) : (
              <>
                <span className="font-medium text-green-800 dark:text-green-200 text-sm">{activeAddress?.street}</span>
                <span className="text-xs text-green-600 dark:text-green-400 block">
                  {activeAddress?.barangay}, {activeAddress?.city}, {activeAddress?.province}
                </span>
                <span className="text-xs text-green-600 dark:text-green-400 mt-0.5 block">
                  ✓ This address will be used for delivery automatically
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Address Selection Dropdown */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-3 w-3 text-green-600 dark:text-green-400" />
          <Label htmlFor="delivery-address" className="text-xs font-semibold text-green-600 dark:text-green-400">
            Switch to Different Address
          </Label>
        </div>
        
        <Select 
          value={selectedAddressId ? selectedAddressId.toString() : ''} 
          onValueChange={(value) => {
            if (value === 'active') {
              if (selectedAddressId) {
                onAddressChange(null);
              }
            } else {
              const addressId = parseInt(value);
              if (!isNaN(addressId)) {
                onAddressChange(addressId);
              }
            }
          }}
        >
          <SelectTrigger className="w-full h-10 border-2 border-green-300 dark:border-green-600 hover:border-green-400 dark:hover:border-green-500 focus:border-green-500 dark:focus:border-green-400 transition-colors bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-green-600 dark:text-green-400" />
              <SelectValue placeholder="Choose a different address" />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-64 overflow-y-auto bg-white dark:bg-gray-800 border-green-200 dark:border-green-700">
            {/* Active Address Option */}
            {activeAddress && activeAddress.id !== selectedAddressId && (
              <SelectItem value="active" className="p-3 hover:bg-green-50 dark:hover:bg-green-900/20 focus:bg-green-50 dark:focus:bg-green-900/20">
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-green-800 dark:text-green-200 truncate">{activeAddress.street}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400 truncate">
                      {activeAddress.barangay}, {activeAddress.city}, {activeAddress.province}
                    </p>
                  </div>
                </div>
              </SelectItem>
            )}
            
            {/* All Addresses */}
            {addresses
              .filter(address => address.id !== selectedAddressId && address.id !== null)
              .map((address) => (
              <SelectItem key={address.id || 'unknown'} value={address.id?.toString() || ''} className="p-3 hover:bg-green-50 dark:hover:bg-green-900/20 focus:bg-green-50 dark:focus:bg-green-900/20">
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    <Home className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-green-800 dark:text-green-200 truncate">{address.street}</span>
                      {address.is_active && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400 truncate">
                      {address.barangay}, {address.city}, {address.province}
                    </p>
                  </div>
                </div>
              </SelectItem>
            ))}
            
            {/* Empty state */}
            {addresses.filter(address => address.id !== selectedAddressId).length === 0 && 
             (!activeAddress || activeAddress.id === selectedAddressId) && (
              <div className="p-4 text-center text-green-600 dark:text-green-400">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-green-400 dark:text-green-500" />
                <p className="text-sm">No other addresses available</p>
              </div>
            )}
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.visit('/customer/profile/addresses?add_address=true')}
          className="flex items-center gap-2 w-full border-2 border-dashed border-green-300 dark:border-green-600 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors text-xs py-2"
        >
          <Plus className="h-3 w-3" />
          Add New Address
        </Button>
      </div>
    </>
  );
}
