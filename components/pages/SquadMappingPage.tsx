'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X, Edit, Trash2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';
import { Loading } from '@/components/Loading';

interface SquadMapping {
  id: string;
  username: string;
  brand: string;
  shift: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export function SquadMappingPage() {
  const { language } = useLanguage();
  const translations = t(language);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [editingMapping, setEditingMapping] = useState<SquadMapping | null>(null);
  const [mappingToDelete, setMappingToDelete] = useState<SquadMapping | null>(null);
  const [mappings, setMappings] = useState<SquadMapping[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [newMapping, setNewMapping] = useState({
    username: '',
    brand: '',
    shift: '',
    status: 'active' as 'active' | 'inactive',
  });

  const [editMapping, setEditMapping] = useState({
    username: '',
    brand: '',
    shift: '',
    status: 'active' as 'active' | 'inactive',
  });

  const mapRow = (row: any): SquadMapping => ({
    id: row?.id?.toString() ?? crypto.randomUUID(),
    username: row?.username ?? 'Unknown',
    brand: row?.brand ?? 'Unknown',
    shift: row?.shift ?? 'Unknown',
    status: row?.status === 'inactive' ? 'inactive' : 'active',
    createdAt: row?.created_at 
      ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : 'Unknown',
  });

  const fetchMappings = useCallback(async (withLoading = false) => {
    setError(null);
    if (withLoading) setLoading(true); else setRefreshing(true);

    const { data, error } = await supabase
      .from('squad_mapping')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch squad mappings', error);
      setError(error.message);
      setMappings([]);
    } else {
      setMappings((data ?? []).map(mapRow));
    }

    if (withLoading) setLoading(false); else setRefreshing(false);
  }, []);

  const fetchBrands = useCallback(async () => {
    const { data, error } = await supabase
      .from('brand_mapping')
      .select('brand')
      .eq('status', 'active')
      .order('brand', { ascending: true });

    if (error) {
      console.error('Failed to fetch brands', error);
    } else {
      // Get unique brands
      const uniqueBrands = Array.from(new Set((data ?? []).map((item) => item.brand).filter(Boolean)));
      setBrands(uniqueBrands);
    }
  }, []);

  useEffect(() => {
    fetchMappings(true);
    fetchBrands();
  }, [fetchMappings, fetchBrands]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewMapping({ ...newMapping, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditMapping({ ...editMapping, [e.target.name]: e.target.value });
  };

  const handleAddMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      username: newMapping.username,
      brand: newMapping.brand,
      shift: newMapping.shift,
      status: newMapping.status,
    };

    const { data, error } = await supabase
      .from('squad_mapping')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Failed to create squad mapping', error);
      setError(error.message);
      alert('Failed to add squad mapping: ' + error.message);
    } else if (data) {
      setMappings((prev) => [mapRow(data), ...prev]);
      setShowAddModal(false);
      setNewMapping({ username: '', brand: '', shift: '', status: 'active' });
      alert('Squad mapping created successfully!');
    }
    setSaving(false);
  };

  const handleEdit = (mapping: SquadMapping) => {
    setEditingMapping(mapping);
    setEditMapping({
      username: mapping.username,
      brand: mapping.brand,
      shift: mapping.shift,
      status: mapping.status,
    });
    setShowEditModal(true);
  };

