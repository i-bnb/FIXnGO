'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  ClipboardList,
  Users,
  Tractor,
  Package,
  Receipt,
  Navigation,
  Settings,
  ShieldCheck,
  TrendingUp,
  Inbox,
  ShoppingBag,
  Cpu,
  Layers,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

export function GlobalSearchModal({ isOpen, onClose, locale }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Search items across screens and key entities
  const searchItems = [
    // Screens
    { title: 'Executive KPI Dashboard', category: 'Screens', icon: TrendingUp, href: `/${locale}/admin` },
    { title: 'Live Map & Dispatch Board', category: 'Screens', icon: Navigation, href: `/${locale}/admin/dispatch` },
    { title: 'Service Requests & Complaints Inbox', category: 'Screens', icon: Inbox, href: `/${locale}/admin/service-requests` },
    { title: 'Work Orders Management (FSM)', category: 'Screens', icon: ClipboardList, href: `/${locale}/admin/work-orders` },
    { title: 'Customers & CRM Sites', category: 'Screens', icon: Users, href: `/${locale}/admin/customers` },
    { title: 'Employees & Technicians Roster', category: 'Screens', icon: Users, href: `/${locale}/admin/technicians` },
    { title: 'Construction Manpower Supply', category: 'Screens', icon: Layers, href: `/${locale}/admin/manpower` },
    { title: 'Inventory & Mobile Van Stock', category: 'Screens', icon: Package, href: `/${locale}/admin/inventory` },
    { title: 'Purchasing & Suppliers (POs)', category: 'Screens', icon: Package, href: `/${locale}/admin/purchasing` },
    { title: 'Counter POS Material Sales', category: 'Screens', icon: ShoppingBag, href: `/${locale}/admin/sales` },
    { title: 'Equipment Rental & Availability', category: 'Screens', icon: Tractor, href: `/${locale}/admin/equipment` },
    { title: 'Tax Invoices & Billing (5% VAT)', category: 'Screens', icon: Receipt, href: `/${locale}/admin/billing` },
    { title: 'Finance & General Ledger', category: 'Screens', icon: TrendingUp, href: `/${locale}/admin/finance` },
    { title: 'Reports Centre (7 SQL Views)', category: 'Screens', icon: TrendingUp, href: `/${locale}/admin/reports` },
    { title: 'Automation & Outbox Viewer', category: 'Screens', icon: Cpu, href: `/${locale}/admin/automation` },
    { title: 'Settings & Access Matrix', category: 'Screens', icon: Settings, href: `/${locale}/admin/settings` },
    { title: 'System Audit Logs', category: 'Screens', icon: ShieldCheck, href: `/${locale}/admin/audit-logs` },
    // Hero & Demo Entities
    { title: 'WO-24817: Chiller Compressor Trip - Business Bay Executive Tower', category: 'Work Orders', icon: ClipboardList, href: `/${locale}/admin/work-orders` },
    { title: 'WO-24825: Main Distribution Board Thermography Hotspot', category: 'Work Orders', icon: ClipboardList, href: `/${locale}/admin/work-orders` },
    { title: 'WO-2025-0089: HVAC Dual Compressor Burnout (Loss Maker)', category: 'Work Orders', icon: ClipboardList, href: `/${locale}/admin/work-orders` },
    { title: 'WO-2026-0001: Chiller Diagnostic & Repair', category: 'Work Orders', icon: ClipboardList, href: `/${locale}/admin/work-orders` },
    { title: 'Fatima Al Mansoori (Downtown Dubai Boulevard Residence)', category: 'Customers', icon: Users, href: `/${locale}/admin/customers` },
    { title: 'Sobha Constructions LLC (TRN: 100234567800003)', category: 'Customers', icon: Users, href: `/${locale}/admin/customers` },
    { title: 'Emaar Contracting LLC (Downtown Project Site)', category: 'Customers', icon: Users, href: `/${locale}/admin/customers` },
    { title: 'Eng. Khalid Al-Mansoor (Palm Jumeirah Villa 24)', category: 'Customers', icon: Users, href: `/${locale}/admin/customers` },
    { title: 'Rashid Khan (TECH-HVAC-12, Senior Lead VRV/VRF Specialist)', category: 'Employees', icon: Users, href: `/${locale}/admin/technicians` },
    { title: 'Joseph Mathew (TECH-PLU-03, Senior Drainage & PPR Fusion Specialist)', category: 'Employees', icon: Users, href: `/${locale}/admin/technicians` },
    { title: 'Caterpillar 320D Hydraulic Excavator (EQ-001)', category: 'Equipment', icon: Tractor, href: `/${locale}/admin/equipment` },
    { title: 'Genie GS-1930 Scissor Lift 7.8m (EQ-015)', category: 'Equipment', icon: Tractor, href: `/${locale}/admin/equipment` },
    { title: 'R410A Refrigerant Cylinder 11.3kg (ITM-0005)', category: 'Inventory', icon: Package, href: `/${locale}/admin/inventory` },
    { title: 'Dual Run Capacitor 45+5 uF 450VAC (ITM-0001)', category: 'Inventory', icon: Package, href: `/${locale}/admin/inventory` },
    { title: 'Schneider Single Pole MCB 20A (ITM-0004)', category: 'Inventory', icon: Package, href: `/${locale}/admin/inventory` },
    { title: 'INV-10482: Emaar Properties PJSC (AED 12,450.00 - FTA VAT Compliant)', category: 'Invoices', icon: Receipt, href: `/${locale}/admin/billing` },
    { title: 'INV-2025-0001: Al Futtaim Properties (PAID)', category: 'Invoices', icon: Receipt, href: `/${locale}/admin/billing` },
  ];

  const filtered = query.trim() === ''
    ? searchItems.slice(0, 8)
    : searchItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search work orders, customers, items, equipment, screens... (Ctrl+K)"
            className="flex-1 text-sm bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">
              No results found matching &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 shrink-0">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Modal Footer Keybinds */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded shadow-sm">ESC</kbd> to close</span>
            <span><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded shadow-sm">Ctrl+K</kbd> to toggle</span>
          </div>
          <span className="font-semibold text-teal-600 dark:text-teal-400">FieldOps Quick Actions</span>
        </div>
      </div>
    </div>
  );
}
