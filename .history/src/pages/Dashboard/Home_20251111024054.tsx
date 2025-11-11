import { useState, useEffect } from "react";
// -------------------------------------------------------------------------
// FIREBASE IMPORTS
// -------------------------------------------------------------------------
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase";
// -------------------------------------------------------------------------

import PageMeta from "../../components/common/PageMeta";

// --- 1. INTERFACES ---
interface DashboardMetrics {
  totalApplicants: number;
  pendingCount: number;
  successCount: number;
  successRate: string; // Percentage string
  failedCount: number;
  // Data for the recent activity table
  recentActivity: { name: string; status: string; date: string }[];
}

// --- 2. WIDGET RENDERING HELPERS (Functional Widgets) ---

// Helper function to format Date objects (since Firestore timestamps are used)
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Widget 1: Analyze Resume (Key Metrics Card)
const KeyMetricsCard = ({ metrics }: { metrics: DashboardMetrics }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
    <h4 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">Key Performance Metrics</h4>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
      {/* Total Applicants */}
      <div className="p-4 bg-blue-50/70 dark:bg-blue-950/50 rounded-lg shadow-sm">
        <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{metrics.totalApplicants}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Applicants</p>
      </div>
      {/* Pending Review */}
      <div className="p-4 bg-orange-50/70 dark:bg-orange-950/50 rounded-lg shadow-sm">
        <p className="text-3xl font-extrabold text-orange-600 dark:text-orange-400">{metrics.pendingCount}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pending Review</p>
      </div>
      {/* Success Rate */}
      <div className="p-4 bg-green-50/70 dark:bg-green-950/50 rounded-lg shadow-sm">
        <p className="text-3xl font-extrabold text-green-600 dark:text-green-400">{metrics.successRate}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Success Rate</p>
      </div>
    </div>
  </div>
);

// Widget 2: Monthly Engagement Chart (Distribution Placeholder)
const EngagementChartPlaceholder = ({ metrics }: { metrics: DashboardMetrics }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">Applicant Status Trends (Distribution)</h4>

    <div className="flex items-center justify-center h-64 mt-4 p-4">
      {metrics.totalApplicants === 0 ? (
        <p className="text-gray-500">No data available for distribution chart.</p>
      ) : (
        <div className="w-full">
          <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 flex overflow-hidden">
            {/* Success Bar */}
            <div
              className="bg-green-500"
              style={{ width: `${(metrics.successCount / metrics.totalApplicants) * 100}%` }}
              title={`${metrics.successCount} Successful`}
            ></div>
            {/* Pending Bar */}
            <div
              className="bg-orange-500"
              style={{ width: `${(metrics.pendingCount / metrics.totalApplicants) * 100}%` }}
              title={`${metrics.pendingCount} Pending`}
            ></div>
            {/* Failed Bar */}
            <div
              className="bg-red-500"
              style={{ width: `${(metrics.failedCount / metrics.totalApplicants) * 100}%` }}
              title={`${metrics.failedCount} Failed`}
            ></div>
          </div>
          <div className="mt-3 flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Success: {metrics.successCount}</span>
            <span>Pending: {metrics.pendingCount}</span>
            <span>Failed: {metrics.failedCount}</span>
          </div>
        </div>
      )}
    </div>
  </div>
);