  const handleUpdateMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMapping) return;
    setSaving(true);
    setError(null);

    const payload = {
      username: editMapping.username,
      brand: editMapping.brand,
      shift: editMapping.shift,
      status: editMapping.status,
    };

    const { data, error } = await supabase
      .from('squad_mapping')
      .update(payload)
      .eq('id', editingMapping.id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update squad mapping', error);
      setError(error.message);
      alert('Failed to update squad mapping: ' + error.message);
    } else if (data) {
      setMappings((prev) => prev.map((m) => (m.id === editingMapping.id ? mapRow(data) : m)));
      setShowEditModal(false);
      setEditingMapping(null);
      setEditMapping({ username: '', brand: '', shift: '', status: 'active' });
      alert('Squad mapping updated successfully!');
    }
    setSaving(false);
  };

  const handleDeleteClick = (mapping: SquadMapping) => {
    setMappingToDelete(mapping);
    setShowDeleteConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!mappingToDelete) return;
    const mappingId = mappingToDelete.id;
    setDeletingId(mappingId);
    setError(null);
    setShowDeleteConfirmModal(false);

    const { error } = await supabase.from('squad_mapping').delete().eq('id', mappingId);

    if (error) {
      console.error('Failed to delete squad mapping', error);
      setError(error.message);
      alert('Failed to delete squad mapping: ' + error.message);
    } else {
      setMappings((prev) => prev.filter((m) => m.id !== mappingId));
      alert('Squad mapping deleted successfully!');
    }
    setDeletingId(null);
    setMappingToDelete(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmModal(false);
    setMappingToDelete(null);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={() => fetchMappings()} disabled={loading || refreshing} className="flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button variant="default" onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Add Member
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <Card className="relative overflow-hidden group">
        <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
        <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
        <CardContent className="relative z-10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">Username</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">Brand</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">Shift</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 px-4">
                      <div className="flex justify-center">
                        <Loading size="md" text={translations.common.loading} variant="gaming" />
                      </div>
                    </td>
                  </tr>
                ) : mappings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 px-4 text-center text-muted">No squad mappings found.</td>
                  </tr>
                ) : (
                  mappings.map((mapping, index) => (
                    <motion.tr
                      key={mapping.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-card-border hover:bg-card-inner/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-foreground-primary">{mapping.username}</td>
                      <td className="py-3 px-4 text-sm text-foreground-primary">{mapping.brand}</td>
                      <td className="py-3 px-4 text-sm text-foreground-primary">{mapping.shift}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          mapping.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {mapping.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEdit(mapping)} className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-primary" disabled={deletingId === mapping.id}>
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteClick(mapping)} className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-red-400" disabled={deletingId === mapping.id || loading}>
                            <Trash2 className={`w-4 h-4 ${deletingId === mapping.id ? 'opacity-50' : ''}`} />
                          </button>
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

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)', zIndex: 99999 }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, pointerEvents: 'none' }}
            >
              <Card className="relative overflow-hidden group w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ pointerEvents: 'auto', margin: '1rem' }}>
                <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-primary" />
                      Add New Member
                    </CardTitle>
                    <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-foreground-primary">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <form onSubmit={handleAddMapping} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                        <label className="block text-sm font-semibold text-foreground-primary mb-2">Username</label>
                        <input type="text" name="username" value={newMapping.username} onChange={handleInputChange} className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors" required placeholder="Enter username" />
                      </div>
                      <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                        <label className="block text-sm font-semibold text-foreground-primary mb-2">Brand</label>
                        <select name="brand" value={newMapping.brand} onChange={handleInputChange} className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors" required>
                          <option value="">Select Brand</option>
                          {brands.map((brand) => (
                            <option key={brand} value={brand}>
                              {brand}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                        <label className="block text-sm font-semibold text-foreground-primary mb-2">Shift</label>
                        <select name="shift" value={newMapping.shift} onChange={handleInputChange} className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors" required>
                          <option value="">Select Shift</option>
                          <option value="Shift A">Shift A</option>
                          <option value="Shift B">Shift B</option>
                        </select>
                      </div>
                      <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                        <label className="block text-sm font-semibold text-foreground-primary mb-2">Status</label>
                        <select name="status" value={newMapping.status} onChange={handleInputChange} className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors" required>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button type="submit" variant="default" className="flex-1" disabled={saving}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        {saving ? 'Creating...' : 'Create Member'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); setNewMapping({ username: '', brand: '', shift: '', status: 'active' }); }} className="flex-1">Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Mapping Modal */}
      <AnimatePresence>
        {showEditModal && editingMapping && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowEditModal(false); setEditingMapping(null); }}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)', zIndex: 99999 }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, pointerEvents: 'none' }}
            >
              <Card className="relative overflow-hidden group w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ pointerEvents: 'auto', margin: '1rem' }}>
                <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Edit className="w-5 h-5 text-primary" />
                      Edit Squad Mapping
                    </CardTitle>
                    <button onClick={() => { setShowEditModal(false); setEditingMapping(null); }} className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-foreground-primary">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <form onSubmit={handleUpdateMapping} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                        <label className="block text-sm font-semibold text-foreground-primary mb-2">Username</label>
                        <input type="text" name="username" value={editMapping.username} onChange={handleEditInputChange} className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors" required placeholder="Enter username" />
                      </div>
                      <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                        <label className="block text-sm font-semibold text-foreground-primary mb-2">Brand</label>
                        <select name="brand" value={editMapping.brand} onChange={handleEditInputChange} className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors" required>
                          <option value="">Select Brand</option>
                          {brands.map((brand) => (
                            <option key={brand} value={brand}>
                              {brand}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                        <label className="block text-sm font-semibold text-foreground-primary mb-2">Shift</label>
                        <select name="shift" value={editMapping.shift} onChange={handleEditInputChange} className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors" required>
                          <option value="">Select Shift</option>
                          <option value="Shift A">Shift A</option>
                          <option value="Shift B">Shift B</option>
                        </select>
                      </div>
                      <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                        <label className="block text-sm font-semibold text-foreground-primary mb-2">Status</label>
                        <select name="status" value={editMapping.status} onChange={handleEditInputChange} className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors" required>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button type="submit" variant="default" className="flex-1" disabled={saving}>
                        <Edit className="w-4 h-4 mr-2" />
                        {saving ? 'Updating...' : 'Update Mapping'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setEditingMapping(null); setEditMapping({ username: '', brand: '', shift: '', status: 'active' }); }} className="flex-1">Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirmModal && mappingToDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleDeleteCancel}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)', zIndex: 99999 }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, pointerEvents: 'none' }}
            >
              <Card className="relative overflow-hidden group w-full max-w-md" style={{ pointerEvents: 'auto', margin: '1rem' }}>
                <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-red-400">
                      <Trash2 className="w-5 h-5" />
                      Delete Squad Mapping
                    </CardTitle>
                    <button onClick={handleDeleteCancel} className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-foreground-primary">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-4">
                    <p className="text-foreground-primary">Are you sure you want to delete this squad mapping? This action cannot be undone.</p>
                    {mappingToDelete && (
                      <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                        <div className="space-y-2">
                          <div><span className="text-sm text-muted">Username:</span><p className="text-sm font-semibold text-foreground-primary">{mappingToDelete.username}</p></div>
                          <div><span className="text-sm text-muted">Brand:</span><p className="text-sm font-semibold text-foreground-primary">{mappingToDelete.brand}</p></div>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={handleDeleteCancel} className="flex-1" disabled={deletingId === mappingToDelete?.id}>Cancel</Button>
                      <Button type="button" variant="default" onClick={handleDeleteConfirm} className="flex-1 bg-red-500 hover:bg-red-600 text-white" disabled={deletingId === mappingToDelete?.id}>
                        {deletingId === mappingToDelete?.id ? (
                          <>
                            <Loading size="sm" variant="minimal" />
                            <span className="ml-2">Deleting...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

