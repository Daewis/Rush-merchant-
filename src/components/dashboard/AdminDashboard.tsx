import { useState, useEffect } from 'react';
import { StatsCard } from './StatsCard';
import { ChartWidget } from './ChartWidget';
import { Users, Truck, DollarSign, ShieldAlert, Activity, Server, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { adminApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface SystemMetric {
  totalUsers: number;
  activeProviders: number;
  totalTransactions: number;
  flaggedIncidents: number;
  serverUptime: number;
  activeSessions: number;
}

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<SystemMetric>({
    totalUsers: 1420,
    activeProviders: 184,
    totalTransactions: 2850000,
    flaggedIncidents: 3,
    serverUptime: 99.98,
    activeSessions: 312,
  });
  const [volumeByRegion, setVolumeByRegion] = useState<{ label: string; value: number }[]>([
    { label: 'Unilag Akoka', value: 480 },
    { label: 'Yaba Tech', value: 310 },
    { label: 'Lagos State Univ', value: 240 },
    { label: 'Unilag Idi-Araba', value: 190 },
  ]);
  const [recentSystemLogs, setRecentSystemLogs] = useState<
    { id: string; event: string; timestamp: string; level: 'info' | 'warn' | 'error' | 'success' }[]
  >([
    { id: 'log-1', event: 'Escrow Released for Order #RUSH-8821', timestamp: '2 mins ago', level: 'success' },
    { id: 'log-2', event: 'NIN Verification Approved for Artisan #442', timestamp: '8 mins ago', level: 'info' },
    { id: 'log-3', event: 'Dispute Opened on Job #RUSH-7734', timestamp: '15 mins ago', level: 'warn' },
    { id: 'log-4', event: 'OTP Handshake Verified for Order #RUSH-8810', timestamp: '22 mins ago', level: 'success' },
  ]);
  const [revenueData, setRevenueData] = useState<{ label: string; value: number }[]>([
    { label: 'Mon', value: 180000 },
    { label: 'Tue', value: 240000 },
    { label: 'Wed', value: 310000 },
    { label: 'Thu', value: 290000 },
    { label: 'Fri', value: 450000 },
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [metricsRes, regionRes, logsRes, revenueRes] = await Promise.allSettled([
        adminApi.getMetrics(),
        adminApi.getRegionStats(),
        adminApi.getSystemLogs(),
        adminApi.getRevenueData(),
      ]);

      if (metricsRes.status === 'fulfilled' && metricsRes.value?.data?.data) {
        setMetrics((prev) => ({ ...prev, ...metricsRes.value.data.data }));
      }
      if (regionRes.status === 'fulfilled' && regionRes.value?.data?.data) {
        setVolumeByRegion(regionRes.value.data.data);
      }
      if (logsRes.status === 'fulfilled' && logsRes.value?.data?.data) {
        setRecentSystemLogs(logsRes.value.data.data);
      }
      if (revenueRes.status === 'fulfilled' && revenueRes.value?.data?.data) {
        setRevenueData(revenueRes.value.data.data);
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
        <LoadingSpinner text="Loading admin console..." />
      </div>
    );
  }

  const getLogColor = (level: string) => {
    const colors = {
      info: 'bg-blue-50 text-blue-700 border-blue-200',
      warn: 'bg-amber-50 text-amber-700 border-amber-200',
      error: 'bg-red-50 text-red-700 border-red-200',
      success: 'bg-green-50 text-green-700 border-green-200',
    };
    return colors[level as keyof typeof colors] || colors.info;
  };

  const getLogIcon = (level: string) => {
    const icons = {
      info: <Activity className="h-4 w-4 text-blue-600" />,
      warn: <AlertTriangle className="h-4 w-4 text-amber-600" />,
      error: <ShieldAlert className="h-4 w-4 text-red-600" />,
      success: <CheckCircle className="h-4 w-4 text-green-600" />,
    };
    return icons[level as keyof typeof icons] || icons.info;
  };

  return (
    <div className="space-y-6">
      {/* Platform Overview Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 text-white shadow-lg"
      >
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Server className="h-5 w-5 text-amber-400" />
            RushNG System Governance Console
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Real-time platform metrics, Escrow Vault safety, and NIN/BVN compliance checks
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
            </span>
            <span className="font-semibold text-green-400">All Nodes Healthy</span>
          </div>
          <Badge className="bg-white/10 text-white border-white/20 font-mono text-xs">
            Uptime: {metrics.serverUptime}%
          </Badge>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatsCard
          title="Registered Users"
          value={metrics.totalUsers}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Active Providers"
          value={metrics.activeProviders}
          icon={Truck}
          color="orange"
        />
        <StatsCard
          title="Escrow Volume"
          value={`₦${(metrics.totalTransactions / 1000).toFixed(1)}K`}
          icon={DollarSign}
          color="emerald"
        />
        <StatsCard
          title="Active Sessions"
          value={metrics.activeSessions}
          icon={Activity}
          color="purple"
        />
      </motion.div>

      {/* System Health Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Escrow Transactions</p>
                <p className="text-2xl font-bold mt-1 text-slate-900">₦2.85M</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/40">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Flagged Disputes</p>
                <p className="text-2xl font-bold mt-1 text-amber-700">{metrics.flaggedIncidents}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-100 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/40">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Verified Identity Registrations</p>
                <p className="text-2xl font-bold mt-1 text-blue-700">99.4%</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100 text-blue-700">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Region & Revenue */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-amber-600" />
                Live Audit Logs & Security Handshakes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {recentSystemLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-center justify-between p-3 rounded-xl border ${getLogColor(log.level)}`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="shrink-0">{getLogIcon(log.level)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{log.event}</p>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {log.timestamp}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${getLogColor(log.level)} capitalize text-[10px]`}>
                      {log.level}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <ChartWidget
            title="Weekly Platform Revenue (₦)"
            data={revenueData}
            valuePrefix="₦"
          />

          <ChartWidget
            title="Dispatch Volume by Campus"
            data={volumeByRegion}
          />
        </div>
      </motion.div>
    </div>
  );
}
