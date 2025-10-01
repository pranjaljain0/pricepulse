"use client";

import { TableCell, TableScrollWrapper } from "../../components/TableHelpers";
import { useEffect, useState } from "react";

import Confirm from "../../components/Confirm";
import EmptyState from "../../components/EmptyState";
import IconButton from "../../components/Interactive";
import Modal from "../../components/Modal";
import PlusButton from "../../components/PlusButton";
import Snackbar from "../../components/Snackbar";

type GSTRow = { id: string; gstNumber?: string; businessName?: string; other_details?: string; _time?: string };

export default function GSTPage() {
  const [rows, setRows] = useState<GSTRow[]>([]);
  const [open, setOpen] = useState(false);
  const [gstNumber, setGstNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [otherDetails, setOtherDetails] = useState("");
  const [editingRow, setEditingRow] = useState<GSTRow | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<GSTRow | null>(null);
  // snackOpen removed; using crudToast instead for CRUD feedback
  const [copySnack, setCopySnack] = useState<{ open: boolean; msg: string }>({ open: false, msg: '' });
  const [crudToast, setCrudToast] = useState<{ open: boolean; msg: string; actionLabel?: string; onAction?: (() => void) | null; onClose?: (() => void) | null }>({ open: false, msg: '' });

  useEffect(() => {
    fetch('/api/gst')
      .then((r) => r.json())
      .then((data) => setRows(data || []))
      .catch(() => setRows([]))
  }, []);

  async function addRow() {
    const nextErrors: Record<string, string> = {};
    if (!gstNumber) nextErrors.gstNumber = 'GST number is required.';
    if (!businessName) nextErrors.businessName = 'Business name is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    type PostPayload = { id?: string; gstNumber: string; businessName: string; other_details?: string };
    const body: PostPayload = { gstNumber, businessName, other_details: otherDetails };
    if (editingRow) body.id = editingRow.id;
    await fetch('/api/gst', { method: 'POST', body: JSON.stringify(body) });
    const list = await fetch('/api/gst').then((r) => r.json());
    setRows(list || []);
    setGstNumber(''); setBusinessName(''); setOpen(false);
    setOtherDetails('');
  }

  function requestDelete(row: GSTRow) {
    setPendingDelete(row);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    await fetch(`/api/gst?id=${id}`, { method: 'DELETE' });
    setRows((r) => r.filter((x) => x.id !== id));
    setConfirmOpen(false);
    setCrudToast({ open: true, msg: 'GST entry deleted', actionLabel: 'Undo', onAction: undoDelete });
  }

  async function undoDelete() {
    if (!pendingDelete) return;
    const payload = { gstNumber: pendingDelete.gstNumber, businessName: pendingDelete.businessName };
    await fetch('/api/gst', { method: 'POST', body: JSON.stringify(payload) });
    const list = await fetch('/api/gst').then((r) => r.json());
    setRows(list || []);
    setPendingDelete(null);
    setCrudToast({ open: true, msg: 'GST entry restored', onClose: () => setCrudToast({ open: false, msg: '' }) });
  }

  function startEdit(row: GSTRow) {
    setEditingRow(row);
    setGstNumber(row.gstNumber || '');
    setBusinessName(row.businessName || '');
    setOtherDetails(row.other_details || '');
    setOpen(true);
  }

  async function copyAll(row: GSTRow) {
    const text = `GST Number: ${row.gstNumber || ''}\nBusiness: ${row.businessName || ''}`;
    try {
      await navigator.clipboard.writeText(text);
      setCrudToast({ open: true, msg: 'GST details copied', onClose: () => setCrudToast({ open: false, msg: '' }) });
    } catch {
      setCrudToast({ open: true, msg: 'Copy failed', onClose: () => setCrudToast({ open: false, msg: '' }) });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">GST Information</h2>
        <PlusButton onClick={() => setOpen(true)} label="Add GST" />
      </div>

      {rows.length === 0 ? (
        <EmptyState message="No GST entries yet — add your first business GST." />
      ) : (
        <div className="rounded-lg border border-border bg-card p-4">
          <TableScrollWrapper>
            <table className="min-w-[480px] w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="pb-2">GST Number</th>
                  <th className="pb-2">Business Name</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <TableCell header="GST Number" getText={() => String(r.gstNumber || '')} className="py-2" onCopied={(h) => setCrudToast({ open: true, msg: `${h} copied`, onClose: () => setCrudToast({ open: false, msg: '' }) })}>{r.gstNumber}</TableCell>
                    <TableCell header="Business Name" getText={() => String(r.businessName || '')} className="py-2" onCopied={(h) => setCrudToast({ open: true, msg: `${h} copied`, onClose: () => setCrudToast({ open: false, msg: '' }) })}>{r.businessName}</TableCell>
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

      <Modal open={open} onClose={() => setOpen(false)} title={editingRow ? 'Edit GST info' : 'Add GST info'}>
        <div className="grid gap-2">
          <label className="text-sm">GST Number</label>
          <input placeholder="27AAAAA0000A1Z5" className="border rounded px-2 py-1" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} />
          {errors.gstNumber && <p className="text-destructive text-sm">{errors.gstNumber}</p>}
          <label className="text-sm">Business Name</label>
          <input placeholder="Acme Pvt Ltd" className="border rounded px-2 py-1" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          {errors.businessName && <p className="text-destructive text-sm">{errors.businessName}</p>}
          <label className="text-sm">Other details (optional)</label>
          <textarea placeholder="Extra notes..." className="border rounded px-2 py-1 min-h-[80px]" value={otherDetails} onChange={(e) => setOtherDetails(e.target.value)} />
          <div className="flex gap-2 pt-2">
            <button onClick={addRow} className="rounded bg-foreground text-background px-3 py-1">{editingRow ? 'Update' : 'Add'}</button>
            <button onClick={() => setOpen(false)} className="rounded border px-3 py-1">Cancel</button>
          </div>
        </div>
      </Modal>
      <Confirm open={confirmOpen} onConfirm={confirmDelete} onCancel={() => setConfirmOpen(false)} title="Delete GST entry?">
        <p>Are you sure you want to delete this GST entry? You can undo immediately after deleting.</p>
      </Confirm>
      <Snackbar open={crudToast.open} message={crudToast.msg} actionLabel={crudToast.actionLabel} onAction={crudToast.onAction ?? undefined} onClose={crudToast.onClose ?? undefined} />
      <Snackbar open={copySnack.open} message={copySnack.msg} onClose={() => setCopySnack({ open: false, msg: '' })} />
    </div>
  );
}
