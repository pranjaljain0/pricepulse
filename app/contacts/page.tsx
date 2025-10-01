"use client";

import { TableCell, TableScrollWrapper } from "../../components/TableHelpers";
import { useEffect, useState } from "react";

import Confirm from "../../components/Confirm";
import DropdownMenu from "../../components/Dropdown";
import EmptyState from "../../components/EmptyState";
import IconButton from "../../components/Interactive";
import Modal from "../../components/Modal";
import PlusButton from "../../components/PlusButton";
import Snackbar from "../../components/Snackbar";
import { useRouter } from 'next/navigation'

type ContactRow = { id: string; name?: string; company?: string; designation?: string; birthday?: string; contact_number?: string; email?: string; other_details?: string; _time?: string };

const ALL_FIELDS: Array<{ key: keyof ContactRow; label: string }> = [
  { key: 'name', label: 'Name' },
  { key: 'company', label: 'Company' },
  { key: 'designation', label: 'Designation' },
  { key: 'birthday', label: 'Birthday' },
  { key: 'contact_number', label: 'Contact Number' },
  { key: 'email', label: 'Email' },
  { key: 'other_details', label: 'Other info' }
]

export default function ContactsPage() {
  const router = useRouter()
  const [rows, setRows] = useState<ContactRow[]>([]);
  const [open, setOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<ContactRow | null>(null);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [designation, setDesignation] = useState('');
  const [birthday, setBirthday] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otherInfo, setOtherInfo] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ContactRow | null>(null);
  const [crudToast, setCrudToast] = useState<{ open: boolean; msg: string; actionLabel?: string; onAction?: (() => void) | null; onClose?: (() => void) | null }>({ open: false, msg: '' });

  // Visible columns state — default to name and contact_number
  const [visible, setVisible] = useState<Array<keyof ContactRow>>(['name', 'contact_number']);

  useEffect(() => {
    ; (async () => {
      try {
        const res = await fetch('/api/contacts')
        const data = await res.json().catch(() => null)
        if (res.status === 401) {
          setCrudToast({ open: true, msg: 'Unauthorized - please login', onClose: () => setCrudToast({ open: false, msg: '' }) })
          router.push('/login')
          return
        }
        if (!res.ok) {
          setRows([])
          setCrudToast({ open: true, msg: (data && (data.error || data.message)) || 'Failed to load contacts', onClose: () => setCrudToast({ open: false, msg: '' }) })
        } else if (Array.isArray(data)) {
          setRows(data)
        } else {
          setRows([])
        }
      } catch {
        setRows([])
      }
    })()
  }, [router])

  async function save() {
    const nextErr: Record<string, string> = {}
    if (!name) nextErr.name = 'Name is required.'
    if (!contactNumber) nextErr.contact_number = 'Contact number is required.'
    setErrors(nextErr)
    if (Object.keys(nextErr).length) return

    const payload: Record<string, unknown> = { name, contact_number: contactNumber, company, designation, birthday, email, other_details: otherInfo }
    if (editingRow) payload.id = editingRow.id
    await fetch('/api/contacts', { method: 'POST', body: JSON.stringify(payload) })
    const list = await fetch('/api/contacts').then((r) => r.json())
    setRows(list || [])
    setOpen(false)
    setEditingRow(null)
    setName(''); setCompany(''); setDesignation(''); setBirthday(''); setContactNumber(''); setEmail(''); setOtherInfo('')
  }

  function requestDelete(r: ContactRow) {
    setPendingDelete(r)
    setConfirmOpen(true)
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    await fetch(`/api/contacts?id=${pendingDelete.id}`, { method: 'DELETE' })
    setRows((x) => x.filter((y) => y.id !== pendingDelete.id))
    setConfirmOpen(false)
    setCrudToast({ open: true, msg: 'Contact deleted', actionLabel: 'Undo', onAction: undoDelete })
  }

  async function undoDelete() {
    if (!pendingDelete) return
    const payload = { name: pendingDelete.name, contact_number: pendingDelete.contact_number }
    await fetch('/api/contacts', { method: 'POST', body: JSON.stringify(payload) })
    const list = await fetch('/api/contacts').then((r) => r.json())
    setRows(list || [])
    setPendingDelete(null)
    setCrudToast({ open: true, msg: 'Contact restored', onClose: () => setCrudToast({ open: false, msg: '' }) })
  }

  function startEdit(r: ContactRow) {
    setEditingRow(r)
    setName(r.name || '')
    setCompany(r.company || '')
    setDesignation(r.designation || '')
    setBirthday(r.birthday || '')
    setContactNumber(r.contact_number || '')
    setEmail(r.email || '')
    setOtherInfo(r.other_details || '')
    setOpen(true)
  }

  function toggleField(k: keyof ContactRow) {
    setVisible((prev) => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k])
  }

  async function copyAll(r: ContactRow) {
    const text = `Name: ${r.name || ''}\nPhone: ${r.contact_number || ''}\nEmail: ${r.email || ''}`
    try { await navigator.clipboard.writeText(text); setCrudToast({ open: true, msg: 'Contact copied', onClose: () => setCrudToast({ open: false, msg: '' }) }) } catch { setCrudToast({ open: true, msg: 'Copy failed', onClose: () => setCrudToast({ open: false, msg: '' }) }) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Contacts</h2>
        <div className="flex gap-2">
          <DropdownMenu triggerLabel="Columns" items={ALL_FIELDS.map((f) => ({ key: String(f.key), label: f.label, checked: visible.includes(f.key), onToggle: () => toggleField(f.key as keyof ContactRow) }))} />
          <PlusButton onClick={() => setOpen(true)} label="Add Contact" />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState message="No contacts yet — add your first contact." />
      ) : (
        <div className="rounded-lg border border-border bg-card p-4">
          <TableScrollWrapper>
            <table className="min-w-[480px] w-full text-sm">
              <thead>
                <tr className="text-left">
                  {visible.includes('name') && <th className="pb-2">Name</th>}
                  {visible.includes('contact_number') && <th className="pb-2">Phone</th>}
                  {visible.filter(v => v !== 'name' && v !== 'contact_number').map((k) => (<th key={String(k)} className="pb-2">{ALL_FIELDS.find(f => f.key === k)?.label}</th>))}
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    {visible.includes('name') && <TableCell header="Name" getText={() => String(r.name || '')} className="py-2">{r.name}</TableCell>}
                    {visible.includes('contact_number') && <TableCell header="Phone" getText={() => String(r.contact_number || '')} className="py-2">{r.contact_number}</TableCell>}
                    {visible.filter(v => v !== 'name' && v !== 'contact_number').map((k) => (
                      <TableCell key={String(k)} header={ALL_FIELDS.find(f => f.key === k)?.label || String(k)} getText={() => String((r as Record<string, unknown>)[k as string] || '')} className="py-2">{String((r as Record<string, unknown>)[k as string] ?? '')}</TableCell>
                    ))}
                    <td className="py-2 flex gap-2 items-center">
                      <IconButton ariaLabel="Edit" onClick={() => startEdit(r)} className="w-8 h-8" title="Edit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 21l3-1 11-11 1-3-3 1L4 20l-1 1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </IconButton>
                      <IconButton ariaLabel="Copy all" onClick={() => copyAll(r)} className="w-8 h-8">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="9" y="9" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M7 15V7a2 2 0 0 1 2-2h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </IconButton>
                      <IconButton ariaLabel="Delete" onClick={() => requestDelete(r)} className="w-8 h-8" variant="destructive">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScrollWrapper>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editingRow ? 'Edit contact' : 'Add contact'}>
        <div className="grid gap-2">
          <label className="text-sm">Name</label>
          <input placeholder="John Doe" className="border rounded px-2 py-1" value={name} onChange={(e) => setName(e.target.value)} />
          {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}

          <label className="text-sm">Company</label>
          <input placeholder="Acme" className="border rounded px-2 py-1" value={company} onChange={(e) => setCompany(e.target.value)} />

          <label className="text-sm">Designation</label>
          <input placeholder="Manager" className="border rounded px-2 py-1" value={designation} onChange={(e) => setDesignation(e.target.value)} />

          <label className="text-sm">Birthday</label>
          <input type="date" className="border rounded px-2 py-1" value={birthday} onChange={(e) => setBirthday(e.target.value)} />

          <label className="text-sm">Contact Number</label>
          <input placeholder="+91-99999-99999" className="border rounded px-2 py-1" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
          {errors.contact_number && <p className="text-destructive text-sm">{errors.contact_number}</p>}

          <label className="text-sm">Email</label>
          <input placeholder="john@acme.com" className="border rounded px-2 py-1" value={email} onChange={(e) => setEmail(e.target.value)} />

          <label className="text-sm">Other info (optional)</label>
          <textarea placeholder="Notes..." className="border rounded px-2 py-1 min-h-[80px]" value={otherInfo} onChange={(e) => setOtherInfo(e.target.value)} />

          <div className="flex gap-2 pt-2">
            <button onClick={save} className="rounded bg-foreground text-background px-3 py-1">{editingRow ? 'Update' : 'Add'}</button>
            <button onClick={() => setOpen(false)} className="rounded border px-3 py-1">Cancel</button>
          </div>
        </div>
      </Modal>

      <Confirm open={confirmOpen} onConfirm={confirmDelete} onCancel={() => setConfirmOpen(false)} title="Delete contact?">
        <p>Are you sure you want to delete this contact? You can undo immediately after deleting.</p>
      </Confirm>

      <Snackbar open={crudToast.open} message={crudToast.msg} actionLabel={crudToast.actionLabel} onAction={crudToast.onAction ?? undefined} onClose={crudToast.onClose ?? undefined} />
    </div>
  )
}
