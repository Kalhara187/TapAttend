import { useEffect, useState } from 'react';
import { HiOutlinePencilSquare, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2';
import { adminApi } from '../../services/api';
import { mockEmployees } from '../../data/mockData';

const initialForm = {
  id: '',
  name: '',
  email: '',
  department: 'Operations',
  role: 'employee',
  status: 'Active',
};

const departments = ['Operations', 'Engineering', 'HR', 'Finance', 'Sales'];

function StatusPill({ value }) {
  const classes = {
    Active: 'bg-emerald-50 text-emerald-700',
    'On Leave': 'bg-amber-50 text-amber-700',
    Inactive: 'bg-slate-100 text-slate-600',
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes[value] || classes.Active}`}>{value}</span>;
}

export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState(mockEmployees);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    adminApi
      .getEmployees()
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.employees)) {
          setEmployees(res.data.employees);
        }
      })
      .catch(() => {});
  }, []);

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = [employee.name, employee.email, employee.id].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchesDepartment = department === 'All' || employee.department === department;
    return matchesSearch && matchesDepartment;
  });

  const openCreate = () => {
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (employee) => {
    setForm(employee);
    setModalOpen(true);
  };

  const handleSave = (event) => {
    event.preventDefault();
    setEmployees((current) => {
      const exists = current.some((item) => item.id === form.id);
      if (exists) return current.map((item) => (item.id === form.id ? form : item));
      const nextId = `EMP-${String(current.length + 1001)}`;
      return [{ ...form, id: nextId }, ...current];
    });
    setModalOpen(false);
  };

  const removeEmployee = (id) => {
    setEmployees((current) => current.filter((employee) => employee.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-[2rem] p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Employee Management</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Manage employee profiles, departments, and access.</h2>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/20"
          >
            <HiOutlinePlus className="h-5 w-5" /> Add employee
          </button>
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
                {['Employee ID', 'Name', 'Email', 'Department', 'Role', 'Status', 'Actions'].map((heading) => (
                  <th key={heading} className="px-5 py-4 font-semibold">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4 text-sm font-semibold text-slate-900">{employee.id}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{employee.name}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{employee.email}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{employee.department}</td>
                  <td className="px-5 py-4 text-sm capitalize text-slate-500">{employee.role}</td>
                  <td className="px-5 py-4"><StatusPill value={employee.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(employee)}
                        className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700"
                      >
                        <HiOutlinePencilSquare className="h-4 w-4" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeEmployee(employee.id)}
                        className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                      >
                        <HiOutlineTrash className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900">{form.id ? 'Edit employee' : 'Add employee'}</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                ['name', 'Full name'],
                ['email', 'Email'],
                ['department', 'Department'],
                ['role', 'Role'],
                ['status', 'Status'],
              ].map(([field, label]) =>
                field === 'role' ? (
                  <select
                    key={field}
                    value={form[field]}
                    onChange={(event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))}
                    className="rounded-2xl border border-slate-200 px-4 py-3"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : field === 'department' ? (
                  <select
                    key={field}
                    value={form[field]}
                    onChange={(event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))}
                    className="rounded-2xl border border-slate-200 px-4 py-3"
                  >
                    {departments.map((item) => <option key={item}>{item}</option>)}
                  </select>
                ) : field === 'status' ? (
                  <select
                    key={field}
                    value={form[field]}
                    onChange={(event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))}
                    className="rounded-2xl border border-slate-200 px-4 py-3"
                  >
                    <option>Active</option>
                    <option>On Leave</option>
                    <option>Inactive</option>
                  </select>
                ) : (
                  <input
                    key={field}
                    value={form[field]}
                    onChange={(event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))}
                    placeholder={label}
                    className="rounded-2xl border border-slate-200 px-4 py-3"
                  />
                )
              )}
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Cancel</button>
              <button type="submit" className="rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 px-4 py-3 text-sm font-bold text-white">Save changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}