import { Transaction } from 'xrpl';
import { GraphData, GraphNode, GraphLink } from './types';
import { dropsToXrp } from 'xrpl';

export class GraphBuilder {
  private nodes: Map<string, GraphNode>;
  private links: Map<string, GraphLink>;
  private accountBalances: Map<string, string>;

  constructor() {
    this.nodes = new Map();
    this.links = new Map();
    this.accountBalances = new Map();
  }

  addNode(node: GraphNode): void {
    if (!this.nodes.has(node.id)) {
      this.nodes.set(node.id, {
        ...node,
        value: node.type === 'wallet' ? 30 : 20 // Larger nodes for wallets
      });
    }
  }

  addLink(link: GraphLink): void {
    const linkId = `${link.source}-${link.target}`;
    if (!this.links.has(linkId)) {
      // Ensure both nodes exist before adding the link
      if (this.nodes.has(link.source) && this.nodes.has(link.target)) {
        this.links.set(linkId, {
          ...link,
          value: link.data?.amount ? Math.log(Number(link.data.amount)) : 1
        });
      }
    }
  }

  setAccountBalance(address: string, balance: string): void {
    this.accountBalances.set(address, balance);
    // Update node label if it exists
    const node = this.nodes.get(address);
    if (node && node.type === 'wallet') {
      node.label = `Account: ${address}\nBalance: ${balance} XRP`;
    }
  }

  build(): GraphData {
    return {
      nodes: Array.from(this.nodes.values()),
      links: Array.from(this.links.values())
    };
  }

  clear(): void {
    this.nodes.clear();
    this.links.clear();
    this.accountBalances.clear();
  }
}