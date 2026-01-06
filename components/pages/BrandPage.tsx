'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Plus, X, RefreshCw, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { Loading } from '@/components/Loading';

interface Brand {
  id: string;
  brandName: string;
  squadTeam: string;
  status: 'active' | 'inactive';
  description?: string;
  createdAt?: string;
}

const STATUS_OPTIONS: Array<Brand['status']> = ['active', 'inactive'];

export function BrandPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    brandName: '',
    squadTeam: '',
    status: 'active' as Brand['status'],
    description: '',
  });

  const mapRow = (row: any): Brand => ({
    id: row?.id?.toString() ?? crypto.randomUUID(),
    brandName: row?.brand_name ?? 'Unknown',
    squadTeam: row?.squad_team ?? 'Unknown',
    status: row?.status === 'inactive' ? 'inactive' : 'active',
    description: row?.description ?? '',
    createdAt: row?.created_at,
  });

  const fetchBrands = useCallback(async (withLoading = false) => {
    setError(null);
    if (withLoading) setLoading(true); else setRefreshing(true);

    const { data, error } = await supabase
      .from('brand_arena')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch brands', error);
      setError(error.message);
      setBrands([]);
    } else {
      setBrands((data ?? []).map(mapRow));
    }

    if (withLoading) setLoading(false); else setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchBrands(true);
  }, [fetchBrands]);

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brandName || !form.squadTeam) {
      alert('Brand Name and Squad Team are required.');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      brand_name: form.brandName,
      squad_team: form.squadTeam,
      status: form.status,
      description: form.description,
    };

    const { data, error } = await supabase
      .from('brand_arena')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Failed to create brand', error);
      setError(error.message);
      alert('Failed to add brand.');
    } else if (data) {
      setBrands((prev) => [mapRow(data), ...prev]);
      setShowAddModal(false);
      setForm({ brandName: '', squadTeam: '', status: 'active', description: '' });
    }

    setSaving(false);
  };

  const handleDelete = async (brandId: string) => {
    const confirmed = window.confirm('Delete this brand?');
    if (!confirmed) return;
    setDeletingId(brandId);
    setError(null);

    const { error } = await supabase.from('brand_arena').delete().eq('id', brandId);
    if (error) {
      console.error('Failed to delete brand', error);
      setError(error.message);
    } else {
      setBrands((prev) => prev.filter((b) => b.id !== brandId));
    }
    setDeletingId(null);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          <span className="text-lg font-semibold text-foreground-primary">Brand</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchBrands()}
            disabled={loading || refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="default" className="flex items-center gap-2" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" />
            Add Brand
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <Card className="bg-card-glass">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Brand Listing
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-card-border bg-card-inner">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">Brand Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">Squad Team</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">Created</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-muted">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 px-4">
                      <div className="flex justify-center">
                        <Loading size="md" text="Loading..." variant="gaming" />
                      </div>
                    </td>
                  </tr>
                ) : brands.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 px-4 text-center text-muted">No data.</td>
                  </tr>
                ) : (
                  brands.map((brand, idx) => (
                    <motion.tr
                      key={brand.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.03 }}
                      className="border-b border-card-border hover:bg-primary/5 transition-colors"
                    >
                      <td className="py-4 px-4 text-foreground-primary font-semibold">{brand.brandName}</td>
                      <td className="py-4 px-4 text-foreground-primary">{brand.squadTeam}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          brand.status === 'active'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                            : 'bg-gray-500/20 text-gray-300 border border-gray-500/50'
                        }`}>
                          {brand.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted">{brand.createdAt ? new Date(brand.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="p-2 h-auto hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                            disabled
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(brand.id)}
                            className="p-2 h-auto hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50"
                            disabled={deletingId === brand.id || refreshing}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Brand Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowAddModal(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 99999,
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100000,
                pointerEvents: 'none',
              }}
            >
              <Card className="relative overflow-hidden group w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ pointerEvents: 'auto', margin: '1rem' }}>
                <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
                <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="w-5 h-5 text-primary" />
                      Add Brand
                    </CardTitle>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-foreground-primary"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <form onSubmit={handleAddBrand} className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground-primary">Brand Name</label>
                      <input
                        type="text"
                        name="brandName"
                        value={form.brandName}
                        onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                        className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                        required
                        placeholder="e.g., Brand A"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground-primary">Squad Team</label>
                      <select
                        name="squadTeam"
                        value={form.squadTeam}
                        onChange={(e) => setForm({ ...form, squadTeam: e.target.value })}
                        className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                        required
                      >
                        <option value="" disabled>Select Squad</option>
                        <option value="Squad A">Squad A</option>
                        <option value="Squad B">Squad B</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground-primary">Status</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value as Brand['status'] })}
                        className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                        required
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground-primary">Description (optional)</label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                        rows={3}
                        placeholder="Short notes about this brand"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" variant="default" className="flex-1" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Brand'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddModal(false)}
                        className="flex-1"
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

