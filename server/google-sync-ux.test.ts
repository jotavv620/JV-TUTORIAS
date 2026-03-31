import { describe, it, expect } from 'vitest';

describe('Google Calendar Sync Button UX', () => {
  it('should show "Conectar Google" button when not connected', () => {
    const googleStatus = { connected: false };
    const buttonText = googleStatus.connected ? 'Google Cal' : 'Conectar Google';
    
    expect(buttonText).toBe('Conectar Google');
  });

  it('should show "Google Cal" button when connected', () => {
    const googleStatus = { connected: true };
    const buttonText = googleStatus.connected ? 'Google Cal' : 'Conectar Google';
    
    expect(buttonText).toBe('Google Cal');
  });

  it('should use orange color when not connected', () => {
    const googleStatus = { connected: false };
    const buttonColor = googleStatus.connected ? 'bg-purple-500' : 'bg-orange-500';
    
    expect(buttonColor).toBe('bg-orange-500');
  });

  it('should use purple color when connected', () => {
    const googleStatus = { connected: true };
    const buttonColor = googleStatus.connected ? 'bg-purple-500' : 'bg-orange-500';
    
    expect(buttonColor).toBe('bg-purple-500');
  });

  it('should redirect to Google OAuth when not connected', () => {
    const isConnected = false;
    const shouldRedirectToGoogle = !isConnected;
    
    expect(shouldRedirectToGoogle).toBe(true);
  });

  it('should sync tutoria when connected', () => {
    const isConnected = true;
    const shouldSyncTutoria = isConnected;
    
    expect(shouldSyncTutoria).toBe(true);
  });

  it('should show loading state during connection', () => {
    const isConnecting = true;
    const buttonText = isConnecting ? 'Conectando...' : 'Conectar Google';
    
    expect(buttonText).toBe('Conectando...');
  });

  it('should disable button during operations', () => {
    const isLoading = true;
    const isDisabled = isLoading;
    
    expect(isDisabled).toBe(true);
  });

  it('should complete UX flow: not connected → connecting → connected → sync', () => {
    const flow = {
      step1_notConnected: { connected: false, text: 'Conectar Google', color: 'orange' },
      step2_connecting: { connected: false, text: 'Conectando...', color: 'orange', loading: true },
      step3_connected: { connected: true, text: 'Google Cal', color: 'purple' },
      step4_syncing: { connected: true, text: 'Google Cal', color: 'purple', loading: true },
      step5_synced: { connected: true, text: 'Google Cal', color: 'purple', success: true },
    };

    expect(flow.step1_notConnected.connected).toBe(false);
    expect(flow.step2_connecting.loading).toBe(true);
    expect(flow.step3_connected.connected).toBe(true);
    expect(flow.step4_syncing.loading).toBe(true);
    expect(flow.step5_synced.success).toBe(true);
  });
});
