'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Edit, Trash2, Eye, RefreshCw, Repeat, UserPlus, Upload, X, FileText, Download, CheckCircle } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

type TabType = 'reactivation' | 'retention' | 'recommend';

interface Customer {
  id: string;
  uniqueCode: string;
  username: string;
  brand: string;
  handler: string;
  label: string;
}

const mockReactivationCustomers: Customer[] = [
  { id: '1', uniqueCode: 'UC001', username: 'john_doe', brand: 'Brand A', handler: 'Handler 1', label: 'Dormant' },
  { id: '2', uniqueCode: 'UC002', username: 'jane_smith', brand: 'Brand B', handler: 'Handler 2', label: 'Dormant' },
  { id: '3', uniqueCode: 'UC003', username: 'bob_wilson', brand: 'Brand A', handler: 'Handler 1', label: 'Dormant' },
];

const mockRetentionCustomers: Customer[] = [
  { id: '4', uniqueCode: 'UC004', username: 'alice_brown', brand: 'Brand C', handler: 'Handler 3', label: 'Active' },
  { id: '5', uniqueCode: 'UC005', username: 'charlie_davis', brand: 'Brand B', handler: 'Handler 2', label: 'Active' },
  { id: '6', uniqueCode: 'UC006', username: 'diana_miller', brand: 'Brand A', handler: 'Handler 1', label: 'Active' },
];

const mockRecommendCustomers: Customer[] = [
  { id: '7', uniqueCode: 'UC007', username: 'edward_taylor', brand: 'Brand C', handler: 'Handler 3', label: 'New' },
  { id: '8', uniqueCode: 'UC008', username: 'fiona_anderson', brand: 'Brand B', handler: 'Handler 2', label: 'New' },
];

