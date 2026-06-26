import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiCheckCircle, HiArrowRight } from 'react-icons/hi';
import ScrollReveal from '../components/ScrollReveal';

export default function BookingSummary() {
  const location = useLocation();
  const booking = location.state;

  if (!booking) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">No booking data found</p>
          <Link to="/booking" className="btn-primary inline-flex items-center gap-2">
            Make a Booking <HiArrowRight />
          </Link>
        </div>
      </div>
    );
  }

  const { customerName, email, phone, selectedDevice, quantity, days, delivery, address, total } = booking;
  const bookingId = 'BKN-' + String(Math.floor(Math.random() * 9000) + 1000);

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <div className="max-w-lg mx-auto px-4 sm:px-6 w-full">
        <ScrollReveal>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-6"
            >
              <HiCheckCircle className="text-green-400 text-3xl" />
            </motion.div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
            <p className="text-gray-400 mb-8">Your rental has been successfully booked</p>

            <div className="text-left space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Booking ID</span>
                <span className="text-accent-cyan font-mono font-medium">{bookingId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Status</span>
                <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 text-xs font-medium">Pending</span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Customer</span>
                <span className="text-white font-medium">{customerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Email</span>
                <span className="text-white">{email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Phone</span>
                <span className="text-white">{phone}</span>
              </div>
              <div className="h-px bg-white/5" />
              {selectedDevice && (
                <>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    <img src={selectedDevice.image} alt={selectedDevice.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <p className="text-white font-medium text-sm">{selectedDevice.name}</p>
                      <p className="text-gray-500 text-xs">{selectedDevice.category}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Quantity</span>
                    <span className="text-white">{quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Rental Days</span>
                    <span className="text-white">{days}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Price Per Day</span>
                    <span className="text-white">${selectedDevice.pricePerDay}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Delivery Mode</span>
                    <span className="text-white capitalize">{delivery}</span>
                  </div>
                  {delivery === 'delivery' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Address</span>
                      <span className="text-white text-right max-w-[200px]">{address}</span>
                    </div>
                  )}
                  <div className="h-px bg-white/5" />
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-300">Total Amount</span>
                    <span className="gradient-text">${total}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/dashboard" className="btn-primary flex-1 text-center">
                View Dashboard
              </Link>
              <Link to="/devices" className="btn-secondary flex-1 text-center">
                Rent More
              </Link>
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </div>
  );
}
