/**
 * Authentication Debug Utilities
 * Use these in browser console to troubleshoot cookie-based auth
 */

import { apiClient } from './client';

export const authDebug = {
  /**
   * Check if cookies are being sent with requests
   */
  async testCookies() {
    console.group('🍪 Cookie Authentication Test');
    
    try {
      // Test if backend receives cookies
      const response = await apiClient.get('/admin/auth/debug');
      console.log('✅ Backend Response:', response.data);
      
      // Check if cookies exist in browser
      const hasCookies = document.cookie.includes('access_token') || 
                        document.cookie.includes('refresh_token');
      
      if (!hasCookies) {
        console.warn('⚠️  No auth cookies found in document.cookie');
        console.log('Note: HttpOnly cookies won\'t appear here, but should still work');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error:', error.message);
      if (error.response) {
        console.error('Response:', error.response.data);
      }
      throw error;
    } finally {
      console.groupEnd();
    }
  },

  /**
   * Check current authentication state
   */
  async checkAuth() {
    console.group('🔐 Authentication Status');
    
    try {
      const response = await apiClient.get('/users/me');
      console.log('✅ Authenticated as:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Not authenticated:', error.message);
      throw error;
    } finally {
      console.groupEnd();
    }
  },

  /**
   * Test token refresh
   */
  async testRefresh() {
    console.group('🔄 Token Refresh Test');
    
    try {
      const response = await apiClient.post('/admin/auth/refresh');
      console.log('✅ Token refreshed successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Refresh failed:', error.message);
      throw error;
    } finally {
      console.groupEnd();
    }
  },

  /**
   * Check API configuration
   */
  checkConfig() {
    console.group('⚙️  API Client Configuration');
    console.log('Base URL:', apiClient.defaults.baseURL);
    console.log('With Credentials:', apiClient.defaults.withCredentials);
    console.log('Timeout:', apiClient.defaults.timeout);
    console.log('Headers:', apiClient.defaults.headers);
    console.groupEnd();
  },

  /**
   * Full diagnostic
   */
  async diagnose() {
    console.group('🔍 Full Authentication Diagnostic');
    
    console.log('1️⃣  Checking configuration...');
    this.checkConfig();
    
    console.log('\n2️⃣  Testing cookie support...');
    try {
      await this.testCookies();
    } catch (error) {
      console.log('Backend debug endpoint not available or auth failed');
    }
    
    console.log('\n3️⃣  Checking authentication...');
    try {
      await this.checkAuth();
    } catch (error) {
      console.log('Not currently authenticated');
    }
    
    console.log('\n4️⃣  Browser Info:');
    console.log('User Agent:', navigator.userAgent);
    console.log('Cookies Enabled:', navigator.cookieEnabled);
    console.log('Current Origin:', window.location.origin);
    
    console.groupEnd();
  }
};

// Make available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).authDebug = authDebug;
}