// Widget 3: Interview History (Recent Activity Table)
const RecentActivityTable = ({ metrics }: { metrics: DashboardMetrics }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Recent Applicant Activity</h4>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Applicant</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Status</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {metrics.recentActivity.map((activity, index) => (
            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white/90">{activity.name}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${activity.status === 'Success' ? 'bg-green-100 text-green-800' :
                    activity.status === 'Failed' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                  }`}>
                  {activity.status}
                </span>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{activity.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {metrics.recentActivity.length === 0 && (
        <p className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">No recent activity recorded.</p>
      )}
    </div>
  </div>
);

// Helper Component to render the dashboard content only when data is ready
const DashboardContent = ({ metrics }: { metrics: DashboardMetrics }) => (
  <>
    <div className="col-span-12 space-y-6 xl:col-span-7">
      {/* Key Metrics Card */}
      <KeyMetricsCard metrics={metrics} />

      {/* Engagement Chart Placeholder */}
      <EngagementChartPlaceholder metrics={metrics} />
    </div>

    <div className="col-span-12 xl:col-span-5">
      {/* Hiring Summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] h-full">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">Hiring Summary</h4>
        <p className="mt-4 text-gray-700 dark:text-gray-300">
          Total Successful Hires: <strong className="text-green-600">{metrics.successCount}</strong><br />
          Total Rejected Candidates: <strong className="text-red-600">{metrics.failedCount}</strong>
        </p>
        <p className="mt-4 text-sm text-gray-500">
          The overall success rate is currently: <strong className="font-bold">{metrics.successRate}</strong>.
        </p>
      </div>
    </div>

    <div className="col-span-12">
      {/* Overall Application Statistics Placeholder */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">Overall Application Statistics</h4>
        <p className="text-gray-500 mt-2">Distribution: {metrics.pendingCount} Pending, {metrics.successCount} Successful, {metrics.failedCount} Failed.</p>
        <p className="text-sm text-gray-400 mt-2">This summary reflects the current status distribution of all candidates in the system.</p>
      </div>
    </div>

    <div className="col-span-12 xl:col-span-12">
      {/* Recent Activity Table */}
      <RecentActivityTable metrics={metrics} />
    </div>
  </>
);


export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalApplicants: 0,
    pendingCount: 0,
    successCount: 0,
    successRate: '0%',
    failedCount: 0, // Initialized
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // =================================================================
  // 🎯 DATA AGGREGATION LOGIC
  // =================================================================
  useEffect(() => {
    const aggregateData = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        // Fetch ALL applicants
        const accountsCollectionRef = collection(db, "accounts");
        const accountsSnapshot = await getDocs(accountsCollectionRef);
        const allApplicants = accountsSnapshot.docs.map(doc => doc.data());

        const total = allApplicants.length;
        const pending = allApplicants.filter(a => a.status === 'Pending').length;
        const success = allApplicants.filter(a => a.status === 'Success').length;
        const failed = allApplicants.filter(a => a.status === 'Failed').length; // Correctly calculate Failed count

        const rate = total > 0 ? ((success / total) * 100).toFixed(1) + '%' : '0%';

        // Fetch Recent Activity (limiting to 5 latest actions for the table)
        const activityQuery = query(
          accountsCollectionRef,
          // Use a common timestamp field for ordering (e.g., lastUpdated or createdAt)
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const activitySnapshot = await getDocs(activityQuery);

        const recentActivities = activitySnapshot.docs.map(doc => {
          const data = doc.data();
          // Use lastUpdated if available, otherwise fallback to createdAt
          const timestamp = data.lastUpdated || data.createdAt;
          const lastUpdatedDate = timestamp && timestamp.toDate ? timestamp.toDate() : new Date();

          return {
            name: `${data.firstName || 'Unknown'} ${data.lastName || ''}`,
            status: data.status || 'Pending',
            date: formatDate(lastUpdatedDate),
          };
        });


        setMetrics({
          totalApplicants: total,
          pendingCount: pending,
          successCount: success,
          successRate: rate,
          failedCount: failed, // Save failed count
          recentActivity: recentActivities,
        });

      } catch (err) {
        console.error("Dashboard Data Fetch Error:", err);
        setFetchError("Failed to load dashboard data. Ensure the 'accounts' collection exists and has public read access.");
      } finally {
        setLoading(false);
      }
    };

    aggregateData();
  }, []);

  // 4. MAIN RENDER
  return (
    <>
      <PageMeta
        title="IAIN Admin Dashboard"
        description="Dashboard showing key metrics, applicant statistics, and history."
      />

      <div className="grid grid-cols-12 gap-4 md:gap-6">

        {fetchError && (
          <div className="col-span-12 py-5 text-center text-error-500 border border-error-500 bg-red-100 rounded-lg">{fetchError}</div>
        )}

        {loading ? (
          <div className="col-span-12 py-20 text-center text-gray-500">Loading Dashboard Insights...</div>
        ) : (
          <DashboardContent metrics={metrics} />
        )}
      </div>
    </>
  );
}