import fs from 'fs';
import path from 'path';
import { environment } from '../config/test-config';
import testEnvironment from '../setup/test-environment';

// Cleanup class
class TestCleanup {
  private supabase;
  private outputDir: string;
  
  constructor() {
    this.supabase = testEnvironment.getSupabaseClient();
    this.outputDir = path.join(process.cwd(), 'test-results');
  }
  
  // Clean up test data from Supabase
  public async cleanupTestData(): Promise<void> {
    console.log('Cleaning up test data...');
    
    try {
      // Delete test projections
      await this.supabase
        .from('projections')
        .delete()
        .match({ test: true });
      
      // Delete test games
      await this.supabase
        .from('games')
        .delete()
        .match({ test: true });
      
      // Delete test players
      await this.supabase
        .from('players')
        .delete()
        .match({ test: true });
      
      // Delete test user preferences
      await this.supabase
        .from('user_preferences')
        .delete()
        .match({ test: true });
      
      // Delete test reports older than 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      await this.supabase
        .from('test_reports')
        .delete()
        .lt('created_at', sevenDaysAgo.toISOString());
      
      console.log('Test data cleanup completed');
    } catch (error) {
      console.error('Error cleaning up test data:', error);
      throw error;
    }
  }
  
  // Clean up test files
  public cleanupTestFiles(): void {
    console.log('Cleaning up test files...');
    
    try {
      // Clean up authentication state
      const authFile = path.join(process.cwd(), 'auth.json');
      if (fs.existsSync(authFile)) {
        fs.unlinkSync(authFile);
      }
      
      // Clean up test results
      if (fs.existsSync(this.outputDir)) {
        // Clean up old reports (keep last 5)
        const reports = fs.readdirSync(this.outputDir)
          .filter(file => file.startsWith('report-'))
          .sort()
          .reverse();
        
        if (reports.length > 5) {
          reports.slice(5).forEach(report => {
            fs.unlinkSync(path.join(this.outputDir, report));
          });
        }
        
        // Clean up screenshots
        const screenshotsDir = path.join(this.outputDir, 'screenshots');
        if (fs.existsSync(screenshotsDir)) {
          fs.readdirSync(screenshotsDir).forEach(file => {
            fs.unlinkSync(path.join(screenshotsDir, file));
          });
        }
        
        // Clean up videos
        const videosDir = path.join(this.outputDir, 'videos');
        if (fs.existsSync(videosDir)) {
          fs.readdirSync(videosDir).forEach(file => {
            fs.unlinkSync(path.join(videosDir, file));
          });
        }
        
        // Clean up traces
        const tracesDir = path.join(this.outputDir, 'traces');
        if (fs.existsSync(tracesDir)) {
          fs.readdirSync(tracesDir).forEach(file => {
            fs.unlinkSync(path.join(tracesDir, file));
          });
        }
      }
      
      console.log('Test files cleanup completed');
    } catch (error) {
      console.error('Error cleaning up test files:', error);
      throw error;
    }
  }
  
  // Clean up test environment
  public async cleanupEnvironment(): Promise<void> {
    console.log('Cleaning up test environment...');
    
    try {
      // Reset environment variables
      process.env.CI = undefined;
      process.env.DEBUG = undefined;
      
      // Close Supabase connection
      await this.supabase.auth.signOut();
      
      console.log('Test environment cleanup completed');
    } catch (error) {
      console.error('Error cleaning up test environment:', error);
      throw error;
    }
  }
  
  // Archive test results
  public archiveTestResults(): void {
    console.log('Archiving test results...');
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const archiveDir = path.join(process.cwd(), 'test-archives', timestamp);
      
      // Create archive directory
      fs.mkdirSync(archiveDir, { recursive: true });
      
      // Copy test results to archive
      if (fs.existsSync(this.outputDir)) {
        fs.readdirSync(this.outputDir).forEach(file => {
          const sourcePath = path.join(this.outputDir, file);
          const targetPath = path.join(archiveDir, file);
          
          if (fs.statSync(sourcePath).isDirectory()) {
            fs.cpSync(sourcePath, targetPath, { recursive: true });
          } else {
            fs.copyFileSync(sourcePath, targetPath);
          }
        });
      }
      
      console.log(`Test results archived to ${archiveDir}`);
    } catch (error) {
      console.error('Error archiving test results:', error);
      throw error;
    }
  }
  
  // Run all cleanup tasks
  public async cleanup(options = { archive: true }): Promise<void> {
    try {
      // Archive results if requested
      if (options.archive) {
        this.archiveTestResults();
      }
      
      // Run cleanup tasks
      await this.cleanupTestData();
      this.cleanupTestFiles();
      await this.cleanupEnvironment();
      
      console.log('All cleanup tasks completed successfully');
    } catch (error) {
      console.error('Error during cleanup:', error);
      throw error;
    }
  }
}

// Create cleanup instance
const cleanup = new TestCleanup();

// Export cleanup instance
export default cleanup;

// Export cleanup functions
export const {
  cleanupTestData,
  cleanupTestFiles,
  cleanupEnvironment,
  archiveTestResults,
  cleanup: runCleanup
} = cleanup; 