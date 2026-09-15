import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Activity,
  HardDrive,
  Cpu,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  NavSection,
  StatMetric,
  ProjectRecord,
  ActivityItem,
} from '../types';

interface MainContentProps {
  activeSection: NavSection;
  metrics: StatMetric[];
  projects: ProjectRecord[];
  activities: ActivityItem[];
  searchQuery: string;
  onAddProjectClick: () => void;
}

export const MainContent: React.FC<MainContentProps> = ({
  activeSection,
  metrics,
  projects,
  activities,
  searchQuery,
  onAddProjectClick,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Filter projects by both tab filter and search query
  const filteredProjects = useMemo(() => {
    return projects.filter((item) => {
      const matchesFilter =
        projectFilter === 'all'
          ? true
          : item.status.toLowerCase().replace(' ', '-') === projectFilter;
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [projects, projectFilter, searchQuery]);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Executive Performance Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Operational snapshot and system metrics updated in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Time Range Selector */}
          <div
            id="time-range-segmented-control"
            className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200/80"
          >
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                id={`btn-time-range-${range}`}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  timeRange === range
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>

          <button
            id="btn-refresh-dashboard"
            type="button"
            onClick={handleRefresh}
            title="Refresh statistics"
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          <button
            id="btn-export-csv"
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            id={metric.id}
            className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500 tracking-wide">
                {metric.label}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  metric.isPositive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                }`}
              >
                {metric.isPositive ? (
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-rose-600" />
                )}
                {metric.change}
              </span>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {metric.value}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                <span>{metric.timeframe}</span>
                {metric.secondaryLabel && (
                  <span className="text-slate-500 font-medium">
                    {metric.secondaryLabel}
                  </span>
                )}
              </div>
            </div>

            {/* Subtle progress / spark indicator */}
            <div className="w-full bg-slate-100 rounded-full h-1 mt-4 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  metric.isPositive ? 'bg-indigo-600' : 'bg-rose-500'
                }`}
                style={{
                  width:
                    metric.id === 'metric-revenue'
                      ? '78%'
                      : metric.id === 'metric-users'
                      ? '64%'
                      : metric.id === 'metric-conversion'
                      ? '82%'
                      : '92%',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Projects Table (left) & Side Analytics (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Projects Workstream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {/* Table Header Controls */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Active Project Deliverables
                </h2>
                <p className="text-xs text-slate-500">
                  {filteredProjects.length} tracking records matched
                </p>
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'active', label: 'Active' },
                  { id: 'under-review', label: 'Under Review' },
                  { id: 'completed', label: 'Completed' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    id={`filter-chip-${chip.id}`}
                    type="button"
                    onClick={() => setProjectFilter(chip.id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                      projectFilter === chip.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm" id="projects-table">
                <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th scope="col" className="py-3 px-4">Project & Client</th>
                    <th scope="col" className="py-3 px-4 hidden sm:table-cell">Budget</th>
                    <th scope="col" className="py-3 px-4">Progress</th>
                    <th scope="col" className="py-3 px-4">Status</th>
                    <th scope="col" className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                        No projects match the current criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((item) => (
                      <tr
                        key={item.id}
                        id={`row-project-${item.id}`}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-900 text-sm">
                            {item.name}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="font-medium text-slate-700">{item.client}</span>
                            <span>•</span>
                            <span className="text-slate-400">{item.category}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 hidden sm:table-cell">
                          <span className="font-medium text-slate-800 text-sm">
                            {item.budget}
                          </span>
                          <div className="text-[11px] text-slate-400">Due {item.deadline}</div>
                        </td>
                        <td className="py-3.5 px-4 min-w-32">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-semibold text-slate-700">{item.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.progress === 100
                                  ? 'bg-emerald-500'
                                  : item.progress > 60
                                  ? 'bg-indigo-600'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                              item.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.status === 'Active'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : item.status === 'Under Review'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            id={`btn-view-project-${item.id}`}
                            type="button"
                            className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            aria-label={`View details for ${item.name}`}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-3.5 bg-slate-50/60 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {filteredProjects.length} of {projects.length} deliverables</span>
              <button
                id="btn-add-table-project"
                type="button"
                onClick={onAddProjectClick}
                className="font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
              >
                + Register New Project
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Column: System Health & Activity Feed */}
        <div className="space-y-6">
          {/* Infrastructure Health */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                Cluster Telemetry
              </h3>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                Operational
              </span>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-slate-400" />
                    Compute Utilization
                  </span>
                  <span className="font-semibold text-slate-700">42%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '42%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                    Storage & Cache IO
                  </span>
                  <span className="font-semibold text-slate-700">68%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '68%' }} />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Region: us-east-1a</span>
              <span className="text-slate-600 font-medium">99.99% Target SLA</span>
            </div>
          </div>

          {/* Activity Stream */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Recent Team Activity
              </h3>
              <span className="text-xs text-indigo-600 hover:underline cursor-pointer font-medium">
                View all
              </span>
            </div>

            <div className="space-y-4">
              {activities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <img
                    src={act.user.avatar}
                    alt={act.user.name}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 leading-snug">
                      <strong className="font-semibold text-slate-900">
                        {act.user.name}
                      </strong>{' '}
                      {act.action}{' '}
                      <span className="font-medium text-indigo-600">{act.target}</span>
                    </p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {act.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics & Intelligence</h1>
          <p className="text-sm text-slate-500">Channel conversions, latency benchmarks, and user acquisition metrics.</p>
        </div>
        <button
          id="btn-analytics-download"
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          Download Analytics
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Direct Traffic</span>
          <div className="text-2xl font-bold text-slate-900 mt-2">48.2%</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">+3.4% this cycle</div>
          <p className="text-xs text-slate-400 mt-2">Driven primarily by direct portal access and bookmarked team dashboards.</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Referral & Partner</span>
          <div className="text-2xl font-bold text-slate-900 mt-2">32.6%</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">+5.1% this cycle</div>
          <p className="text-xs text-slate-400 mt-2">Integrations with GitHub Enterprise, Slack alerts, and Jira workspaces.</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Organic Search</span>
          <div className="text-2xl font-bold text-slate-900 mt-2">19.2%</div>
          <div className="text-xs text-slate-500 font-semibold mt-1">Stable (±0.2%)</div>
          <p className="text-xs text-slate-400 mt-2">Public technical documentation and developer community engagement.</p>
        </div>
      </div>

      {/* Traffic distribution bars */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Traffic Channel Breakdown</h3>
        <div className="space-y-4">
          {[
            { channel: 'North America (East/West)', percentage: 56, count: '142,800 sessions', color: 'bg-indigo-600' },
            { channel: 'Europe (Frankfurt & London)', percentage: 28, count: '71,400 sessions', color: 'bg-emerald-500' },
            { channel: 'Asia-Pacific (Tokyo & Singapore)', percentage: 16, count: '40,800 sessions', color: 'bg-amber-500' },
          ].map((item) => (
            <div key={item.channel} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">{item.channel}</span>
                <span className="text-slate-500 font-medium">{item.count} ({item.percentage}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Portfolio</h1>
          <p className="text-sm text-slate-500">Manage client milestones, budgets, and engineering deliverables.</p>
        </div>
        <button
          id="btn-new-project-view"
          type="button"
          onClick={onAddProjectClick}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
        >
          + Add Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((p) => (
          <div key={p.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {p.category}
                </span>
                <span className="text-xs font-semibold text-slate-600">{p.status}</span>
              </div>
              <h3 className="font-semibold text-slate-900 text-base mt-2.5">{p.name}</h3>
              <p className="text-xs text-slate-500 mt-1">Client: <span className="font-medium text-slate-800">{p.client}</span></p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500">Progress</span>
                <span className="font-semibold text-slate-800">{p.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${p.progress}%` }} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
                <span>Budget: {p.budget}</span>
                <span>Due: {p.deadline}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Directory</h1>
          <p className="text-sm text-slate-500">Enterprise accounts, active subscriptions, and contact points.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="py-3 px-4">Organization</th>
              <th className="py-3 px-4">Tier</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Monthly Spend</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {[
              { org: 'Starlight Labs', tier: 'Enterprise Plus', contact: 'sarah.c@starlight.io', spend: '$14,500', status: 'Active' },
              { org: 'Acuity Health', tier: 'Enterprise Dedicated', contact: 'security@acuity.health', spend: '$22,000', status: 'Active' },
              { org: 'Apex Logistics', tier: 'Scale Tier', contact: 'dev-team@apexlog.com', spend: '$8,400', status: 'Active' },
              { org: 'Finova Global', tier: 'Fintech Tier', contact: 'compliance@finovaglobal.com', spend: '$19,800', status: 'Trial' },
            ].map((cust) => (
              <tr key={cust.org} className="hover:bg-slate-50/60">
                <td className="py-3.5 px-4 font-semibold text-slate-900">{cust.org}</td>
                <td className="py-3.5 px-4 text-slate-600">{cust.tier}</td>
                <td className="py-3.5 px-4 text-slate-500">{cust.contact}</td>
                <td className="py-3.5 px-4 font-semibold text-slate-800">{cust.spend}</td>
                <td className="py-3.5 px-4 text-right">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {cust.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Compliance & Financial Reports</h1>
          <p className="text-sm text-slate-500">Download system statements, audit certificates, and revenue reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'Q3 2026 Executive Financial Summary', size: '2.4 MB PDF', date: 'Generated Sep 01, 2026' },
          { title: 'SOC 2 Type II Compliance Report', size: '4.8 MB PDF', date: 'Audited Aug 15, 2026' },
          { title: 'Infrastructure Latency & SLA Log', size: '1.1 MB CSV', date: 'Updated daily' },
          { title: 'Monthly Active User Breakdown', size: '890 KB XLSX', date: 'Generated Sep 10, 2026' },
        ].map((rep) => (
          <div key={rep.title} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-slate-800">{rep.title}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{rep.date} • {rep.size}</p>
            </div>
            <button
              id={`btn-download-${rep.title.toLowerCase().replace(/\s+/g, '-')}`}
              type="button"
              className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 max-w-3xl">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Preferences</h1>
        <p className="text-sm text-slate-500">Configure your workspace environment, alert channels, and security keys.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Notification Delivery</h3>
          <p className="text-xs text-slate-500 mb-4">Choose which communication channels receive critical infrastructure incidents.</p>
          <div className="space-y-3">
            {[
              { label: 'Real-time Deployment Alerts', desc: 'Notify on staging and production build status changes.' },
              { label: 'Security & Auth Anomalies', desc: 'Immediate email and Slack webhook on failed admin authentications.' },
              { label: 'Weekly Performance Digest', desc: 'Receive aggregated metrics report every Monday morning.' },
            ].map((item, idx) => (
              <label key={idx} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-1 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-800">{item.label}</div>
                  <div className="text-[11px] text-slate-500">{item.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-5 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">API & Integration Keys</h3>
          <p className="text-xs text-slate-500 mb-3">Enterprise token for internal CI/CD pipelines.</p>
          <div className="flex items-center gap-2">
            <input
              type="password"
              readOnly
              value="nx_live_9f823bc89104882103fca91"
              className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 flex-1"
            />
            <button
              id="btn-copy-api-key"
              type="button"
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main
      id="main-dashboard-content"
      className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/70"
    >
      {activeSection === 'overview' && renderOverview()}
      {activeSection === 'analytics' && renderAnalytics()}
      {activeSection === 'projects' && renderProjects()}
      {activeSection === 'customers' && renderCustomers()}
      {activeSection === 'reports' && renderReports()}
      {activeSection === 'settings' && renderSettings()}
    </main>
  );
};
