import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingCart, ArrowLeft, Plus, Minus, Zap } from 'lucide-react';

const CartPage = () => {
  const { cart, removeFromCart, updateQty, cartTotal, clearCart } = useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="glass-card rounded-[2rem] p-16 text-center border-slate-800">
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={40} className="text-slate-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Your Cart is Empty</h2>
          <p className="text-slate-400 text-xs mb-6">Browse our catalog to add items.</p>
          <Link to="/devices" className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-900 font-bold px-8 py-3 rounded-xl hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/10 text-xs uppercase tracking-wider">
            <ArrowLeft size={16} /> Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="bg-gradient-to-r from-cyan-500 to-purple-500 w-8 h-1 rounded-full inline-block mb-1.5"></span>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Shopping Cart ({cart.length} item{cart.length !== 1 ? 's' : ''})
          </h1>
        </div>
        <button onClick={clearCart} className="text-xs font-bold text-red-400 hover:text-red-300 hover:underline transition-all">Clear All</button>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1 space-y-3">
          {cart.map((item) => (
            <div key={item.id} className="glass-card rounded-2xl p-4 flex gap-4 border-slate-800">
              <Link to={`/booking/${item.id}`} className="w-24 h-24 shrink-0 bg-slate-950/40 rounded-xl flex items-center justify-center p-2 border border-slate-800">
                <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200&q=80'; }} />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/booking/${item.id}`} className="text-sm font-bold text-white hover:text-cyan-400 transition-colors line-clamp-2 leading-tight">
                  {item.name}
                </Link>
                <p className="text-[10px] text-slate-500 mt-0.5">{item.category}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                    <button onClick={() => updateQty(item.id, item.qty - 1)} className="px-2 py-1 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                      <Minus size={12} />
                    </button>
                    <span className="px-3 py-1 text-sm font-bold text-white border-x border-slate-800 min-w-[30px] text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} className="px-2 py-1 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                      <Plus size={12} />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-300 transition-colors p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-black text-white">₹{item.daily_rate}</p>
                <p className="text-[10px] text-slate-500 font-semibold">/ day each</p>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:w-80">
          <div className="glass-card rounded-[2rem] p-6 border-slate-800 sticky top-24">
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4">Order Summary</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Items ({cart.length})</span>
                <span className="text-white font-semibold">₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery Fee</span>
                <span className="text-emerald-400 font-bold">FREE</span>
              </div>
              <div className="border-t border-slate-800 pt-2 mt-2">
                <div className="flex justify-between font-bold text-white text-sm">
                  <span>Total / day</span>
                  <span className="text-cyan-400">₹{cartTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <Link to={`/booking/${cart[0]?.id}`}
              className="block mt-5 w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-900 font-bold text-center py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-500/10 text-xs uppercase tracking-wider"
            >
              Proceed to Rent
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
