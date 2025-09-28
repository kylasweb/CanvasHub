import { firestoreService } from '@/lib/firebase';
import { Client, ClientFormData, ClientFilters, ClientStats } from '../types';

export class ClientService {
  private static instance: ClientService;

  static getInstance(): ClientService {
    if (!ClientService.instance) {
      ClientService.instance = new ClientService();
    }
    return ClientService.instance;
  }

  async getClients(tenantId: string, filters?: ClientFilters): Promise<Client[]> {
    try {
      const baseFilters = [{ field: 'tenantId', operator: '==', value: tenantId }];

      if (filters?.search) {
        // This is a simplified search - in a real app, you'd use Firebase's search capabilities
        // or implement a more complex search logic
        baseFilters.push({ field: 'name', operator: '>=', value: filters.search });
      }

      if (filters?.tags && filters.tags.length > 0) {
        // This would need to be implemented with array-contains or similar
        // For now, we'll fetch all and filter on the client side
      }

      const clients = await firestoreService.readAll('clients', baseFilters);

      // Client-side filtering for tags and search
      let filteredClients: Client[] = clients as Client[];

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredClients = filteredClients.filter(client =>
          client.name.toLowerCase().includes(searchLower) ||
          client.email.toLowerCase().includes(searchLower) ||
          client.company?.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.tags && filters.tags.length > 0) {
        filteredClients = filteredClients.filter(client =>
          filters.tags!.some(tag => client.tags.includes(tag))
        );
      }

      return filteredClients as Client[];
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }

  async getClient(tenantId: string, clientId: string): Promise<Client | null> {
    try {
      const client = await firestoreService.read('clients', clientId);
      return client as Client;
    } catch (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
  }

  async createClient(tenantId: string, clientData: ClientFormData): Promise<string> {
    try {
      const client: Omit<Client, 'id'> = {
        tenantId,
        ...clientData,
        createdAt: new Date() as any,
        updatedAt: new Date() as any
      };

      const clientId = await firestoreService.create('clients', client);
      return clientId;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  async updateClient(tenantId: string, clientId: string, clientData: Partial<ClientFormData>): Promise<void> {
    try {
      await firestoreService.update('clients', clientId, {
        ...clientData,
        updatedAt: new Date() as any
      });
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  async deleteClient(tenantId: string, clientId: string): Promise<void> {
    try {
      // In a real app, you might want to soft delete instead of hard delete
      // For now, we'll just remove the document
      // Note: Firestore doesn't have a built-in delete method in our service, so you'd need to add it
      console.log('Deleting client:', clientId);
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }

  async getClientStats(tenantId: string): Promise<ClientStats> {
    try {
      const clients = await this.getClients(tenantId);

      const stats: ClientStats = {
        total: clients.length,
        active: clients.length, // You might want to add an active/inactive status
        newThisMonth: 0, // You'd calculate this based on creation dates
        topTags: []
      };

      // Calculate top tags
      const tagCounts: Record<string, number> = {};
      clients.forEach(client => {
        client.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      stats.topTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return stats;
    } catch (error) {
      console.error('Error fetching client stats:', error);
      throw error;
    }
  }
}