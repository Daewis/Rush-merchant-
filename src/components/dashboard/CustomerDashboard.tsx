import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { StatsCard } from './StatsCard';
import { ChartWidget } from './ChartWidget';
import { Package, Truck, Wallet, Clock, Plus, ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { jobApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface DeliveryItem {
  id: string;
  trackingCode: string;
  pickup: string;
  dropoff: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  amount: number;
  provider?: {
    name: string;
    avatar?: string;
  };
  estimatedTime?: string;
}

export function CustomerDashboard() {
  const { user, setView } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 12,
    activeDeliveries: 2,
    walletBalance: 45000,
    completedOrders: 10,
    savings: 3500,
  });
  const [recentDeliveries, setRecentDeliveries] = useState<DeliveryItem[]>([
    {
      id: 'job-101',
      trackingCode: 'RUSH-8821',
      pickup: 'Unilag Senate Building',
      dropoff: 'Moremi Hall Block B',
      status: 'in_transit',
      amount: 2500,
      provider: { name: 'Engr. Tunde' },
      estimatedTime: '12 mins',
    },
    {
      id: 'job-102',
      trackingCode: 'RUSH-7734',
      pickup: 'Yaba Tech Gate',
      dropoff: 'Faculty of Engineering',
      status: 'pending',
      amount: 1800,
      provider: { name: 'Sola Tech' },
      estimatedTime: '20 mins',
    },
  ]);
  const [weeklySpending, setWeeklySpending] = useState<{ label: string; value: number }[]>([
    { label: 'Mon', value: 3500 },
    { label: 'Tue', value: 1800 },
    { label: 'Wed', value: 4200 },
    { label: 'Thu', value: 2500 },
    { label: 'Fri', value: 6000 },
    { label: 'Sat', value: 1200 },
    { label: 'Sun', value: 0 },
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, deliveriesRes, spendingRes] = await Promise.allSettled([
        jobApi.getCustomerStats(),
        jobApi.getRecentDeliveries(),
        jobApi.getWeeklySpending(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.data?.data) {
        setStats((prev) => ({ ...prev, ...statsRes.value.data.data }));
      }
      if (deliveriesRes.status === 'fulfilled' && deliveriesRes.value?.data?.data) {
        setRecentDeliveries(deliveriesRes.value.data.data);
      }
      if (spendingRes.status === 'fulfilled' && spendingRes.value?.data?.data) {
        setWeeklySpending(spendingRes.value.data.data);
      }
    } catch {
      // Fallback state retained on network error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    in_transit: 'bg-blue-100 text-blue-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const statusLabels = {
    pending: 'Pending',
    in_transit: 'In Transit',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 p-6 md:p-8 text-white shadow-lg"
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Welcome back, {user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Blessing'}! 👋
            </h2>
            <p className="text-white/80 text-sm mt-1 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Unilag Akoka Campus Hub
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Quick dispatch in 5-15 mins
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setView('job-post')}
              className="bg-white text-orange-600 hover:bg-slate-50 font-semibold shadow"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Book New Job / Express Dispatch
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatsCard
          title="Active Deliveries"
          value={stats.activeDeliveries}
          icon={Truck}
          color="orange"
          trend={{ value: 12, label: 'vs last week' }}
        />
        <StatsCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="Completed Orders"
          value={stats.completedOrders}
          icon={Clock}
          color="green"
        />
        <StatsCard
          title="Wallet Balance"
          value={`₦${stats.walletBalance.toLocaleString()}`}
          icon={Wallet}
          color="emerald"
        />
      </motion.div>

      {/* Main Grid */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                Recent Orders & Handshakes
              </CardTitle>
              <Button
                onClick={() => setView('jobs')}
                variant="ghost"
                size="sm"
                className="text-xs text-amber-600 gap-1"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentDeliveries.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <Package className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-medium text-slate-600">No active bookings</p>
                  <Button
                    onClick={() => setView('job-post')}
                    variant="gradient"
                    size="sm"
                    className="mt-3"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Book Now
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentDeliveries.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback className="bg-amber-100 text-amber-800 text-xs font-bold">
                            {item.provider?.name?.charAt(0) || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-xs text-amber-600">
                              #{item.trackingCode}
                            </span>
                            <Badge className={statusColors[item.status]}>
                              {statusLabels[item.status]}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                            {item.pickup} → {item.dropoff}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <span className="font-bold text-sm block text-slate-900">
                          ₦{item.amount.toLocaleString()}
                        </span>
                        {item.estimatedTime && (
                          <span className="text-[11px] text-slate-400">{item.estimatedTime}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <ChartWidget
            title="Weekly Dispatch Spending"
            data={weeklySpending}
            valuePrefix="₦"
          />
        </div>
      </motion.div>
    </div>
  );
}
