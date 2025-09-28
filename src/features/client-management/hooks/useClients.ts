import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ClientService } from '../services/clientService';
import { Client, ClientFilters } from '../types';

export function useClients(filters?: ClientFilters) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { appUser } = useAuth();

  useEffect(() => {
    if (!appUser?.tenantId) return;

    const fetchClients = async () => {
      try {
        setLoading(true);
        setError(null);

        const clientService = ClientService.getInstance();
        const fetchedClients = await clientService.getClients(appUser.tenantId!, filters);

        setClients(fetchedClients);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError('Failed to fetch clients');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [appUser?.tenantId, filters]);

  return { clients, loading, error, refetch: () => { } };
}

export function useClient(clientId: string) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { appUser } = useAuth();

  useEffect(() => {
    if (!appUser?.tenantId || !clientId) return;

    const fetchClient = async () => {
      try {
        setLoading(true);
        setError(null);

        const clientService = ClientService.getInstance();
        const fetchedClient = await clientService.getClient(appUser.tenantId!, clientId);

        setClient(fetchedClient);
      } catch (err) {
        console.error('Error fetching client:', err);
        setError('Failed to fetch client');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [appUser?.tenantId, clientId]);

  return { client, loading, error };
}

export function useClientStats() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
    topTags: [] as Array<{ tag: string; count: number }>
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { appUser } = useAuth();

  useEffect(() => {
    if (!appUser?.tenantId) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const clientService = ClientService.getInstance();
        const fetchedStats = await clientService.getClientStats(appUser.tenantId!);

        setStats(fetchedStats);
      } catch (err) {
        console.error('Error fetching client stats:', err);
        setError('Failed to fetch client stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [appUser?.tenantId]);

  return { stats, loading, error };
}