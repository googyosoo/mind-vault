import MiniSearch from 'minisearch';
import vaultData from '../vault-data.json';
import { DEMO_PROJECT } from './demo-data';

export interface VaultNode {
  id: string;
  type: 'file' | 'function' | 'class' | 'concept';
  content: string;
  metadata?: any;
}

export interface VaultLink {
  source: string;
  target: string;
  type: 'import' | 'call' | 'mention';
}

export type DatasetMode = 'demo' | 'workspace';

const STORAGE_MODE_KEY = 'mindvault_dataset_mode';

export class VaultEngine {
  private nodes: VaultNode[] = [];
  private links: VaultLink[] = [];
  private searchIndex: MiniSearch;
  private currentMode: DatasetMode = 'demo';
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.searchIndex = new MiniSearch({
      fields: ['id', 'content'],
      storeFields: ['id', 'type', 'metadata']
    });

    const savedMode = (typeof window !== 'undefined' && localStorage.getItem(STORAGE_MODE_KEY)) as DatasetMode | null;
    this.currentMode = savedMode === 'workspace' ? 'workspace' : 'demo';
    this.loadData();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  public getMode(): DatasetMode {
    return this.currentMode;
  }

  public setMode(mode: DatasetMode) {
    this.currentMode = mode;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_MODE_KEY, mode);
    }
    this.loadData();
    this.notify();
  }

  private loadData() {
    this.searchIndex.removeAll();

    if (this.currentMode === 'workspace' && vaultData && vaultData.nodes && vaultData.nodes.length > 0) {
      this.nodes = vaultData.nodes as VaultNode[];
      this.links = (vaultData.links || []) as VaultLink[];
    } else {
      // Default or Demo Mode
      this.nodes = DEMO_PROJECT.nodes;
      this.links = DEMO_PROJECT.links;
    }

    if (this.nodes.length > 0) {
      this.searchIndex.addAll(this.nodes);
    }
  }

  /**
   * Refreshes the ingestion data (in a real app, this would trigger the backend)
   */
  async ingest(projectPath: string = '.') {
    console.log(`Refreshing data for: ${projectPath}...`);
    this.loadData();
    this.notify();
    return { nodeCount: this.nodes.length, linkCount: this.links.length };
  }

  /**
   * Calculates complexity metrics for all nodes based on connectivity and size.
   */
  getComplexityMetrics() {
    const scores = this.nodes.map(node => {
      const degree = this.links.filter(l => l.source === node.id || l.target === node.id).length;
      const size = node.metadata?.size || 1500;
      
      const complexityScore = (degree * 10) + (size / 100);
      
      return {
        id: node.id,
        type: node.type,
        degree,
        size,
        score: Math.round(complexityScore)
      };
    });

    return scores.sort((a, b) => b.score - a.score);
  }

  /**
   * Generates a condensed overview of the codebase for AI context.
   */
  getSystemContext(): string {
    const fileList = this.nodes
      .filter(n => n.type === 'file')
      .slice(0, 20)
      .map(n => `- ${n.id}`)
      .join('\n');
      
    const entitySummary = this.nodes
      .filter(n => n.type !== 'file')
      .slice(0, 30)
      .map(n => `- [${n.type.toUpperCase()}] ${n.id}`)
      .join('\n');

    return `
      Project Mode: ${this.currentMode.toUpperCase()}
      Project Structure:
      ${fileList}

      Key Entities:
      ${entitySummary}
    `;
  }

  /**
   * Retrieves the full content of a specific node.
   */
  getNodeContent(id: string): string | null {
    const node = this.nodes.find(n => n.id === id);
    if (!node) return null;
    if (node.content && node.content.trim().length > 0) {
      return node.content;
    }
    // Fallback template for empty content nodes in workspace
    return `// Source file: ${node.id}
// Type: ${node.type}
// Metadata: ${JSON.stringify(node.metadata || {}, null, 2)}
export const ${node.id.replace(/[^a-zA-Z0-9]/g, '_')} = () => {
  // MindVault index entry
};`;
  }

  search(query: string) {
    if (!query.trim()) return [];
    return this.searchIndex.search(query);
  }

  getGraphData() {
    return {
      nodes: this.nodes.map(n => ({
        ...n,
        group: n.id.endsWith('.tsx') ? 1 : n.id.endsWith('.ts') ? 2 : n.id.endsWith('.css') ? 3 : 4,
        val: n.metadata?.size ? Math.max(8, Math.min(24, Math.round(n.metadata.size / 300))) : 12
      })),
      links: this.links
    };
  }
}

export const vault = new VaultEngine();
