/**
 * NBA Stat Projections PWA Test Script
 * 
 * This script helps test various aspects of the PWA functionality including:
 * - Service worker registration
 * - Caching strategies
 * - Offline functionality
 * - Network status detection
 * 
 * Usage: 
 * 1. Run from browser console while the app is open
 * 2. Use the exported functions to test specific functionality
 */

const PWATest = (function() {
  // Private variables
  let _swRegistration = null;
  let _networkTestResults = [];
  let _cacheTestResults = [];
  
  // Get service worker registration
  const getRegistration = async () => {
    if ('serviceWorker' in navigator) {
      try {
        _swRegistration = await navigator.serviceWorker.getRegistration();
        return _swRegistration;
      } catch (error) {
        console.error('Error getting service worker registration:', error);
        return null;
      }
    } else {
      console.warn('Service Worker API not available in this browser');
      return null;
    }
  };
  
  // Check service worker status
  const checkServiceWorkerStatus = async () => {
    const registration = await getRegistration();
    if (!registration) {
      return { registered: false, status: 'No service worker registered' };
    }
    
    const swState = {
      registered: true,
      scope: registration.scope,
      active: !!registration.active,
      installing: !!registration.installing,
      waiting: !!registration.waiting,
      updateAvailable: !!registration.waiting,
      controller: !!navigator.serviceWorker.controller,
    };
    
    if (registration.active) {
      swState.activeState = registration.active.state;
    }
    
    return swState;
  };
  
  // List all caches and their contents
  const inspectCaches = async () => {
    if (!('caches' in window)) {
      return { available: false, message: 'Cache API not available in this browser' };
    }
    
    try {
      const cacheNames = await caches.keys();
      const cacheDetails = {};
      
      for (const name of cacheNames) {
        const cache = await caches.open(name);
        const requests = await cache.keys();
        const urls = requests.map(req => req.url);
        
        cacheDetails[name] = {
          count: urls.length,
          urls: urls
        };
      }
      
      return { available: true, caches: cacheDetails };
    } catch (error) {
      console.error('Error inspecting caches:', error);
      return { available: true, error: error.message };
    }
  };
  
  // Test fetch under offline conditions
  const testOfflineFetch = async (url) => {
    if (!url) {
      url = window.location.href;
    }
    
    const result = {
      url,
      cached: false,
      fetchedOffline: false,
      error: null
    };
    
    try {
      // First check if URL is in cache
      const cacheResponse = await caches.match(url);
      result.cached = !!cacheResponse;
      
      // Now simulate offline and try to fetch
      const originalFetch = window.fetch;
      window.fetch = () => Promise.reject(new Error('Simulated offline mode'));
      
      try {
        const response = await fetch(url);
        result.fetchedOffline = response.ok;
      } catch (fetchError) {
        result.error = fetchError.message;
      } finally {
        window.fetch = originalFetch;
      }
      
      return result;
    } catch (error) {
      console.error('Error testing offline fetch:', error);
      window.fetch = window.originalFetch;
      return { ...result, error: error.message };
    }
  };
  
  // Test network status detector
  const testNetworkStatus = () => {
    const result = {
      navigatorOnline: navigator.onLine,
      offlineEventWorks: false,
      onlineEventWorks: false
    };
    
    return new Promise((resolve) => {
      const offlineHandler = () => {
        result.offlineEventWorks = true;
        checkCompletion();
      };
      
      const onlineHandler = () => {
        result.onlineEventWorks = true;
        checkCompletion();
      };
      
      // Add event listeners
      window.addEventListener('offline', offlineHandler);
      window.addEventListener('online', onlineHandler);
      
      // Set a timeout for the test
      const timeout = setTimeout(() => {
        window.removeEventListener('offline', offlineHandler);
        window.removeEventListener('online', onlineHandler);
        
        console.log('To properly test network events, toggle your device\'s ' +
                    'internet connection or use DevTools to simulate offline mode.');
        resolve(result);
      }, 5000);
      
      // Check if both events have fired
      const checkCompletion = () => {
        if (result.offlineEventWorks && result.onlineEventWorks) {
          clearTimeout(timeout);
          window.removeEventListener('offline', offlineHandler);
          window.removeEventListener('online', onlineHandler);
          resolve(result);
        }
      };
      
      // Inform the user to toggle network
      console.log('Please toggle your network connection off and back on within 5 seconds ' +
                  'or use DevTools to simulate offline and online states.');
    });
  };
  
  // Test if install prompt works
  const checkInstallPrompt = () => {
    const result = {
      canPrompt: false,
      promptEventAttached: false,
      promptEventFired: !!window.deferredPrompt,
    };
    
    // Check if the beforeinstallprompt event listener is attached
    const installedProp = Object.getOwnPropertyDescriptor(window, 'onbeforeinstallprompt');
    result.promptEventAttached = installedProp !== undefined && installedProp.configurable;
    
    return result;
  };
  
  // Run a complete PWA test suite
  const runFullTest = async () => {
    console.log('🧪 Running NBA Stat Projections PWA Test Suite');
    console.log('=============================================');
    
    // Test service worker
    console.log('1. Testing Service Worker...');
    const swStatus = await checkServiceWorkerStatus();
    console.log(swStatus.registered ? 
      '✅ Service Worker registered with scope: ' + swStatus.scope :
      '❌ Service Worker not registered');
    if (swStatus.updateAvailable) {
      console.log('⚠️ Update available! Waiting service worker detected.');
    }
    console.log('');
    
    // Test caches
    console.log('2. Testing Cache Storage...');
    const cacheInfo = await inspectCaches();
    if (cacheInfo.available) {
      const cacheNames = Object.keys(cacheInfo.caches || {});
      console.log(`✅ Cache API available. Found ${cacheNames.length} caches.`);
      cacheNames.forEach(name => {
        const cache = cacheInfo.caches[name];
        console.log(`   - ${name}: ${cache.count} entries`);
      });
    } else {
      console.log('❌ Cache API not available in this browser');
    }
    console.log('');
    
    // Test offline capability
    console.log('3. Testing Offline Capability...');
    const offlineHome = await testOfflineFetch(window.location.origin + '/');
    console.log(offlineHome.cached ? '✅ Home page is cached' : '❌ Home page not cached');
    console.log(offlineHome.fetchedOffline ? 
      '✅ Can access home page offline' : 
      '❌ Cannot access home page offline');
    
    const offlineApi = await testOfflineFetch(window.location.origin + '/api/players');
    console.log(offlineApi.cached ? '✅ API route is cached' : '❌ API route not cached');
    console.log('');
    
    // Test network detection
    console.log('4. Testing Network Status Detection...');
    console.log(`   Current network status (navigator.onLine): ${navigator.onLine ? 'Online' : 'Offline'}`);
    console.log('   To fully test this feature, toggle your network connection...');
    console.log('');
    
    // Test installation
    console.log('5. Testing Installation Capability...');
    const installStatus = checkInstallPrompt();
    console.log(installStatus.promptEventFired ? 
      '✅ Install prompt has fired and is available' : 
      '⚠️ Install prompt has not fired (this is normal if the app is already installed or recently dismissed)');
    console.log('');
    
    console.log('Test Summary:');
    console.log('------------');
    console.log(`Service Worker: ${swStatus.registered ? '✅' : '❌'}`);
    console.log(`Cache Storage: ${cacheInfo.available ? '✅' : '❌'}`);
    console.log(`Offline Home: ${offlineHome.cached && offlineHome.fetchedOffline ? '✅' : '❌'}`);
    console.log(`Network Detection: ${navigator.onLine !== undefined ? '✅' : '❌'}`);
    
    return {
      serviceWorker: swStatus,
      caches: cacheInfo,
      offlineCapability: { home: offlineHome, api: offlineApi },
      networkStatus: { online: navigator.onLine },
      installPrompt: installStatus
    };
  };
  
  // Manually trigger a service worker update check
  const checkForUpdates = async () => {
    const registration = await getRegistration();
    if (!registration) {
      return { success: false, message: 'No service worker registered' };
    }
    
    try {
      await registration.update();
      return { 
        success: true, 
        message: 'Update check completed',
        waiting: !!registration.waiting
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // Public API
  return {
    checkServiceWorker: checkServiceWorkerStatus,
    inspectCaches,
    testOfflineFetch,
    testNetworkStatus,
    checkInstallPrompt,
    checkForUpdates,
    runFullTest
  };
})();

// Make the test suite available in the global scope
window.PWATest = PWATest;

// Auto-run the test if this script is directly included
if (typeof document !== 'undefined' && document.currentScript?.getAttribute('data-auto-run') === 'true') {
  PWATest.runFullTest().then(results => {
    console.log('Detailed test results:', results);
  });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PWATest;
} 