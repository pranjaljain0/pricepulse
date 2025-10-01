"use client";

import { TableCell, TableScrollWrapper } from "../../components/TableHelpers";
import { useEffect, useState } from "react";

import Confirm from "../../components/Confirm";
import EmptyState from "../../components/EmptyState";
import IconButton from "../../components/Interactive";
import Modal from "../../components/Modal";
import PlusButton from "../../components/PlusButton";
import Snackbar from "../../components/Snackbar";

type Row = {
  id: string;
  account_number?: string;
  account_holder?: string;
  bank?: string;
  branch?: string;
  ifsc?: string;
  cif?: string;
  other_details?: string;
  _time?: string;
};

export default function BankAccountsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [bank, setBank] = useState("");
  const [branch, setBranch] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [cif, setCif] = useState("");
  const [otherDetails, setOtherDetails] = useState("");
  const [editingRow, setEditingRow] = useState<Row | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);
  // snackOpen removed; using crudToast instead for CRUD feedback
  const [crudToast, setCrudToast] = useState<{ open: boolean; msg: string; actionLabel?: string; onAction?: (() => void) | null; onClose?: (() => void) | null }>({ open: false, msg: '' });
  const [copySnack, setCopySnack] = useState<{ open: boolean; msg: string }>({ open: false, msg: '' });

  useEffect(() => {
    fetch('/api/bankaccounts')
      .then((r) => r.json())
      .then((data) => setRows(data || []))
      .catch(() => setRows([]))
  }, []);

  async function addRow() {
    const nextErrors: Record<string, string> = {};
    if (!accountNumber) nextErrors.accountNumber = 'Account number is required.';
    if (!accountHolder) nextErrors.accountHolder = 'Account holder name is required.';
    if (!bank) nextErrors.bank = 'Bank name is required.';
    if (ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) nextErrors.ifsc = 'IFSC looks invalid.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    type PostPayload = {
      id?: string;
      account_number: string;
      account_holder: string;
      bank: string;
      branch?: string;
      ifsc?: string;
      cif?: string;
      other_details?: string;
    };
    const body: PostPayload = {
      account_number: accountNumber,
      account_holder: accountHolder,
      bank,
      branch,
      ifsc,
      cif,
      other_details: otherDetails,
    };
    if (editingRow) body.id = editingRow.id;
    await fetch('/api/bankaccounts', { method: 'POST', body: JSON.stringify(body) });
    // reload
    const list = await fetch('/api/bankaccounts').then((r) => r.json());
    setRows(list || []);
    setAccountNumber(''); setAccountHolder(''); setBank(''); setBranch(''); setIfsc(''); setCif('');
    setOtherDetails('');
    setOpen(false);
    setCrudToast({ open: true, msg: editingRow ? 'Bank account updated' : 'Bank account added', onClose: () => setCrudToast({ open: false, msg: '' }) });
    setEditingRow(null);
  }

  function requestDelete(row: Row) {
    setPendingDelete(row);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    await fetch(`/api/bankaccounts?id=${id}`, { method: 'DELETE' });
    setRows((r) => r.filter((x) => x.id !== id));
    setConfirmOpen(false);
    setCrudToast({ open: true, msg: 'Bank account deleted', actionLabel: 'Undo', onAction: undoDelete });
    // keep pendingDelete for undo
  }

  async function undoDelete() {
    if (!pendingDelete) return;
    // re-post the deleted item
    const payload = {
      account_number: pendingDelete.account_number,
      account_holder: pendingDelete.account_holder,
      bank: pendingDelete.bank,
      branch: pendingDelete.branch,
      ifsc: pendingDelete.ifsc,
      cif: pendingDelete.cif,
      other_details: pendingDelete.other_details,
    };
    await fetch('/api/bankaccounts', { method: 'POST', body: JSON.stringify(payload) });
    const list = await fetch('/api/bankaccounts').then((r) => r.json());
    setRows(list || []);
    setPendingDelete(null);
    setCrudToast({ open: true, msg: 'Bank account restored', onClose: () => setCrudToast({ open: false, msg: '' }) });
  }

  function startEdit(row: Row) {
    setEditingRow(row);
    setAccountNumber(row.account_number || '');
    setAccountHolder(row.account_holder || '');
    setBank(row.bank || '');
    setBranch(row.branch || '');
    setIfsc(row.ifsc || '');
    setCif(row.cif || '');
    setOtherDetails(row.other_details || '');
    setOpen(true);
  }

  async function copyAll(row: Row) {
    const text = `Account Holder: ${row.account_holder || ''}\nAccount Number: ${row.account_number || ''}\nBank: ${row.bank || ''}\nBranch: ${row.branch || ''}\nIFSC: ${row.ifsc || ''}\nCIF: ${row.cif || ''}`;
    try {
      await navigator.clipboard.writeText(text);
      setCrudToast({ open: true, msg: 'Account details copied', onClose: () => setCrudToast({ open: false, msg: '' }) });
    } catch {
      setCrudToast({ open: true, msg: 'Copy failed', onClose: () => setCrudToast({ open: false, msg: '' }) });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Bank Accounts</h2>
        <PlusButton onClick={() => setOpen(true)} label="Add account" />
      </div>

      {rows.length === 0 ? (
        <EmptyState message="No bank accounts yet — add your first account." />
      ) : (
        <div className="rounded-lg border border-border bg-card p-4">
          <TableScrollWrapper>
            <table className="min-w-[720px] w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="pb-2">Account Holder</th>
                  <th className="pb-2">Account Number</th>
                  <th className="pb-2">Bank</th>
                  <th className="pb-2">Branch</th>
                  <th className="pb-2">IFSC</th>
                  <th className="pb-2">CIF</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <TableCell header="Account Holder" getText={() => String(r.account_holder || '')} className="py-2" onCopied={(h) => setCrudToast({ open: true, msg: `${h} copied`, onClose: () => setCrudToast({ open: false, msg: '' }) })}>{r.account_holder}</TableCell>
                    <TableCell header="Account Number" getText={() => String(r.account_number || '')} className="py-2" onCopied={(h) => setCrudToast({ open: true, msg: `${h} copied`, onClose: () => setCrudToast({ open: false, msg: '' }) })}>{r.account_number}</TableCell>
                    <TableCell header="Bank" getText={() => String(r.bank || '')} className="py-2" onCopied={(h) => setCrudToast({ open: true, msg: `${h} copied`, onClose: () => setCrudToast({ open: false, msg: '' }) })}>{r.bank}</TableCell>
                    <TableCell header="Branch" getText={() => String(r.branch || '')} className="py-2" onCopied={(h) => setCrudToast({ open: true, msg: `${h} copied`, onClose: () => setCrudToast({ open: false, msg: '' }) })}>{r.branch}</TableCell>
                    <TableCell header="IFSC" getText={() => String(r.ifsc || '')} className="py-2" onCopied={(h) => setCrudToast({ open: true, msg: `${h} copied`, onClose: () => setCrudToast({ open: false, msg: '' }) })}>{r.ifsc}</TableCell>
                    <TableCell header="CIF" getText={() => String(r.cif || '')} className="py-2" onCopied={(h) => setCrudToast({ open: true, msg: `${h} copied`, onClose: () => setCrudToast({ open: false, msg: '' }) })}>{r.cif}</TableCell>
                    <td className="py-2 flex gap-2 items-center">
                      <IconButton ariaLabel="Edit" onClick={() => startEdit(r)} className="w-8 h-8" title="Edit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 21l3-1 11-11 1-3-3 1L4 20l-1 1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </IconButton>
                      <IconButton ariaLabel="Copy all" onClick={() => copyAll(r)} className="w-8 h-8" title="Copy all">
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

      <Modal open={open} onClose={() => setOpen(false)} title="Add bank account">
        <div className="grid gap-2">
          <label className="text-sm">Account Holder</label>
          <input placeholder="John Doe" className="border rounded px-2 py-1" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} />
          {errors.accountHolder && <p className="text-destructive text-sm">{errors.accountHolder}</p>}
          <label className="text-sm">Account Number</label>
          <input placeholder="123456789012" className="border rounded px-2 py-1" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
          {errors.accountNumber && <p className="text-destructive text-sm">{errors.accountNumber}</p>}
          <label className="text-sm">Bank</label>
          <input placeholder="Axis Bank" className="border rounded px-2 py-1" value={bank} onChange={(e) => setBank(e.target.value)} />
          {errors.bank && <p className="text-destructive text-sm">{errors.bank}</p>}
          <label className="text-sm">Branch</label>
          <input placeholder="Andheri West" className="border rounded px-2 py-1" value={branch} onChange={(e) => setBranch(e.target.value)} />
          <label className="text-sm">IFSC Code</label>
          <input placeholder="ABCD0123456" className="border rounded px-2 py-1" value={ifsc} onChange={(e) => setIfsc(e.target.value)} />
          {errors.ifsc && <p className="text-destructive text-sm">{errors.ifsc}</p>}
          <label className="text-sm">CIF Code (optional)</label>
          <input placeholder="CIF12345" className="border rounded px-2 py-1" value={cif} onChange={(e) => setCif(e.target.value)} />
          <label className="text-sm">Other details (optional)</label>
          <textarea placeholder="Extra notes..." className="border rounded px-2 py-1 min-h-[80px]" value={otherDetails} onChange={(e) => setOtherDetails(e.target.value)} />
          <div className="flex gap-2 pt-2">
            <button onClick={addRow} className="rounded bg-foreground text-background px-3 py-1">{editingRow ? 'Update' : 'Add'}</button>
            <button onClick={() => setOpen(false)} className="rounded border px-3 py-1">Cancel</button>
          </div>
        </div>
      </Modal>
      <Confirm open={confirmOpen} onConfirm={confirmDelete} onCancel={() => setConfirmOpen(false)} title="Delete bank account?">
        <p>Are you sure you want to delete this bank account? You can undo immediately after deleting.</p>
      </Confirm>
      <Snackbar open={crudToast.open} message={crudToast.msg} actionLabel={crudToast.actionLabel} onAction={crudToast.onAction ?? undefined} onClose={crudToast.onClose ?? undefined} />
      <Snackbar open={copySnack.open} message={copySnack.msg} onClose={() => setCopySnack({ open: false, msg: '' })} />
    </div>
  );
}
