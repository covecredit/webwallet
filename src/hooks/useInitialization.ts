import { useState, useEffect } from 'react';
import { initializationService } from '../services/initialization';
import { NetworkConfig } from '../types/network';

export function useInitialization(network: NetworkConfig, maxRetries = 3) {
  const [state, setState] = useState({
    isLoading: true,
    error: null as string | null,
    status: 'Initializing...',
    retries: 0
  });

  useEffect(() => {
    let mounted = true;

    const handleStatus = (status: string) => {
      if (mounted) {
        setState(prev => ({ ...prev, status }));
      }
    };

    const handleError = (error: Error) => {
      if (mounted) {
        setState(prev => ({
          ...prev,
          error: error.message,
          retries: prev.retries + 1,
          status: prev.retries < maxRetries ? 
            `Retrying initialization (${prev.retries + 1}/${maxRetries})...` :
            'Initialization failed. Please refresh the page.'
        }));
      }
    };

    const handleComplete = () => {
      if (mounted) {
        setState(prev => ({ ...prev, isLoading: false, error: null }));
      }
    };

    initializationService.on('status', handleStatus);
    initializationService.on('error', handleError);
    initializationService.on('complete', handleComplete);

    const initialize = async () => {
      try {
        await initializationService.initialize({
          network,
          maxRetries,
          retryDelay: 2000
        });
      } catch (error) {
        if (state.retries < maxRetries && mounted) {
          setTimeout(() => initialize(), 2000);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
      initializationService.removeAllListeners();
      initializationService.cleanup();
    };
  }, [network, maxRetries]);

  return state;
}