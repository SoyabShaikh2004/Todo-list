import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  Table,
  CheckCircle2,
  Server,
  Layers,
  Search,
  Code,
  List,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Clock,
  Tag,
  ArrowUpDown,
  Download,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { fetchDatabaseInspection, DatabaseInspectionData, syncBatchTasksToPostgres } from '../../services/storage';
import { User } from '../../types';

interface DatabaseViewProps {
  currentUser: User;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({ currentUser }) => {
  const isAuthorizedAdmin = currentUser.email.toLowerCase() === 'soyxbshxikh@gmail.com';
  const [data, setData] = useState<DatabaseInspectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTable, setActiveTable] = useState<'tasks' | 'users' | 'schema'>('tasks');
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadDatabaseData = async () => {
    if (!isAuthorizedAdmin) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const result = await fetchDatabaseInspection(currentUser.email);
    if (result) {
      setData(result);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadDatabaseData();
  }, [isAuthorizedAdmin]);

  const handleSyncLocalTasks = async () => {
    setIsSyncing(true);
    setSyncStatus('Syncing tasks to PostgreSQL...');
    const ok = await syncBatchTasksToPostgres(currentUser.id);
    if (ok) {
      setSyncStatus('Successfully synced tasks with PostgreSQL!');
      await loadDatabaseData();
    } else {
      setSyncStatus('Sync encountered an issue. Check connection.');
    }
    setIsSyncing(false);
    setTimeout(() => setSyncStatus(null), 4000);
  };

