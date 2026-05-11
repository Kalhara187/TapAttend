import { useEffect, useMemo, useState } from 'react';
import QRCode from 'react-qr-code';
import { HiOutlinePlus, HiOutlineArrowPath } from 'react-icons/hi2';
import { adminApi } from '../../services/api';

function StatusPill({ value }) {
  const classes = {
    Active: 'bg-emerald-50 text-emerald-700',
    'On Leave': 'bg-amber-50 text-amber-700',
    Inactive: 'bg-slate-100 text-slate-600',
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes[value] || classes.Active}`}>{value}</span>;
}

const emptyForm = {
  fullName: '',
  email: '',
  department: 'Operations',
  role: 'employee',
  username: '',
  password: '',
  autoGeneratePassword: true,
};

export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [createResult, setCreateResult] = useState(null);
  const [error, setError] = useState('');

  const loadEmployees = async () => {
    try {
      const res = await adminApi.getEmployees();
      if (res.data?.success && Array.isArray(res.data.data)) {
        setEmployees(res.data.data);
        setSelectedEmployee((prev) => prev || res.data.data[0] || null);
      }
    } catch {
      setEmployees([]);
    }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!mounted) return;
      await loadEmployees();
    };

    load();
    const intervalId = setInterval(load, 10000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const departments = useMemo(
    () => Array.from(new Set(employees.map((item) => item.department).filter(Boolean))),
    [employees]
  );

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = [employee.fullName, employee.email, employee.employeeId].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchesDepartment = department === 'All' || employee.department === department;
    return matchesSearch && matchesDepartment;
  });

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const openCreateModal = () => {
    setError('');
    setCreateResult(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const submitEmployee = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setCreateResult(null);

    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        department: form.department,
        role: form.role,
        username: form.username || undefined,
        password: form.autoGeneratePassword ? undefined : form.password,
        autoGeneratePassword: form.autoGeneratePassword,
      };

      const response = await adminApi.createEmployee(payload);
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Unable to create employee');
      }

      setCreateResult(response.data);
      setModalOpen(false);
      await loadEmployees();
      setSelectedEmployee({
        id: response.data.employee.id,
        employeeId: response.data.employee.employeeId,
        username: response.data.employee.username,
        fullName: response.data.employee.fullName,
        email: response.data.employee.email,
        department: response.data.employee.department,
        role: response.data.employee.role,
        accountStatus: response.data.employee.accountStatus,
        registrationDate: response.data.employee.registrationDate,
      });
    } catch (createError) {
      setError(createError?.response?.data?.message || createError.message || 'Unable to create employee');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-[2rem] p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Employee Management</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Manage employee profiles, departments, and access.</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={loadEmployees}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
            >
              <HiOutlineArrowPath className="h-4 w-4" /> Refresh
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/20"
            >
              <HiOutlinePlus className="h-5 w-5" /> Add Employee
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, or ID"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
          />
          <select
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500"
          >
            <option>All</option>
            {departments.map((item) => <option key={item}>{item}</option>)}
          </select>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
            {filteredEmployees.length} employees shown
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                {['Employee ID', 'Full Name', 'Email', 'Department', 'Role', 'Account Status', 'Registration Date'].map((heading) => (
                  <th key={heading} className="px-5 py-4 font-semibold">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredEmployees.map((employee) => (
                <tr
                  key={employee.id}
                  className="cursor-pointer hover:bg-slate-50/70"
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <td className="px-5 py-4 text-sm font-semibold text-slate-900">{employee.employeeId}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{employee.fullName}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{employee.email}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{employee.department}</td>
                  <td className="px-5 py-4 text-sm capitalize text-slate-500">{employee.role}</td>
                  <td className="px-5 py-4"><StatusPill value={employee.accountStatus} /></td>
                  <td className="px-5 py-4 text-sm text-slate-500">{new Date(employee.registrationDate).toLocaleDateString()}</td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-6 text-sm text-slate-500">No employees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEmployee && (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Employee Details</p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">{selectedEmployee.fullName}</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Employee ID', selectedEmployee.employeeId],
              ['Username', selectedEmployee.username || '-'],
              ['Email', selectedEmployee.email],
              ['Department', selectedEmployee.department],
              ['Role', selectedEmployee.role],
              ['Account Status', selectedEmployee.accountStatus],
              ['Registration Date', new Date(selectedEmployee.registrationDate).toLocaleString()],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {createResult && (
        <div className="rounded-[2rem] border border-teal-200 bg-teal-50 p-6 shadow-xl shadow-teal-900/5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Created Employee</p>
          <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_280px]">
            <div className="space-y-3 text-sm text-slate-700">
              <p><span className="font-semibold text-slate-900">Username:</span> {createResult.employee.username}</p>
              <p><span className="font-semibold text-slate-900">Temporary Password:</span> {createResult.generatedPassword}</p>
              <p><span className="font-semibold text-slate-900">Employee ID:</span> {createResult.employee.employeeId}</p>
              <p><span className="font-semibold text-slate-900">QR Token:</span> {createResult.qrToken}</p>
              <p className="text-slate-500">Share the credentials with the employee. They can log in with the username and password above.</p>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <QRCode value={createResult.qrData} className="h-auto w-full" />
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <form onSubmit={submitEmployee} className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Add Employee</h3>
                <p className="mt-1 text-sm text-slate-500">Create the account, credentials, and QR in one step.</p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600">
                Close
              </button>
            </div>

            {error && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input name="fullName" value={form.fullName} onChange={handleFormChange} placeholder="Employee Full Name" className="rounded-2xl border border-slate-200 px-4 py-3" required />
              <input name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="Email" className="rounded-2xl border border-slate-200 px-4 py-3" required />
              <select name="department" value={form.department} onChange={handleFormChange} className="rounded-2xl border border-slate-200 px-4 py-3">
                {departments.map((item) => <option key={item}>{item}</option>)}
              </select>
              <select name="role" value={form.role} onChange={handleFormChange} className="rounded-2xl border border-slate-200 px-4 py-3">
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
              <input name="username" value={form.username} onChange={handleFormChange} placeholder="Username (leave blank to auto-generate)" className="rounded-2xl border border-slate-200 px-4 py-3" />
              <label className="col-span-full flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <input type="checkbox" name="autoGeneratePassword" checked={form.autoGeneratePassword} onChange={handleFormChange} className="h-4 w-4 rounded border-slate-300 text-teal-600" />
                Auto-generate password
              </label>
              {!form.autoGeneratePassword && (
                <input name="password" type="text" value={form.password} onChange={handleFormChange} placeholder="Custom password" className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2" required />
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Cancel</button>
              <button type="submit" disabled={submitting} className="rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-70">
                {submitting ? 'Creating...' : 'Create Employee'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}