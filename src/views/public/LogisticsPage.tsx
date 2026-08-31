import React, { useState } from 'react';
import { LogisticsQuote, LogisticsBooking } from '../../types';
import { mockLogisticsQuotes } from '../../data/mockData';
import { 
  Truck, 
  MapPin, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Scale, 
  HelpCircle,
  Phone,
  Layers,
  ChevronRight
} from 'lucide-react';

interface LogisticsPageProps {
  onNavigate: (view: string) => void;
  onBookTransport: (booking: any) => void;
}

export const LogisticsPage: React.FC<LogisticsPageProps> = ({
  onNavigate,
  onBookTransport,
}) => {
  const [pickupLocation, setPickupLocation] = useState('Nashik (Dindori Road)');
  const [deliveryLocation, setDeliveryLocation] = useState('Pune (Gultekdi Market Yard)');
  const [cargoWeight, setCargoWeight] = useState<number>(1500);
  const [cropType, setCropType] = useState('Fresh Tomatoes');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('Mini Truck (1-2 Tons)');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Approximate distance calculation
  const distanceKm = 145;

  const calculateEstimate = (baseFare: number, perKm: number) => {
    return baseFare + (distanceKm * perKm);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBookTransport({
      cropName: cropType,
      cargoWeightKg: cargoWeight,
      pickupLocation,
      deliveryLocation,
      vehicleType: selectedVehicle,
      estimatedCost: selectedVehicle.includes('Mini') ? 1850 : selectedVehicle.includes('Light') ? 3200 : 5400,
    });
    setBookingSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] pb-20">
      
      {/* Header Banner */}
      <div className="bg-[#002517] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-[#123B2A]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9DF1C0] mb-1">
                <Truck className="w-4 h-4" />
                <span>AgriLogistics Transport Network</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white">
                Farm Gate Freight & Delivery
              </h1>
              <p className="text-xs sm:text-sm text-[#C1C8C2] mt-1 max-w-xl">
                Reliable, verified agricultural carriers connecting Maharashtra farms directly to APMC yards and wholesale distribution hubs.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 border border-white/15 px-4 py-2 rounded-2xl shrink-0 self-start md:self-auto text-xs">
              <span className="font-bold text-[#9DF1C0]">Verified Drivers</span>
              <span className="text-white/40">|</span>
              <span className="text-white/80">GPS Tracked Transit</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Instant Freight Calculator & Booking Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Calculator Form */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#E7DDC8] shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-bold text-[#002517]">Instant Freight Cost Estimator</h2>
              <p className="text-xs text-[#717973] mt-0.5">
                Calculate transparent doorstep pickup rates based on harvest tonnage and route distance.
              </p>
            </div>

            {bookingSuccess ? (
              <div className="bg-[#F2FCF3] border border-[#9DF1C0] p-6 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#002517] text-[#9DF1C0] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#002517]">Transport Booking Requested!</h3>
                <p className="text-xs text-[#525B54]">
                  Our nearby transport coordinator has received your harvest pickup request for <strong>{cropType}</strong>. You will receive driver contact and live tracking details shortly.
                </p>
                <button
                  onClick={() => setBookingSuccess(false)}
                  className="bg-[#002517] text-white font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Book Another Shipment
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#002517] mb-1">Farm Pickup Location</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#0D6C45]" />
                      <input
                        type="text"
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl pl-9 pr-3 py-2 text-xs text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#002517] mb-1">Delivery Destination</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#C2962A]" />
                      <input
                        type="text"
                        value={deliveryLocation}
                        onChange={(e) => setDeliveryLocation(e.target.value)}
                        className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl pl-9 pr-3 py-2 text-xs text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#002517] mb-1">Crop Type</label>
                    <input
                      type="text"
                      value={cropType}
                      onChange={(e) => setCropType(e.target.value)}
                      placeholder="e.g. Tomatoes, Onions, Wheat"
                      className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-3 py-2 text-xs text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#002517] mb-1">Cargo Weight (kg)</label>
                    <input
                      type="number"
                      value={cargoWeight}
                      onChange={(e) => setCargoWeight(Number(e.target.value))}
                      className="w-full bg-[#F7F5EF] border border-[#C1C8C2] rounded-xl px-3 py-2 text-xs text-[#002517] focus:outline-none focus:ring-2 focus:ring-[#0D6C45]"
                      required
                    />
                  </div>
                </div>

                {/* Vehicle Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#002517] mb-2">Select Vehicle Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {mockLogisticsQuotes.map((q) => (
                      <div
                        key={q.id}
                        onClick={() => setSelectedVehicle(q.vehicleType)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          selectedVehicle === q.vehicleType
                            ? 'bg-[#E6F0E8] border-[#0D6C45] ring-2 ring-[#9DF1C0]'
                            : 'bg-[#F7F5EF] border-[#E7DDC8] hover:border-[#C1C8C2]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#002517]">{q.vehicleType}</span>
                          <span className="text-xs font-black text-[#0D6C45]">₹{q.estimatedCost}</span>
                        </div>
                        <p className="text-[10px] text-[#717973] mt-1">{q.capacityDescription}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#002517] hover:bg-[#123B2A] text-white font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-98"
                  >
                    <Truck className="w-4 h-4 text-[#9DF1C0]" />
                    <span>Request Farm Gate Transport (Est. ₹{selectedVehicle.includes('Mini') ? '1,850' : '3,200'})</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Fleet Specifications */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7DDC8] shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#002517]">AgriTech Carrier Fleet Standards</h3>
              
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E7DDC8] space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#002517]">1. Farm Gate Pickup Guarantee</h4>
                    <span className="text-[10px] font-bold text-[#0D6C45] bg-[#E6F0E8] px-2 py-0.5 rounded-full">Included</span>
                  </div>
                  <p className="text-xs text-[#525B54]">
                    Drivers arrive with calibrated digital weight scales to verify harvest crate count at the farm gate.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E7DDC8] space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#002517]">2. Perishable Care & Fast Transit</h4>
                    <span className="text-[10px] font-bold text-[#0D6C45] bg-[#E6F0E8] px-2 py-0.5 rounded-full">Zero Spoilage</span>
                  </div>
                  <p className="text-xs text-[#525B54]">
                    Ventilated mesh tarp covers and climate-controlled reefer containers maintain optimal produce freshness during transit.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E7DDC8] space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#002517]">3. Direct Digital Mandi Pass</h4>
                    <span className="text-[10px] font-bold text-[#0D6C45] bg-[#E6F0E8] px-2 py-0.5 rounded-full">E-Way Bill Ready</span>
                  </div>
                  <p className="text-xs text-[#525B54]">
                    Instant automated e-way bill generation for smooth highway checkpost clearances.
                  </p>
                </div>
              </div>
            </div>

            {/* Helpline banner */}
            <div className="p-5 rounded-3xl bg-[#002517] text-white flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#9DF1C0] uppercase tracking-wider">Transport Helpline</span>
                <h4 className="text-sm font-bold mt-0.5">Need custom bulk freight for 20+ tons?</h4>
                <p className="text-xs text-[#C1C8C2]">Speak directly with our regional logistics manager.</p>
              </div>
              <a
                href="tel:18002334455"
                className="bg-[#9DF1C0] hover:bg-[#86E4AD] text-[#002517] font-bold text-xs px-4 py-2.5 rounded-xl whitespace-nowrap"
              >
                Call 1800 233 4455
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
