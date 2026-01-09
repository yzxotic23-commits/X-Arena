'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Edit, Trash2, RefreshCw, Repeat, UserPlus, Upload, X, FileText, Download, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { useLanguage } from '@/lib/language-context';
import { t } from '@/lib/translations';
import { supabase } from '@/lib/supabase-client';
import { supabase2 } from '@/lib/supabase-client-2';
import { Loading } from '@/components/Loading';
import * as XLSX from 'xlsx';

type TabType = 'reactivation' | 'retention' | 'recommend';

interface Customer {
  id: string;
  uniqueCode: string;
  username: string;
  brand: string;
  handler: string;
  label: string;
  month: string;
}

// REMOVED: getRandomLabel and mock data - no longer needed, using real data from Supabase

export function CustomerListingPage() {
  const { language } = useLanguage();
  const translations = t(language);
  const [activeTab, setActiveTab] = useState<TabType>('reactivation');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showImportSidebar, setShowImportSidebar] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]); // All customers for pagination
  const [loading, setLoading] = useState(true);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showDeleteMultipleConfirmModal, setShowDeleteMultipleConfirmModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingMultiple, setDeletingMultiple] = useState(false);
  const [editForm, setEditForm] = useState({
    uniqueCode: '',
    username: '',
    brand: '',
    handler: '',
    label: '',
    month: '',
  });
  const [newUser, setNewUser] = useState({
    uniqueCode: '',
    username: '',
    brand: '',
    handler: '',
    label: '',
    month: '',
  });
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  
  // Get current month for default value
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  // Fetch brands from brand_mapping
  const fetchBrands = useCallback(async () => {
    setLoadingBrands(true);
    try {
      const { data, error } = await supabase
        .from('brand_mapping')
        .select('brand')
        .eq('status', 'active')
        .order('brand', { ascending: true });

      if (error) {
        console.error('Failed to fetch brands', error);
        setAvailableBrands([]);
      } else {
        // Get unique brands
        const uniqueBrands = Array.from(new Set((data ?? []).map((item) => item.brand).filter(Boolean)));
        setAvailableBrands(uniqueBrands);
      }
    } catch (error) {
      console.error('Error fetching brands', error);
      setAvailableBrands([]);
    } finally {
      setLoadingBrands(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // Check if customer is active based on date (current month) and deposit_cases > 0
  // Column name is deposit_cases (with 's'), not deposit_case
  const checkCustomerActive = useCallback(async (uniqueCode: string, brand: string): Promise<boolean> => {
    if (!uniqueCode || !brand) return false;
    
    try {
      // Get current month date range
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth(); // 0-11
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
      
      // Format dates as YYYY-MM-DD
      const formatDateLocal = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };
      
      const startDateStr = formatDateLocal(startOfMonth);
      const endDateStr = formatDateLocal(endOfMonth);
      
      // Try different column name combinations - use deposit_cases (with 's')
      const columnCombinations = [
        { uniqueCodeCol: 'unique_code', lineCol: 'line', dateCol: 'date', depositCol: 'deposit_cases' },
        { uniqueCodeCol: 'uniqueCode', lineCol: 'line', dateCol: 'date', depositCol: 'deposit_cases' },
        { uniqueCodeCol: 'code', lineCol: 'line', dateCol: 'date', depositCol: 'deposit_cases' },
        { uniqueCodeCol: 'unique_code', lineCol: 'brand', dateCol: 'date', depositCol: 'deposit_cases' },
        { uniqueCodeCol: 'unique_code', lineCol: 'line', dateCol: 'tanggal', depositCol: 'deposit_cases' },
      ];
      
      for (const cols of columnCombinations) {
        try {
          const { data, error } = await supabase2
            .from('blue_whale_sgd')
            .select(`${cols.dateCol}, ${cols.depositCol}`)
            .eq(cols.uniqueCodeCol, uniqueCode)
            .eq(cols.lineCol, brand)
            .gte(cols.dateCol, startDateStr)
            .lte(cols.dateCol, endDateStr)
            .limit(100); // Get multiple records to check
          
          if (!error && data && data.length > 0) {
            // Check if any record has deposit_cases > 0
            const hasActiveDeposit = data.some((row: any) => {
              const deposit = parseFloat(row[cols.depositCol] || row.deposit_cases || row.depositCase || 0);
              return deposit > 0;
            });
            
            if (hasActiveDeposit) {
              return true;
            }
          }
        } catch (err) {
          // Column combination doesn't work, try next
          continue;
        }
      }
    } catch (error) {
      console.error('Error checking customer active status:', error);
    }
    
    return false;
  }, []);

  // Update labels based on active status from Supabase 2 (ultra-optimized and fast)
  const updateLabelsBasedOnActiveStatus = useCallback(async (tableName: string, customers: Array<{ id: string; uniqueCode: string; brand: string }>): Promise<{ success: boolean; updatedCount: number; activeCount: number } | void> => {
    try {
      const customersToProcess = customers;
      console.log(`[Label Update] Starting update for ${customersToProcess.length} customers...`);
      
      // Get current month date range
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
      
      const formatDateLocal = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };
      
      const startDateStr = formatDateLocal(startOfMonth);
      const endDateStr = formatDateLocal(endOfMonth);
      
      console.log(`[Label Update] Date range: ${startDateStr} to ${endDateStr}`);
      
      // Get unique brands
      const uniqueBrands = Array.from(new Set(customersToProcess.map(c => c.brand).filter(Boolean)));
      
      if (uniqueBrands.length === 0) {
        console.log('[Label Update] No brands to check');
        return { success: true, updatedCount: 0, activeCount: 0 };
      }
      
      console.log(`[Label Update] Checking ${uniqueBrands.length} brands:`, uniqueBrands.slice(0, 5), uniqueBrands.length > 5 ? '...' : '');
      
      // Get unique codes from customers for more efficient query
      const uniqueCodes = Array.from(new Set(customersToProcess.map(c => c.uniqueCode).filter(Boolean)));
      console.log(`[Label Update] Checking ${uniqueCodes.length} unique codes`);
      console.log(`[Label Update] Checking ${uniqueBrands.length} brands:`, uniqueBrands.slice(0, 10));
      console.log(`[Label Update] Date range: ${startDateStr} to ${endDateStr}`);
      console.log(`[Label Update] Sample customers to check:`, customersToProcess.slice(0, 5).map(c => ({
        id: c.id,
        uniqueCode: c.uniqueCode,
        brand: c.brand
      })));
      
      // Fetch data matching: unique_code AND brand/line must match, AND deposit_cases > 0 in current month
      // Column name is deposit_cases (with 's'), not deposit_case
      console.log(`[Label Update] Querying Supabase 2: ${uniqueCodes.length} unique codes, ${uniqueBrands.length} brands`);
      console.log(`[Label Update] Sample unique codes:`, uniqueCodes.slice(0, 5));
      console.log(`[Label Update] Sample brands:`, uniqueBrands.slice(0, 5));
      
      const { data: monthData, error: queryError } = await supabase2
        .from('blue_whale_sgd')
        .select('unique_code, line, date, deposit_cases')
        .in('unique_code', uniqueCodes) // Filter by unique_code first
        .in('line', uniqueBrands) // Then filter by brand/line
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .gt('deposit_cases', 0) // Only get records with deposit_cases > 0
        .limit(50000); // Large limit to get all data
      
      console.log(`[Label Update] Query result: ${monthData?.length || 0} records found`);
      
      if (queryError) {
        console.error('[Label Update] Query error:', queryError);
        // Try alternative column names
        const uniqueCodes = Array.from(new Set(customersToProcess.map(c => c.uniqueCode).filter(Boolean)));
        const { data: altData, error: altError } = await supabase2
          .from('blue_whale_sgd')
          .select('*')
          .in('unique_code', uniqueCodes) // Filter by unique_code first
          .in('line', uniqueBrands) // Then filter by brand/line
          .gte('date', startDateStr)
          .lte('date', endDateStr)
          .limit(50000);
        
        if (altError) {
          console.error('[Label Update] Alternative query also failed:', altError);
          return { success: false, updatedCount: 0, activeCount: 0 };
        }
        
        // Process alternative data
        // Column name is deposit_cases (with 's'), not deposit_case
        const processedData = (altData || []).map((row: any) => ({
          unique_code: row.unique_code || row.uniqueCode || row.code || '',
          line: row.line || row.brand || '',
          date: row.date || row.tanggal || '',
          deposit_cases: parseFloat(row.deposit_cases || row.deposit_case || row.depositCase || row.deposit || row.deposit_amount || 0),
        }));
        
        // Filter for deposit_cases > 0
        const activeData = processedData.filter((row: any) => row.deposit_cases > 0);
        console.log(`[Label Update] Found ${activeData.length} active records (from ${processedData.length} total)`);
        
        // Create active map
        // Matching logic: unique_code AND brand/line must match, AND deposit_cases > 0
        const activeMap = new Map<string, boolean>();
        activeData.forEach((row: any) => {
          const uniqueCode = String(row.unique_code || '').trim();
          const brand = String(row.line || '').trim();
          if (uniqueCode && brand) {
            // Key format: uniqueCode|brand (both must match exactly)
            // Use lowercase for consistent matching
            const key = `${uniqueCode.toLowerCase()}|${brand.toLowerCase()}`;
            activeMap.set(key, true);
          }
        });
        
        console.log(`[Label Update] Active map size: ${activeMap.size}`);
        
        // Update labels in batches using bulk update (more efficient)
        // Match: unique_code AND brand/line must be the same
        let activeCount = 0;
        let updatedCount = 0;
        
        // Separate customers into active and non-active groups
        const activeCustomerIds: string[] = [];
        const nonActiveCustomerIds: string[] = [];
        
        customersToProcess.forEach((customer) => {
          if (!customer.uniqueCode || !customer.brand) return;
          
          const uniqueCode = String(customer.uniqueCode).trim();
          const brand = String(customer.brand).trim();
          // Use lowercase for consistent matching
          const key = `${uniqueCode.toLowerCase()}|${brand.toLowerCase()}`;
          const isActive = activeMap.has(key);
          
          if (isActive) {
            activeCustomerIds.push(customer.id);
            activeCount++;
          } else {
            nonActiveCustomerIds.push(customer.id);
          }
        });
        
        // Debug: Show sample matching results
        console.log(`[Label Update] Matching results: ${activeCount} active, ${nonActiveCustomerIds.length} non-active`);
        if (activeCount > 0) {
          const sampleActive = customersToProcess.slice(0, 5).filter(c => {
            const uniqueCode = String(c.uniqueCode || '').trim();
            const brand = String(c.brand || '').trim();
            // Use lowercase for consistent matching
            const key = `${uniqueCode.toLowerCase()}|${brand.toLowerCase()}`;
            return activeMap.has(key);
          });
          console.log('[Label Update] Sample active customers:', sampleActive.map(c => ({
            id: c.id,
            uniqueCode: c.uniqueCode,
            brand: c.brand
          })));
        }
        
        // Bulk update active customers
        if (activeCustomerIds.length > 0) {
          const batchSize = 100;
          for (let i = 0; i < activeCustomerIds.length; i += batchSize) {
            const batch = activeCustomerIds.slice(i, i + batchSize);
            const { error } = await supabase
              .from(tableName)
              .update({ label: 'active' })
              .in('id', batch);
            
            if (error) {
              console.error(`[Label Update] Error updating active batch ${i / batchSize + 1}:`, error);
            } else {
              updatedCount += batch.length;
            }
          }
        }
        
        // Bulk update non-active customers
        if (nonActiveCustomerIds.length > 0) {
          const batchSize = 100;
          for (let i = 0; i < nonActiveCustomerIds.length; i += batchSize) {
            const batch = nonActiveCustomerIds.slice(i, i + batchSize);
            const { error } = await supabase
              .from(tableName)
              .update({ label: 'non active' })
              .in('id', batch);
            
            if (error) {
              console.error(`[Label Update] Error updating non-active batch ${i / batchSize + 1}:`, error);
            } else {
              updatedCount += batch.length;
            }
          }
        }
        
        console.log(`[Label Update] Updated ${updatedCount} customers: ${activeCount} active, ${updatedCount - activeCount} non active`);
        
        // Wait a bit to ensure database updates are committed before refetch
        // Increased delay to 3 seconds to ensure all updates are committed
        console.log('[Label Update] Waiting 3 seconds for database commits...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('[Label Update] Database commit wait completed');
        return { success: true, updatedCount, activeCount };
      }
      
      // Process normal query result
      if (!monthData || monthData.length === 0) {
        console.log('[Label Update] No data found for current month');
        return { success: true, updatedCount: 0, activeCount: 0 };
      }
      
      console.log(`[Label Update] Fetched ${monthData.length} records from Supabase 2`);
      
      // Show sample data from Supabase 2
      if (monthData && monthData.length > 0) {
        console.log('[Label Update] Sample data from Supabase 2 (first 10):', monthData.slice(0, 10).map((row: any) => ({
          unique_code: row.unique_code,
          line: row.line,
          date: row.date,
          deposit_cases: row.deposit_cases
        })));
        
        // Show unique combinations
        const uniqueCombos = new Set(monthData.map((row: any) => 
          `${String(row.unique_code || '').trim().toLowerCase()}|${String(row.line || '').trim().toLowerCase()}`
        ));
        console.log(`[Label Update] Unique combinations in Supabase 2: ${uniqueCombos.size}`);
        console.log('[Label Update] Sample combinations:', Array.from(uniqueCombos).slice(0, 10));
      }
      
      // Filter for deposit_cases > 0 and create active map
      // Matching logic: unique_code AND brand/line must match, AND deposit_cases > 0 in current month
      const activeMap = new Map<string, boolean>();
      let activeRecordCount = 0;
      
      monthData.forEach((row: any) => {
        const deposit = parseFloat(row.deposit_cases || 0);
        if (deposit > 0) {
          activeRecordCount++;
          const uniqueCode = String(row.unique_code || '').trim();
          const brand = String(row.line || '').trim();
          
          // Key format: uniqueCode|brand (both must match)
          // Use lowercase for consistent matching
          if (uniqueCode && brand) {
            const key = `${uniqueCode.toLowerCase()}|${brand.toLowerCase()}`;
            activeMap.set(key, true);
          }
        }
      });
      
      console.log(`[Label Update] Found ${activeRecordCount} records with deposit_cases > 0`);
      console.log(`[Label Update] Active map size: ${activeMap.size}`);
      
      // Sample some keys for debugging
      if (activeMap.size > 0) {
        const sampleKeys = Array.from(activeMap.keys()).slice(0, 20);
        console.log('[Label Update] Sample active keys (first 20):', sampleKeys);
        
        // Also show sample of unique codes and brands from activeMap
        const sampleEntries = Array.from(activeMap.entries())
          .filter(([key]) => !key.includes('|original'))
          .slice(0, 10);
        console.log('[Label Update] Sample active entries:', sampleEntries.map(([key]) => {
          const [uc, brand] = key.split('|');
          return { uniqueCode: uc, brand: brand };
        }));
      } else {
        console.warn('[Label Update] ⚠️ No active records found! Check if data exists in Supabase 2 for current month.');
      }
      
      // Update labels in batches using bulk update (more efficient)
      // Match: unique_code AND brand/line must be the same
      let activeCount = 0;
      let updatedCount = 0;
      
      // Separate customers into active and non-active groups
      const activeCustomerIds: string[] = [];
      const nonActiveCustomerIds: string[] = [];
      
      customersToProcess.forEach((customer) => {
        if (!customer.uniqueCode || !customer.brand) return;
        
        const uniqueCode = String(customer.uniqueCode).trim();
        const brand = String(customer.brand).trim();
        // Use lowercase for consistent matching
        const key = `${uniqueCode.toLowerCase()}|${brand.toLowerCase()}`;
        
        // Check if key exists in activeMap (already lowercase)
        const isActive = activeMap.has(key);
        
        // Debug logging for first few customers
        if (activeCount < 5 && isActive) {
          console.log(`[Label Update] ✅ Match found: uniqueCode="${uniqueCode}" brand="${brand}" key="${key}"`);
        }
        
        if (isActive) {
          activeCustomerIds.push(customer.id);
          activeCount++;
        } else {
          nonActiveCustomerIds.push(customer.id);
        }
      });
      
      // Bulk update active customers
      if (activeCustomerIds.length > 0) {
        console.log(`[Label Update] Updating ${activeCustomerIds.length} customers to 'active'...`);
        const batchSize = 100;
        let successCount = 0;
        for (let i = 0; i < activeCustomerIds.length; i += batchSize) {
          const batch = activeCustomerIds.slice(i, i + batchSize);
          const { data, error } = await supabase
            .from(tableName)
            .update({ label: 'active' })
            .in('id', batch)
            .select('id, label'); // Select to verify update
          
          if (error) {
            console.error(`[Label Update] Error updating active batch ${i / batchSize + 1}:`, error);
          } else {
            successCount += batch.length;
            updatedCount += batch.length;
            console.log(`[Label Update] ✅ Batch ${i / batchSize + 1}: Updated ${batch.length} customers to 'active'`);
            
            // Verify update
            if (data && data.length > 0) {
              const verifiedActive = data.filter((row: any) => row.label === 'active').length;
              console.log(`[Label Update] Verified: ${verifiedActive}/${data.length} have 'active' label`);
            }
          }
        }
        console.log(`[Label Update] ✅ Successfully updated ${successCount}/${activeCustomerIds.length} customers to 'active'`);
      } else {
        console.log('[Label Update] No active customers to update');
      }
      
      // Bulk update non-active customers
      if (nonActiveCustomerIds.length > 0) {
        const batchSize = 100;
        for (let i = 0; i < nonActiveCustomerIds.length; i += batchSize) {
          const batch = nonActiveCustomerIds.slice(i, i + batchSize);
          const { error } = await supabase
            .from(tableName)
            .update({ label: 'non active' })
            .in('id', batch);
          
          if (error) {
            console.error(`[Label Update] Error updating non-active batch ${i / batchSize + 1}:`, error);
          } else {
            updatedCount += batch.length;
          }
        }
      }
      
      console.log(`[Label Update] ✅ Completed: ${updatedCount} customers updated (${activeCount} active, ${updatedCount - activeCount} non active)`);
      
      // Wait a bit to ensure database updates are committed before refetch
      // Increased delay to 3 seconds to ensure all updates are committed
      console.log('[Label Update] Waiting 3 seconds for database commits...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('[Label Update] Database commit wait completed');
      
      // Debug: Show sample customer-brand combinations
      if (customersToProcess.length > 0) {
        const sampleCustomers = customersToProcess.slice(0, 10);
        console.log('[Label Update] === DETAILED MATCHING DEBUG ===');
        sampleCustomers.forEach(c => {
          const uniqueCode = String(c.uniqueCode || '').trim();
          const brand = String(c.brand || '').trim();
          // Use lowercase for consistent matching
          const key = `${uniqueCode.toLowerCase()}|${brand.toLowerCase()}`;
          const isActive = activeMap.has(key);
          
          // Check if key exists in activeMap (already lowercase, so direct check)
          let foundKey = null;
          if (isActive) {
            foundKey = key;
          }
          
          console.log(`[Label Update] Customer: unique_code="${uniqueCode}" brand="${brand}"`);
          console.log(`[Label Update]   Key: "${key}"`);
          console.log(`[Label Update]   Found in map: ${isActive ? 'YES ✅' : 'NO ❌'}`);
          if (foundKey && !isActive) {
            console.log(`[Label Update]   ⚠️ Case mismatch! Found similar key: "${foundKey}"`);
          }
          console.log(`[Label Update]   Result: ${isActive ? 'ACTIVE ✅' : 'non active ❌'}`);
        });
        console.log('[Label Update] === END DEBUG ===');
      }
      
      // Return result so caller can trigger full refetch
      return { success: true, updatedCount, activeCount };
    } catch (error) {
      console.error('[Label Update] ❌ Error:', error);
      return { success: false, updatedCount: 0, activeCount: 0 };
    }
  }, []);

  // Fallback: Update labels individually if batch processing fails
  const updateLabelsIndividually = useCallback(async (tableName: string, customers: Array<{ id: string; uniqueCode: string; brand: string }>) => {
    const batchSize = 10;
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (customer) => {
          if (!customer.uniqueCode || !customer.brand) return;
          
          const isActive = await checkCustomerActive(customer.uniqueCode, customer.brand);
          const newLabel = isActive ? 'active' : 'non active';
          
          await supabase
            .from(tableName)
            .update({ label: newLabel })
            .eq('id', customer.id);
        })
      );
    }
  }, [checkCustomerActive]);

  // REMOVED: updateAllLabelsToNonActive - no longer needed, using updateLabelsBasedOnActiveStatus instead

  // Fetch username from Supabase 2 based on unique_code and brand/line (optimized)
  const fetchUsernameFromSupabase2 = useCallback(async (uniqueCode: string, brand: string): Promise<string> => {
    if (!uniqueCode || !brand) return '';
    
    try {
      // Direct query with filters - much faster than fetching all and filtering in JS
      // Try different possible column name combinations
      const columnCombinations = [
        { uniqueCodeCol: 'unique_code', lineCol: 'line', usernameCol: 'username' },
        { uniqueCodeCol: 'uniqueCode', lineCol: 'line', usernameCol: 'username' },
        { uniqueCodeCol: 'code', lineCol: 'line', usernameCol: 'username' },
        { uniqueCodeCol: 'customer_code', lineCol: 'line', usernameCol: 'username' },
        { uniqueCodeCol: 'unique_code', lineCol: 'brand', usernameCol: 'username' },
        { uniqueCodeCol: 'unique_code', lineCol: 'line', usernameCol: 'user_name' },
        { uniqueCodeCol: 'unique_code', lineCol: 'line', usernameCol: 'user' },
      ];
      
      for (const cols of columnCombinations) {
        try {
          const { data, error } = await supabase2
            .from('blue_whale_sgd')
            .select(cols.usernameCol)
            .eq(cols.uniqueCodeCol, uniqueCode)
            .eq(cols.lineCol, brand)
            .limit(1)
            .single();
          
          if (!error && data) {
            const username = (data as any)[cols.usernameCol] || '';
            if (username) {
              return String(username);
            }
          }
        } catch (err) {
          // Column combination doesn't work, try next
          continue;
        }
      }
    } catch (error) {
      console.error('Error fetching username from Supabase 2:', error);
    }
    
    return '';
  }, []);

  // Batch fetch usernames for multiple customers at once (more efficient)
  const fetchUsernamesBatch = useCallback(async (customers: Array<{ uniqueCode: string; brand: string }>): Promise<Map<string, string>> => {
    const usernameMap = new Map<string, string>();
    
    if (customers.length === 0) return usernameMap;
    
    try {
      // Get unique combinations of uniqueCode and brand
      const uniqueCombinations = Array.from(
        new Set(customers.map(c => `${c.uniqueCode}|${c.brand}`))
      ).map(combo => {
        const [uniqueCode, brand] = combo.split('|');
        return { uniqueCode, brand };
      });
      
      // Fetch all at once with a single query (if possible)
      // Try to get all matching records in one query
      const { data, error } = await supabase2
        .from('blue_whale_sgd')
        .select('unique_code, line, username, user_name, user')
        .in('line', Array.from(new Set(uniqueCombinations.map(c => c.brand))))
        .limit(5000); // Reasonable limit
      
      if (!error && data && data.length > 0) {
        // Create a map for quick lookup
        const dataMap = new Map<string, any>();
        data.forEach((row: any) => {
          const key = `${row.unique_code || row.uniqueCode || row.code || row.customer_code || ''}|${row.line || row.brand || ''}`;
          if (!dataMap.has(key)) {
            dataMap.set(key, row);
          }
        });
        
        // Match customers with fetched data
        uniqueCombinations.forEach(({ uniqueCode, brand }) => {
          const key = `${uniqueCode}|${brand}`;
          const matched = dataMap.get(key);
          if (matched) {
            const username = matched.username || matched.user_name || matched.user || '';
            if (username) {
              usernameMap.set(key, username);
            }
          }
        });
      }
      
      // For any that weren't found in batch, fetch individually
      const notFound = uniqueCombinations.filter(({ uniqueCode, brand }) => {
        const key = `${uniqueCode}|${brand}`;
        return !usernameMap.has(key);
      });
      
      // Fetch remaining individually (but limit concurrent requests)
      const batchSize = 10;
      for (let i = 0; i < notFound.length; i += batchSize) {
        const batch = notFound.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async ({ uniqueCode, brand }) => {
            const username = await fetchUsernameFromSupabase2(uniqueCode, brand);
            if (username) {
              const key = `${uniqueCode}|${brand}`;
              usernameMap.set(key, username);
            }
          })
        );
      }
    } catch (error) {
      console.error('Error in batch fetch usernames:', error);
    }
    
    return usernameMap;
  }, [fetchUsernameFromSupabase2]);

  // Check if customers are active by querying Supabase 2 directly (no database update needed)
  const checkCustomersActiveStatus = useCallback(async (customers: Array<{ uniqueCode: string; brand: string }>): Promise<Map<string, boolean>> => {
    const activeMap = new Map<string, boolean>();
    
    if (customers.length === 0) return activeMap;
    
    try {
      // Get current month date range
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
      
      const formatDateLocal = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };
      
      const startDateStr = formatDateLocal(startOfMonth);
      const endDateStr = formatDateLocal(endOfMonth);
      
      // Get unique codes and brands
      const uniqueCodes = Array.from(new Set(customers.map(c => c.uniqueCode).filter(Boolean)));
      const uniqueBrands = Array.from(new Set(customers.map(c => c.brand).filter(Boolean)));
      
      if (uniqueCodes.length === 0 || uniqueBrands.length === 0) {
        return activeMap;
      }
      
      console.log(`[Label Check] Checking ${uniqueCodes.length} unique codes and ${uniqueBrands.length} brands for current month...`);
      
      // Query Supabase 2 for active customers (deposit_cases > 0 in current month)
      const { data: monthData, error } = await supabase2
        .from('blue_whale_sgd')
        .select('unique_code, line, deposit_cases')
        .in('unique_code', uniqueCodes)
        .in('line', uniqueBrands)
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .gt('deposit_cases', 0)
        .limit(50000);
      
      if (error) {
        console.error('[Label Check] Error querying Supabase 2:', error);
        return activeMap;
      }
      
      if (monthData && monthData.length > 0) {
        // Create map of active customers (unique_code|brand)
        monthData.forEach((row: any) => {
          const uniqueCode = String(row.unique_code || '').trim().toLowerCase();
          const brand = String(row.line || '').trim().toLowerCase();
          if (uniqueCode && brand) {
            const key = `${uniqueCode}|${brand}`;
            activeMap.set(key, true);
          }
        });
        
        console.log(`[Label Check] Found ${activeMap.size} active customer combinations`);
      } else {
        console.log('[Label Check] No active customers found in current month');
      }
    } catch (error) {
      console.error('[Label Check] Error:', error);
    }
    
    return activeMap;
  }, []);

  // Fetch customers from Supabase
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const tableName = activeTab === 'reactivation' 
        ? 'customer_reactivation' 
        : activeTab === 'retention' 
        ? 'customer_retention' 
        : 'customer_recommend';
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch customers', error);
        setCustomers([]);
        setAllCustomers([]);
      } else {
        let mappedData = (data ?? []).map((row) => ({
          id: row.id.toString(),
          uniqueCode: row.unique_code ?? '',
          username: (activeTab === 'recommend') ? (row.username ?? '') : '', // Only recommend uses username
          brand: row.brand ?? '',
          handler: row.handler ?? '',
          label: activeTab === 'recommend' ? (row.label ?? 'New') : 'non active', // Default, will be updated below
          month: row.month ?? getCurrentMonth(),
        }));

        // For reactivation, retention, and recommend, check active status directly from Supabase 2
        if ((activeTab === 'reactivation' || activeTab === 'retention' || activeTab === 'recommend') && mappedData.length > 0) {
          console.log('[Fetch] Checking active status from Supabase 2...');
          const activeMap = await checkCustomersActiveStatus(mappedData);
          
          // Update labels based on active status
          mappedData = mappedData.map(customer => {
            if (!customer.uniqueCode || !customer.brand) {
              return { ...customer, label: activeTab === 'recommend' ? 'New' : 'non active' };
            }
            
            const uniqueCode = String(customer.uniqueCode).trim().toLowerCase();
            const brand = String(customer.brand).trim().toLowerCase();
            const key = `${uniqueCode}|${brand}`;
            const isActive = activeMap.has(key);
            
            return {
              ...customer,
              label: isActive ? 'active' : (activeTab === 'recommend' ? 'New' : 'non active')
            };
          });
          
          const activeCount = mappedData.filter(c => c.label === 'active').length;
          console.log(`[Fetch] ${activeCount}/${mappedData.length} customers are active`);
        }

        // Display data
        setAllCustomers(mappedData);
        // Apply pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setCustomers(mappedData.slice(startIndex, endIndex));
      }
    } catch (error) {
      console.error('Error fetching customers', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, checkCustomersActiveStatus, currentPage, itemsPerPage]);

  // REMOVED: useEffect that sets all labels to "non active" on mount
  // Now labels are determined dynamically based on deposit_cases > 0 from Supabase 2
  
  useEffect(() => {
    // Only fetch on mount or when tab changes
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]); // Only depend on activeTab, not fetchCustomers to prevent infinite loop

  // Reset pagination and selected customers when tab changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedCustomers([]);
  }, [activeTab]);

  // Reset selected customers when page changes
  useEffect(() => {
    setSelectedCustomers([]);
  }, [currentPage]);

  // Re-apply pagination when itemsPerPage or currentPage changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCustomers(allCustomers.slice(startIndex, endIndex));
  }, [itemsPerPage, allCustomers, currentPage]);

  // Reset to page 1 when itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Handle select/deselect all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(customers.map(c => c.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  // Handle select/deselect single customer
  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    if (checked) {
      setSelectedCustomers([...selectedCustomers, customerId]);
    } else {
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId));
    }
  };

  // Check if all current page customers are selected
  const isAllSelected = customers.length > 0 && customers.every(c => selectedCustomers.includes(c.id));

  // Handle delete multiple
  const handleDeleteMultipleClick = () => {
    if (selectedCustomers.length === 0) {
      alert('Please select at least one customer to delete.');
      return;
    }
    setShowDeleteMultipleConfirmModal(true);
  };

  const handleDeleteMultipleConfirm = async () => {
    if (selectedCustomers.length === 0) return;

    setDeletingMultiple(true);
    try {
      const tableName = activeTab === 'reactivation' 
        ? 'customer_reactivation' 
        : activeTab === 'retention' 
        ? 'customer_retention' 
        : 'customer_recommend';

      const { error } = await supabase
        .from(tableName)
        .delete()
        .in('id', selectedCustomers);

      if (error) {
        console.error('Failed to delete customers', error);
        alert('Failed to delete customers: ' + error.message);
        setDeletingMultiple(false);
        return;
      }

      setShowDeleteMultipleConfirmModal(false);
      setSelectedCustomers([]);
      fetchCustomers(); // Refresh data
      alert(`${selectedCustomers.length} customer(s) deleted successfully!`);
    } catch (error) {
      console.error('Delete error', error);
      alert('An error occurred during deletion. Please try again.');
    } finally {
      setDeletingMultiple(false);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(allCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, allCustomers.length);

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditForm({
      uniqueCode: customer.uniqueCode,
      username: customer.username,
      brand: customer.brand,
      handler: customer.handler,
      label: customer.label,
      month: customer.month || getCurrentMonth(),
    });
    setShowEditModal(true);
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    setSaving(true);
    try {
      const tableName = activeTab === 'reactivation' 
        ? 'customer_reactivation' 
        : activeTab === 'retention' 
        ? 'customer_retention' 
        : 'customer_recommend';

      // Validasi Handler
      if (editForm.handler !== 'Shift A' && editForm.handler !== 'Shift B') {
        alert('Handler must be "Shift A" or "Shift B"');
        setSaving(false);
        return;
      }

      // Build update object based on active tab
      const updateData: any = {
        unique_code: editForm.uniqueCode,
        brand: editForm.brand,
        handler: editForm.handler,
        label: editForm.label || 'non active',
        month: editForm.month || getCurrentMonth(),
      };
      
      // Only add username for recommend tab
      if (activeTab === 'recommend') {
        updateData.username = editForm.username || '';
      }
      
      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', editingCustomer.id);

      if (error) {
        console.error('Failed to update customer', error);
        alert('Failed to update customer: ' + error.message);
        setSaving(false);
        return;
      }

      setShowEditModal(false);
      setEditingCustomer(null);
      setEditForm({ uniqueCode: '', username: '', brand: '', handler: '', label: '', month: '' });
      fetchCustomers(); // Refresh data
      alert('Customer updated successfully!');
    } catch (error) {
      console.error('Update error', error);
      alert('An error occurred during update. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setShowDeleteConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;

    setDeleting(true);
    try {
      const tableName = activeTab === 'reactivation' 
        ? 'customer_reactivation' 
        : activeTab === 'retention' 
        ? 'customer_retention' 
        : 'customer_recommend';

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', customerToDelete.id);

      if (error) {
        console.error('Failed to delete customer', error);
        alert('Failed to delete customer: ' + error.message);
        setDeleting(false);
        return;
      }

      setShowDeleteConfirmModal(false);
      setCustomerToDelete(null);
      fetchCustomers(); // Refresh data
      alert('Customer deleted successfully!');
    } catch (error) {
      console.error('Delete error', error);
      alert('An error occurred during deletion. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmModal(false);
    setCustomerToDelete(null);
  };

  const handleImport = () => {
    setShowImportSidebar(true);
  };

  const handleFileSelect = (file: File) => {
    // Validate file type - ONLY Excel files
    const validTypes = ['.xlsx', '.xls'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      alert('Invalid file type. Please select Excel file (.xlsx or .xls) only.');
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
    setUploadSuccess(false);
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
    input.accept = '.xlsx,.xls';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    };
    input.click();
  };

  // REMOVED: generateLabel - labels are now determined dynamically based on deposit_cases > 0

  // Parse Excel file and validate data
  const parseExcelFile = async (file: File): Promise<{ valid: any[], errors: string[] }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

          if (jsonData.length < 2) {
            resolve({ valid: [], errors: ['File is empty or has no data rows.'] });
            return;
          }

          // Get header row (first row)
          const headers = (jsonData[0] as any[]).map((h: any) => String(h).toLowerCase().trim());
          const uniqueCodeIdx = headers.findIndex((h: string) => h.includes('unique') && h.includes('code'));
          const usernameIdx = headers.findIndex((h: string) => h.includes('username') || h.includes('name'));
          const brandIdx = headers.findIndex((h: string) => h.includes('brand'));
          const handlerIdx = headers.findIndex((h: string) => h.includes('handler'));
          const monthIdx = headers.findIndex((h: string) => h.includes('month'));

          // Month column is optional - if not found, will use current month
          if (uniqueCodeIdx === -1 || brandIdx === -1 || handlerIdx === -1) {
            resolve({ valid: [], errors: ['Missing required columns. Please use the template.'] });
            return;
          }

          const valid: any[] = [];
          const errors: string[] = [];

          // Process data rows (skip header)
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            if (!row || row.length === 0) continue;

            const uniqueCode = String(row[uniqueCodeIdx] || '').trim();
            const username = activeTab === 'recommend' && usernameIdx !== -1 
              ? String(row[usernameIdx] || '').trim()
              : ''; // No username for reactivation and retention
            const brand = String(row[brandIdx] || '').trim();
            const handler = String(row[handlerIdx] || '').trim();
            const month = monthIdx !== -1 ? String(row[monthIdx] || '').trim() : getCurrentMonth();

            // Validation
            const rowErrors: string[] = [];

            // Unique Code: Wajib
            if (!uniqueCode) {
              rowErrors.push(`Row ${i + 1}: Unique Code is required`);
            }

            // Brand: Wajib
            if (!brand) {
              rowErrors.push(`Row ${i + 1}: Brand is required`);
            }

            // Handler: Wajib, hanya "Shift A" atau "Shift B"
            if (!handler) {
              rowErrors.push(`Row ${i + 1}: Handler is required`);
            } else if (handler !== 'Shift A' && handler !== 'Shift B') {
              rowErrors.push(`Row ${i + 1}: Handler must be "Shift A" or "Shift B"`);
            }

            // Month: Optional, format YYYY-MM. If empty, will use current month
            if (month && !/^\d{4}-\d{2}$/.test(month)) {
              rowErrors.push(`Row ${i + 1}: Month must be in format YYYY-MM (e.g., 2024-01)`);
            }

            // Username: Optional (boleh kosong)
            // Label: Tidak perlu diisi (akan di-generate otomatis untuk reactivation/retention)

            if (rowErrors.length > 0) {
              errors.push(...rowErrors);
            } else {
              // Build data object based on active tab
              // Label harus di-set karena database tidak boleh NULL
              // Untuk reactivation/retention, set default 'non active' (akan di-cek dari Supabase 2 saat fetch)
              // Use month from Excel if provided, otherwise use current month
              const finalMonth = month && /^\d{4}-\d{2}$/.test(month) ? month : getCurrentMonth();
              
              const customerData: any = {
                unique_code: uniqueCode,
                brand: brand,
                handler: handler,
                label: activeTab === 'recommend' ? 'New' : 'non active', // Default 'non active' untuk reactivation/retention
                month: finalMonth,
              };
              
              // Only add username for recommend tab
              if (activeTab === 'recommend') {
                customerData.username = username || '';
              }
              
              valid.push(customerData);
            }
          }

          resolve({ valid, errors });
        } catch (error) {
          console.error('Error parsing Excel file', error);
          resolve({ valid: [], errors: ['Failed to parse Excel file. Please check the file format.'] });
        }
      };
      reader.onerror = () => {
        resolve({ valid: [], errors: ['Failed to read file.'] });
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleStartUploading = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      // Parse Excel file
      const { valid, errors } = await parseExcelFile(selectedFile);

      if (errors.length > 0) {
        setUploadError(`Validation errors:\n${errors.join('\n')}`);
        setIsUploading(false);
        return;
      }

      if (valid.length === 0) {
        setUploadError('No valid data found in the file.');
        setIsUploading(false);
        return;
      }

      // Determine table name
      const tableName = activeTab === 'reactivation' 
        ? 'customer_reactivation' 
        : activeTab === 'retention' 
        ? 'customer_retention' 
        : 'customer_recommend';

      // Insert data to Supabase
      const { error } = await supabase
        .from(tableName)
        .insert(valid);

      if (error) {
        console.error('Failed to insert customers', error);
        setUploadError(`Failed to upload: ${error.message}`);
        setIsUploading(false);
        return;
      }

      setUploadSuccess(true);
      
      // After successful import, just refresh data
      // Labels will be checked directly from Supabase 2 when fetching
      console.log('[Import] Import successful, refreshing data...');
      setTimeout(async () => {
        await fetchCustomers(); // Fetch will automatically check labels from Supabase 2
      }, 1000);
      
      setTimeout(() => {
        setSelectedFile(null);
        setShowImportSidebar(false);
        setUploadSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Upload error', error);
      setUploadError('An error occurred during upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Create template data - different for recommend vs reactivation/retention
    const templateData = activeTab === 'recommend'
      ? [
          ['Unique Code', 'Username', 'Brand', 'Handler', 'Month'],
          ['UC001', 'john_doe', 'Brand A', 'Shift A', getCurrentMonth()],
          ['UC002', 'jane_smith', 'Brand B', 'Shift B', getCurrentMonth()],
          ['UC003', 'bob_wilson', 'Brand C', 'Shift A', getCurrentMonth()],
        ]
      : [
          ['Unique Code', 'Brand', 'Handler', 'Month'],
          ['UC001', 'Brand A', 'Shift A', getCurrentMonth()],
          ['UC002', 'Brand B', 'Shift B', getCurrentMonth()],
          ['UC003', 'Brand C', 'Shift A', getCurrentMonth()],
        ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);

    // Set column widths
    ws['!cols'] = activeTab === 'recommend'
      ? [
          { wch: 15 }, // Unique Code
          { wch: 20 }, // Username
          { wch: 15 }, // Brand
          { wch: 15 }, // Handler
        ]
      : [
          { wch: 15 }, // Unique Code
          { wch: 15 }, // Brand
          { wch: 15 }, // Handler
        ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Template');

    // Generate file name
    const fileName = `${activeTab}_template.xlsx`;

    // Write and download
    XLSX.writeFile(wb, fileName);
  };

  const handleAddUser = async () => {
    // Validation
    if (!newUser.uniqueCode || !newUser.brand || !newUser.handler) {
      alert('Please fill in all required fields (Unique Code, Brand, Handler)');
      return;
    }

    if (newUser.handler !== 'Shift A' && newUser.handler !== 'Shift B') {
      alert('Handler must be "Shift A" or "Shift B"');
      return;
    }

    try {
      const tableName = activeTab === 'reactivation' 
        ? 'customer_reactivation' 
        : activeTab === 'retention' 
        ? 'customer_retention' 
        : 'customer_recommend';

      // Build insert data object based on active tab
      // Month is automatically set to current month
      // Label is automatically set by Supabase based on deposit_cases > 0
      const insertData: any = {
        unique_code: newUser.uniqueCode,
        brand: newUser.brand,
        handler: newUser.handler,
        month: getCurrentMonth(), // Always use current month
      };
      
      // Only add username for recommend tab
      if (activeTab === 'recommend') {
        insertData.username = newUser.username || '';
        // For recommend, label defaults to 'New'
        insertData.label = 'New';
      } else {
        // For reactivation and retention, label will be auto-updated by Supabase based on deposit_cases
        // Set initial label as 'non active', will be updated automatically if deposit_cases > 0
        insertData.label = 'non active';
      }

      const { error } = await supabase
        .from(tableName)
        .insert(insertData);

      if (error) {
        console.error('Failed to add customer', error);
        alert('Failed to add customer: ' + error.message);
        return;
      }

      setNewUser({
        uniqueCode: '',
        username: '',
        brand: '',
        handler: '',
        label: '',
        month: '',
      });
      setShowAddUserModal(false);
      
      // After adding user, update labels based on deposit_cases > 0 for reactivation/retention
      if (activeTab === 'reactivation' || activeTab === 'retention') {
        console.log('[Add User] User added, refreshing data...');
        // Fetch customers - labels will be checked directly from Supabase 2
        await fetchCustomers();
      } else {
        fetchCustomers(); // Just refresh for recommend
      }
      alert('Customer added successfully!');
    } catch (error) {
      console.error('Add customer error', error);
      alert('An error occurred while adding customer. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


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
            {translations.customerListing.reactivation}
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
            {translations.customerListing.retention}
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
            {translations.customerListing.recommend}
          </button>
        </div>
      </div>

      {/* Customer Table */}
      <Card className="bg-card-glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {activeTab === 'reactivation' && translations.customerListing.reactivation} 
            {activeTab === 'retention' && translations.customerListing.retention} 
            {activeTab === 'recommend' && translations.customerListing.recommend} {translations.customerListing.customerList}
          </CardTitle>
          <div className="flex items-center gap-2">
            {selectedCustomers.length > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={handleDeleteMultipleClick}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600"
                disabled={deletingMultiple}
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedCustomers.length})
              </Button>
            )}
            {(activeTab === 'reactivation' || activeTab === 'retention') && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  console.log('[Refresh Labels] Manually refreshing labels based on deposit_cases > 0...');
                  // Fetch all customers - labels will be checked directly from Supabase 2
                  await fetchCustomers();
                }}
                className="flex items-center gap-2"
                title="Refresh labels based on deposit_cases > 0 in current month"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Labels
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleImport}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {translations.customerListing.importCustomers}
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
                <tr className={`border-b-2 ${
                  'border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5 dark:bg-card-inner dark:border-primary/60'
                }`}>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-foreground-primary w-12">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-card-border text-primary focus:ring-primary cursor-pointer"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">{translations.customerListing.uniqueCode}</th>
                  {activeTab === 'recommend' && (
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">{translations.customerListing.username}</th>
                  )}
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">{translations.customerListing.brand}</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">{translations.customerListing.handler}</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">{translations.customerListing.label}</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-foreground-primary">Month</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-foreground-primary">{translations.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={activeTab === 'recommend' ? 8 : 7} className="py-8 px-4">
                      <div className="flex justify-center">
                        <Loading size="md" text={translations.common.loading} variant="gaming" />
                      </div>
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === 'recommend' ? 8 : 7} className="py-8 px-4 text-center text-muted">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer, index) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-card-border hover:bg-primary/5 transition-colors"
                  >
                    <td className="py-4 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={(e) => handleSelectCustomer(customer.id, e.target.checked)}
                        className="w-4 h-4 rounded border-card-border text-primary focus:ring-primary cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-foreground-primary">{customer.uniqueCode}</span>
                    </td>
                    {activeTab === 'recommend' && (
                      <td className="py-4 px-4">
                        <span className="text-foreground-primary">{customer.username}</span>
                      </td>
                    )}
                    <td className="py-4 px-4">
                      <span className="text-foreground-primary">{customer.brand}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-foreground-primary">{customer.handler}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        customer.label === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                        customer.label === 'non active' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                        customer.label === 'VIP' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                        customer.label === 'Premium' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' :
                        customer.label === 'New' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' :
                        'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                      }`}>
                        {customer.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-foreground-primary">{customer.month || getCurrentMonth()}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(customer)}
                          className="p-2 h-auto hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                          disabled={deleting}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(customer)}
                          className="p-2 h-auto hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          disabled={deleting || loading}
                        >
                          <Trash2 className={`w-4 h-4 ${deleting ? 'opacity-50' : ''}`} />
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
        
        {/* Pagination Controls */}
        {!loading && allCustomers.length > 0 && (
          <div className="border-t border-card-border px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-1.5 bg-background border border-card-border rounded-lg text-foreground-primary text-sm focus:outline-none focus:border-primary transition-colors"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">
                Showing {startIndex + 1} - {endIndex} of {allCustomers.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-foreground-primary px-3">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
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
                      <span>Supported formats: Excel (.xlsx, .xls) only</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Required columns: Unique Code, Brand, Handler (Shift A or Shift B)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Username is optional (can be empty)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Label will be generated automatically for {activeTab}</span>
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

                {/* Upload Status */}
                {uploadError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-400 mb-1">Upload Failed</p>
                      <p className="text-sm text-red-300 whitespace-pre-line">{uploadError}</p>
                    </div>
                  </motion.div>
                )}

                {uploadSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <p className="text-sm font-semibold text-green-400">Upload successful! Data has been imported.</p>
                  </motion.div>
                )}
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
                  disabled={!selectedFile || isUploading}
                  className="flex items-center gap-2 text-sm sm:text-base"
                >
                  {isUploading ? (
                    <>
                      <Loading size="sm" variant="minimal" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Start uploading</span>
                    </>
                  )}
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
                      {activeTab === 'recommend' && (
                        <>
                          <label className="block text-sm font-semibold text-foreground-primary">Username</label>
                          <input
                            type="text"
                            name="username"
                            value={newUser.username}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                            placeholder="Enter username"
                          />
                        </>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground-primary">Brand</label>
                      <select
                        name="brand"
                        value={newUser.brand}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                        required
                        disabled={loadingBrands}
                      >
                        <option value="">{loadingBrands ? 'Loading brands...' : 'Select Brand'}</option>
                        {availableBrands.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
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
                        <option value="Shift A">Shift A</option>
                        <option value="Shift B">Shift B</option>
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

      {/* Edit Customer Modal */}
      <AnimatePresence>
        {showEditModal && editingCustomer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowEditModal(false); setEditingCustomer(null); }}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)', zIndex: 99999 }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, pointerEvents: 'none' }}
            >
              <Card className="relative overflow-hidden group w-full max-w-md max-h-[90vh] overflow-y-auto" style={{ pointerEvents: 'auto', margin: '1rem' }}>
                <div className="absolute inset-0 card-gradient-overlay transition-opacity" />
                <div className="absolute top-0 right-0 w-32 h-32 card-gradient-blur rounded-full blur-3xl" />
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Edit className="w-5 h-5 text-primary" />
                      Edit Customer
                    </CardTitle>
                    <button
                      onClick={() => { setShowEditModal(false); setEditingCustomer(null); }}
                      className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-foreground-primary"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <form onSubmit={handleUpdateCustomer} className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground-primary">Unique Code <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        value={editForm.uniqueCode}
                        onChange={(e) => setEditForm({ ...editForm, uniqueCode: e.target.value })}
                        className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                        required
                        placeholder="e.g., UC001"
                      />
                    </div>
                    <div className="space-y-2">
                      {activeTab === 'recommend' && (
                        <>
                          <label className="block text-sm font-semibold text-foreground-primary">Username</label>
                          <input
                            type="text"
                            value={editForm.username}
                            onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                            className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                            placeholder="Enter username (optional)"
                          />
                        </>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground-primary">Brand <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        value={editForm.brand}
                        onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                        className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                        required
                        placeholder="Enter brand"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground-primary">Handler <span className="text-red-400">*</span></label>
                      <select
                        value={editForm.handler}
                        onChange={(e) => setEditForm({ ...editForm, handler: e.target.value })}
                        className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                        required
                      >
                        <option value="">Select Handler</option>
                        <option value="Shift A">Shift A</option>
                        <option value="Shift B">Shift B</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground-primary">Month <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        value={editForm.month}
                        onChange={(e) => setEditForm({ ...editForm, month: e.target.value })}
                        className="w-full px-4 py-2 bg-background border border-card-border rounded-lg text-foreground-primary focus:outline-none focus:border-primary transition-colors"
                        required
                        placeholder="YYYY-MM (e.g., 2024-01)"
                        pattern="\d{4}-\d{2}"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button type="submit" variant="default" className="flex-1" disabled={saving}>
                        {saving ? (
                          <>
                            <Loading size="sm" variant="minimal" />
                            <span className="ml-2">Updating...</span>
                          </>
                        ) : (
                          <>
                            <Edit className="w-4 h-4 mr-2" />
                            Update Customer
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => { setShowEditModal(false); setEditingCustomer(null); }}
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirmModal && customerToDelete && (
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
                      Delete Customer
                    </CardTitle>
                    <button onClick={handleDeleteCancel} className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-foreground-primary">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-4">
                    <p className="text-foreground-primary">Are you sure you want to delete this customer? This action cannot be undone.</p>
                    {customerToDelete && (
                      <div className="bg-card-inner rounded-lg p-4 border border-card-border">
                        <div className="space-y-2">
                          <div><span className="text-sm text-muted">Unique Code:</span><p className="text-sm font-semibold text-foreground-primary">{customerToDelete.uniqueCode}</p></div>
                          {activeTab === 'recommend' && (
                            <div><span className="text-sm text-muted">Username:</span><p className="text-sm font-semibold text-foreground-primary">{customerToDelete.username || '-'}</p></div>
                          )}
                          <div><span className="text-sm text-muted">Brand:</span><p className="text-sm font-semibold text-foreground-primary">{customerToDelete.brand}</p></div>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={handleDeleteCancel} className="flex-1" disabled={deleting}>
                        Cancel
                      </Button>
                      <Button type="button" variant="default" onClick={handleDeleteConfirm} className="flex-1 bg-red-500 hover:bg-red-600 text-white" disabled={deleting}>
                        {deleting ? (
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

      {/* Delete Multiple Confirmation Modal */}
      <AnimatePresence>
        {showDeleteMultipleConfirmModal && selectedCustomers.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteMultipleConfirmModal(false)}
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
                      Delete Multiple Customers
                    </CardTitle>
                    <button onClick={() => setShowDeleteMultipleConfirmModal(false)} className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-foreground-primary">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-4">
                    <p className="text-foreground-primary">
                      Are you sure you want to delete <span className="font-semibold text-red-400">{selectedCustomers.length}</span> customer(s)? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setShowDeleteMultipleConfirmModal(false)} className="flex-1" disabled={deletingMultiple}>
                        Cancel
                      </Button>
                      <Button type="button" variant="default" onClick={handleDeleteMultipleConfirm} className="flex-1 bg-red-500 hover:bg-red-600 text-white" disabled={deletingMultiple}>
                        {deletingMultiple ? (
                          <>
                            <Loading size="sm" variant="minimal" />
                            <span className="ml-2">Deleting...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete {selectedCustomers.length} Customer(s)
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