export function CustomerListingPage() {
  const [activeTab, setActiveTab] = useState<TabType>('reactivation');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showImportSidebar, setShowImportSidebar] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [newUser, setNewUser] = useState({
    uniqueCode: '',
    username: '',
    brand: '',
    handler: '',
    label: '',
  });

  const getCustomersByTab = () => {
    switch (activeTab) {
      case 'reactivation':
        return mockReactivationCustomers;
      case 'retention':
        return mockRetentionCustomers;
      case 'recommend':
        return mockRecommendCustomers;
      default:
        return [];
    }
  };

  const handleView = (customer: Customer) => {
    console.log('View customer:', customer);
    // TODO: Implement view functionality
  };

  const handleEdit = (customer: Customer) => {
    console.log('Edit customer:', customer);
    // TODO: Implement edit functionality
  };

  const handleDelete = (customer: Customer) => {
    console.log('Delete customer:', customer);
    // TODO: Implement delete functionality
  };

  const handleImport = () => {
    setShowImportSidebar(true);
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = ['.xlsx', '.xls', '.csv'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      alert('Invalid file type. Please select Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleBrowseFiles = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    };
    input.click();
  };

  const handleStartUploading = () => {
    if (selectedFile) {
      console.log('Uploading file:', selectedFile.name);
      // TODO: Implement upload functionality
      // After successful upload, close sidebar and refresh data
      setSelectedFile(null);
      setShowImportSidebar(false);
    }
  };

  const handleDownloadTemplate = () => {
    console.log('Download template');
    // TODO: Implement template download
    // Create and download template file
  };

  const handleAddUser = () => {
    console.log('Add new user:', newUser);
    // TODO: Implement add user functionality
    setNewUser({
      uniqueCode: '',
      username: '',
      brand: '',
      handler: '',
      label: '',
    });
    setShowAddUserModal(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const customers = getCustomersByTab();

  return (
    <div className="w-full space-y-6">
      {/* Tabs - Center with Frameless Style (like Date Slicer) */}
      <div className="flex flex-col items-center mb-6 select-none">
        <div className="inline-flex items-center gap-1">
          <button
            onClick={() => setActiveTab('reactivation')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer select-none flex items-center gap-2 ${
              activeTab === 'reactivation'
                ? 'bg-primary text-white shadow-sm'
                : 'text-foreground-primary hover:bg-primary/10'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reactivation
          </button>
          <button
            onClick={() => setActiveTab('retention')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer select-none flex items-center gap-2 ${
              activeTab === 'retention'
                ? 'bg-primary text-white shadow-sm'
                : 'text-foreground-primary hover:bg-primary/10'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            Retention
          </button>
          <button
            onClick={() => setActiveTab('recommend')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer select-none flex items-center gap-2 ${
              activeTab === 'recommend'
                ? 'bg-primary text-white shadow-sm'
                : 'text-foreground-primary hover:bg-primary/10'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Recommend
          </button>
        </div>
      </div>

      {/* Customer Table */}
      <Card className="bg-card-glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {activeTab === 'reactivation' && 'Reactivation'} 
            {activeTab === 'retention' && 'Retention'} 
            {activeTab === 'recommend' && 'Recommend'} Customer List
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleImport}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import Listing
            </Button>
            {activeTab === 'recommend' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add User
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-card-border bg-card-inner">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">Unique Code</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">Username</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">Brand</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">Handler</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted">Label</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-muted">Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-card-border hover:bg-primary/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="font-semibold text-foreground-primary">{customer.uniqueCode}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-foreground-primary">{customer.username}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-foreground-primary">{customer.brand}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-foreground-primary">{customer.handler}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        customer.label === 'VIP' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                        customer.label === 'Premium' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' :
                        customer.label === 'Dormant' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                        customer.label === 'Active' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                        customer.label === 'New' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' :
                        'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                      }`}>
                        {customer.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(customer)}
                          className="p-2 h-auto hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(customer)}
                          className="p-2 h-auto hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(customer)}
                          className="p-2 h-auto hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Import Sidebar - Slide from right */}
      <AnimatePresence>
        {showImportSidebar && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => {
                setShowImportSidebar(false);
                setSelectedFile(null);
              }}
              style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                margin: 0,
                padding: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 99999
              }}
            />
            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed right-0 top-0 h-screen w-full max-w-md bg-card-inner border-l border-card-border shadow-2xl flex flex-col overflow-hidden"
              style={{ zIndex: 100000, height: '100vh', minHeight: '100vh', maxHeight: '100vh', paddingTop: 0, marginTop: 0, top: 0 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-5 border-b border-card-border flex-shrink-0">
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-foreground-primary">Import</h3>
                <button
                  onClick={() => {
                    setShowImportSidebar(false);
                    setSelectedFile(null);
                  }}
                  className="text-muted hover:text-foreground-primary transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 sm:space-y-8">
                {/* File Requirements */}
                <div>
                  <h4 className="text-base sm:text-lg font-heading font-semibold text-foreground-primary mb-3 sm:mb-4">File Requirements</h4>
                  <ul className="space-y-2 sm:space-y-2.5 text-sm sm:text-base text-muted">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Supported formats: Excel (.xlsx, .xls) or CSV (.csv)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>File should contain {activeTab} list with required columns</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Maximum file size: 10MB</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Ensure data format matches the expected structure</span>
                    </li>
                  </ul>
                </div>

                {/* Drag & Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleBrowseFiles}
                  className={`border-2 border-dashed rounded-lg p-10 sm:p-12 min-h-[200px] sm:min-h-[240px] flex items-center justify-center text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-primary bg-primary/10'
                      : selectedFile
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-card-border hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  {selectedFile ? (
                    <div className="space-y-3 sm:space-y-4">
                      <CheckCircle className="w-12 h-12 sm:w-14 sm:h-14 text-green-400 mx-auto" />
                      <div>
                        <p className="text-base sm:text-lg font-semibold text-foreground-primary break-words">{selectedFile.name}</p>
                        <p className="text-sm sm:text-base text-muted mt-2">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="mt-3"
                      >
                        Change File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      <Upload className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto ${isDragging ? 'text-primary' : 'text-muted'}`} />
                      <div>
                        <p className="text-base sm:text-lg font-semibold text-foreground-primary">Drag & drop your file here</p>
                        <p className="text-sm sm:text-base text-muted mt-2">or click to browse</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                        Browse Files
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 sm:p-6 border-t border-card-border flex items-center justify-between gap-3">
                <button
                  onClick={handleDownloadTemplate}
                  className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2 text-sm sm:text-base font-semibold"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Download template</span>
                </button>
                <Button
                  variant="default"
                  onClick={handleStartUploading}
                  disabled={!selectedFile}
                  className="flex items-center gap-2 text-sm sm:text-base"
                >
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Start uploading</span>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add User Modal - Only for Recommend tab */}
      <AnimatePresence>
        {showAddUserModal && activeTab === 'recommend' && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowAddUserModal(false)}
              style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                margin: 0,
                padding: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 99999
              }}
            />
            {/* Modal */}
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
                margin: 0,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100000,
                pointerEvents: 'none'
              }}
            >
              <Card className="relative overflow-hidden group w-full max-w-md max-h-[90vh] overflow-y-auto" style={{ pointerEvents: 'auto', margin: '1rem' }}>
                <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
                <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-primary" />
                      Add New User
                    </CardTitle>
                    <button
                      onClick={() => setShowAddUserModal(false)}
                      className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-foreground-primary"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <form onSubmit={(e) => { e.preventDefault(); handleAddUser(); }} className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground-primary">Unique Code</label>
                      <input
                        type="text"
                        name="uniqueCode"
                        value={newUser.uniqueCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                        required
                        placeholder="e.g., UC009"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground-primary">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={newUser.username}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                        required
                        placeholder="Enter username"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground-primary">Brand</label>
                      <select
                        name="brand"
                        value={newUser.brand}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                        required
                      >
                        <option value="">Select Brand</option>
                        <option value="Brand A">Brand A</option>
                        <option value="Brand B">Brand B</option>
                        <option value="Brand C">Brand C</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground-primary">Handler</label>
                      <select
                        name="handler"
                        value={newUser.handler}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                        required
                      >
                        <option value="">Select Handler</option>
                        <option value="Handler 1">Handler 1</option>
                        <option value="Handler 2">Handler 2</option>
                        <option value="Handler 3">Handler 3</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground-primary">Label</label>
                      <select
                        name="label"
                        value={newUser.label}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                        required
                      >
                        <option value="">Select Label</option>
                        <option value="New">New</option>
                        <option value="Active">Active</option>
                        <option value="VIP">VIP</option>
                        <option value="Premium">Premium</option>
                      </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button type="submit" variant="default" className="flex-1">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add User
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddUserModal(false)}
                        className="flex-1"
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