  const handleDownloadJSON = () => {
    if (!data) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `cloud_sql_database_export_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadCSV = () => {
    if (!data) return;
    const rows = activeTable === 'tasks' ? data.tables.tasks.rows : data.tables.users.rows;
    if (rows.length === 0) {
      setSyncStatus(`No records in ${activeTable} to export.`);
      setTimeout(() => setSyncStatus(null), 3500);
      return;
    }

    const headers = Object.keys(rows[0]);
    const csvLines = [
      headers.join(','),
      ...rows.map((row) =>
        headers
          .map((h) => {
            const val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ];

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeTable}_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDownloadSQL = () => {
    if (!data) return;
    let sql = `-- Cloud SQL PostgreSQL Dump\n-- Database: ${data.database}\n-- Generated: ${new Date().toISOString()}\n\n`;

    sql += `-- USERS TABLE DUMP\n`;
    for (const u of data.tables.users.rows) {
      sql += `INSERT INTO users (id, full_name, email, mobile, password_hash) VALUES ('${u.id}', '${(u.fullName || '').replace(/'/g, "''")}', '${u.email}', '${u.mobile || ''}', '${u.passwordHash || ''}') ON CONFLICT (id) DO NOTHING;\n`;
    }

    sql += `\n-- TASKS TABLE DUMP\n`;
    for (const t of data.tables.tasks.rows) {
      sql += `INSERT INTO tasks (id, user_id, title, description, due_date, due_time, priority, status, category, completed_at, incomplete_reason) VALUES ('${t.id}', '${t.userId}', '${(t.title || '').replace(/'/g, "''")}', '${(t.description || '').replace(/'/g, "''")}', '${t.dueDate}', ${t.dueTime ? `'${t.dueTime}'` : 'NULL'}, '${t.priority}', '${t.status}', '${t.category}', ${t.completedAt ? `'${t.completedAt}'` : 'NULL'}, ${t.incompleteReason ? `'${t.incompleteReason}'` : 'NULL'}) ON CONFLICT (id) DO NOTHING;\n`;
    }

    const blob = new Blob([sql], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `database_dump_${new Date().toISOString().slice(0, 10)}.sql`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredTasks = (data?.tables.tasks.rows || []).filter((task: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      task.title?.toLowerCase().includes(q) ||
      task.category?.toLowerCase().includes(q) ||
      task.status?.toLowerCase().includes(q) ||
      task.priority?.toLowerCase().includes(q) ||
      task.id?.toLowerCase().includes(q)
    );
  });

  const filteredUsers = (data?.tables.users.rows || []).filter((user: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.id?.toLowerCase().includes(q)
    );
  });

  if (!isAuthorizedAdmin) {
    return (
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-12 max-w-2xl mx-auto w-full">
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Access Restricted</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            The Cloud SQL Database Explorer is restricted to the administrator credentials (
            <span className="font-semibold text-slate-900 dark:text-white">soyxbshxikh@gmail.com</span>).
          </p>
          <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400">
            Currently logged in as: <span className="font-semibold">{currentUser.email}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Database className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Cloud SQL Database Explorer
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Live PostgreSQL instance running on Google Cloud SQL in region <span className="font-semibold text-indigo-600 dark:text-indigo-400">asia-southeast1</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download options */}
          <button
            type="button"
            onClick={handleDownloadJSON}
            disabled={!data || isLoading}
            title="Download full database as JSON"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Download JSON</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCSV}
            disabled={!data || isLoading}
            title="Download active table as CSV (Excel compatible)"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSQL}
            disabled={!data || isLoading}
            title="Download SQL INSERT statements"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Export .SQL</span>
          </button>

          <button
            type="button"
            onClick={handleSyncLocalTasks}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync to DB</span>
          </button>

          <button
            type="button"
            onClick={loadDatabaseData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {syncStatus && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Database Metadata Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Database Engine</span>
            <Server className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>PostgreSQL 16</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              Live
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
            Region: asia-southeast1
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Database Name</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-base font-bold text-slate-900 dark:text-white truncate">
            {data?.database || 'postgres'}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Drizzle ORM + pg.Pool
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Tasks Table Rows</span>
            <Table className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {data?.totalTasks ?? 0}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Records in &quot;tasks&quot; table
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Users Table Rows</span>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {data?.totalUsers ?? 0}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Records in &quot;users&quot; table
          </div>
        </div>
      </div>

      {/* Main Table Explorer Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Navigation Tabs and Controls */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTable('tasks')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                activeTable === 'tasks'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>tasks</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-600">
                {data?.totalTasks ?? 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTable('users')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                activeTable === 'users'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>users</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-600">
                {data?.totalUsers ?? 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTable('schema')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                activeTable === 'schema'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Schema & Columns</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {activeTable !== 'schema' && (
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={`Search ${activeTable}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44 sm:w-56"
                />
              </div>
            )}

            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Table view"
                className={`p-1.5 rounded-lg text-xs cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('json')}
                title="JSON view"
                className={`p-1.5 rounded-lg text-xs cursor-pointer ${
                  viewMode === 'json'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Code className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Querying Cloud SQL PostgreSQL instance...
            </p>
          </div>
        ) : activeTable === 'schema' ? (
          /* Schema / Columns Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Table</th>
                  <th className="px-4 py-3">Column</th>
                  <th className="px-4 py-3">PostgreSQL Data Type</th>
                  <th className="px-4 py-3">Nullable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(data?.schemaColumns || []).map((col, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 font-mono">
                    <td className="px-4 py-2.5 font-semibold text-indigo-600 dark:text-indigo-400">
                      {col.table_name}
                    </td>
                    <td className="px-4 py-2.5 text-slate-900 dark:text-white font-medium">
                      {col.column_name}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">
                      {col.data_type}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        col.is_nullable === 'YES' 
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400' 
                          : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {col.is_nullable === 'YES' ? 'nullable' : 'not null'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : viewMode === 'json' ? (
          /* JSON Raw Dump */
          <div className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[600px]">
            <pre>
              {JSON.stringify(
                activeTable === 'tasks' ? filteredTasks : filteredUsers,
                null,
                2
              )}
            </pre>
          </div>
        ) : activeTable === 'tasks' ? (
          /* Tasks Table View */
          filteredTasks.length === 0 ? (
            <div className="py-16 text-center text-slate-500 dark:text-slate-400">
              <Table className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-medium">No tasks found in PostgreSQL table &quot;tasks&quot;.</p>
              <p className="text-xs text-slate-400 mt-1">
                Click &quot;Sync Tasks to PostgreSQL&quot; above or create a new task to add records.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">User ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTasks.map((t: any) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                        {t.id}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {t.title}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {t.dueDate || t.due_date} {t.dueTime || t.due_time ? `(${t.dueTime || t.due_time})` : ''}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            t.status === 'completed'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                              : t.status === 'in_progress'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                              : t.status === 'not_completed'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                            t.priority === 'urgent'
                              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                              : t.priority === 'high'
                              ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {t.category}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400 truncate max-w-[100px]">
                        {t.userId || t.user_id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Users Table View */
          filteredUsers.length === 0 ? (
            <div className="py-16 text-center text-slate-500 dark:text-slate-400">
              <Table className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-medium">No users found in PostgreSQL table &quot;users&quot;.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">User ID</th>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Email Address</th>
                    <th className="px-4 py-3">Firebase UID</th>
                    <th className="px-4 py-3">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((u: any) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {u.id}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        {u.fullName || u.full_name}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {u.email}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400 truncate max-w-[120px]">
                        {u.uid || '(Email/Password user)'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {u.createdAt || u.created_at ? new Date(u.createdAt || u.created_at).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};
