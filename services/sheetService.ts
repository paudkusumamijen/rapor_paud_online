import { ApiPayload, ApiResponse, AppState } from "../types";
import { SUPABASE_URL, SUPABASE_KEY } from "../constants";
import { createClient } from "@supabase/supabase-js";

// --- SUPABASE CLIENT INITIALIZATION ---
let supabase: any = null;

// Helper to get configuration
const getSupabaseConfig = () => {
  const url = SUPABASE_URL || localStorage.getItem('supabase_url');
  const key = SUPABASE_KEY || localStorage.getItem('supabase_key');
  return { url, key };
};

// Reset Helper (For Settings Page)
export const resetSupabaseClient = () => {
    supabase = null;
};

// Initialize Supabase if config exists
const initSupabase = () => {
  const { url, key } = getSupabaseConfig();
  if (url && key && !supabase) {
    try {
      supabase = createClient(url, key);
    } catch (e) {
      console.error("Invalid Supabase Config", e);
    }
  }
  return supabase;
};

// Helper: Convert camelCase (Frontend) to snake_case (DB)
const toSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
const toCamelCase = (str: string) => str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

const mapKeys = (obj: any, mapper: (k: string) => string) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(i => mapKeys(i, mapper));
  
  return Object.keys(obj).reduce((acc, key) => {
    acc[mapper(key)] = mapKeys(obj[key], mapper);
    return acc;
  }, {} as any);
};

export const sheetService = {
  // Check connection status
  isConnected: () => {
    const { url, key } = getSupabaseConfig();
    return !!(url && key);
  },

  // --- MAIN FETCH METHOD ---
  async fetchAllData(): Promise<AppState | null> {
    const sb = initSupabase();
    
    if (!sb) return null;

    try {
      const [
          { data: classes }, { data: students }, { data: tps }, 
          { data: assessments }, { data: categoryResults }, 
          { data: p5Criteria }, { data: p5Assessments }, 
          { data: reflections }, { data: notes }, 
          { data: attendance }, { data: settings }
      ] = await Promise.all([
          sb.from('classes').select('*'), sb.from('students').select('*'), sb.from('tps').select('*'),
          sb.from('assessments').select('*'), sb.from('category_results').select('*'),
          sb.from('p5_criteria').select('*'), sb.from('p5_assessments').select('*'),
          sb.from('reflections').select('*'), sb.from('notes').select('*'),
          sb.from('attendance').select('*'), sb.from('settings').select('*').limit(1).maybeSingle()
      ]);

      return {
          classes: mapKeys(classes || [], toCamelCase),
          students: mapKeys(students || [], toCamelCase),
          tps: mapKeys(tps || [], toCamelCase),
          assessments: mapKeys(assessments || [], toCamelCase),
          categoryResults: mapKeys(categoryResults || [], toCamelCase),
          p5Criteria: mapKeys(p5Criteria || [], toCamelCase),
          p5Assessments: mapKeys(p5Assessments || [], toCamelCase),
          reflections: mapKeys(reflections || [], toCamelCase),
          notes: mapKeys(notes || [], toCamelCase),
          attendance: mapKeys(attendance || [], toCamelCase),
          settings: settings ? mapKeys(settings, toCamelCase) : undefined 
      } as AppState;

    } catch (error) {
      console.error("Supabase Fetch Error:", error);
      return null;
    }
  },

  // --- CRUD DISPATCHER ---
  async create(collection: ApiPayload['collection'], data: any) {
    return this.supabaseOp('insert', collection, data);
  },

  async update(collection: ApiPayload['collection'], data: any) {
    return this.supabaseOp('update', collection, data);
  },

  async delete(collection: ApiPayload['collection'], id: string) {
    return this.supabaseOp('delete', collection, { id });
  },
  
  async saveSettings(data: any) {
    // Settings is a single row, ensure ID exists or upsert
    const payload = { ...data, id: 'global_settings' };
    return this.supabaseOp('upsert', 'settings', payload);
  },

  // --- SUPABASE OPERATIONS ---
  async supabaseOp(op: 'insert'|'update'|'delete'|'upsert', collection: string, data: any): Promise<ApiResponse> {
    const sb = initSupabase();
    if (!sb) return { status: 'error', message: 'Supabase client not initialized' };

    // Convert Collection Name to Table Name (camelCase -> snake_case)
    let tableName = toSnakeCase(collection);

    // FIX: Manual override for TPs because toSnakeCase converts "TPs" incorrectly to "_t_ps"
    if (collection === 'TPs') {
        tableName = 'tps';
    }
    
    // Convert Data Keys to snake_case
    const dbData = op === 'delete' ? null : mapKeys(data, toSnakeCase);

    try {
        let query = sb.from(tableName);
        let error = null;

        if (op === 'insert') {
            const { error: e } = await query.insert(dbData);
            error = e;
        } else if (op === 'update') {
            const { error: e } = await query.update(dbData).eq('id', data.id);
            error = e;
        } else if (op === 'upsert') {
            const { error: e } = await query.upsert(dbData);
            error = e;
        } else if (op === 'delete') {
            const { error: e } = await query.delete().eq('id', data.id);
            error = e;
        }

        if (error) throw error;
        return { status: 'success' };
    } catch (e: any) {
        console.error("Supabase Operation Error:", e);
        return { status: 'error', message: e.message || "Database Error" };
    }
  }
};