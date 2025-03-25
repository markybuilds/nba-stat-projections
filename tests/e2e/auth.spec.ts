import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should allow user to sign in', async ({ page }) => {
    // Click the sign in button
    await page.click('text=Sign In');
    
    // Fill in credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Verify successful login
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Sign Out')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.click('text=Sign In');
    
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    // Verify error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should allow user to sign up', async ({ page }) => {
    const testEmail = `test${Date.now()}@example.com`;
    
    await page.click('text=Sign Up');
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', 'newpassword123');
    await page.fill('input[name="confirmPassword"]', 'newpassword123');
    
    await page.click('button[type="submit"]');
    
    // Verify successful registration
    await expect(page.locator('text=Verification email sent')).toBeVisible();
  });

  test('should allow password reset request', async ({ page }) => {
    await page.click('text=Sign In');
    await page.click('text=Forgot password?');
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    
    // Verify reset email sent message
    await expect(page.locator('text=Password reset email sent')).toBeVisible();
  });

  test('should handle social login redirects', async ({ page }) => {
    await page.click('text=Sign In');
    
    // Click Google login button and verify redirect
    const googleLoginPromise = page.waitForNavigation();
    await page.click('button:has-text("Continue with Google")');
    await googleLoginPromise;
    
    // Verify we're on Google's domain
    expect(page.url()).toContain('accounts.google.com');
  });

  test('should allow user to sign out', async ({ page }) => {
    // First sign in
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    // Sign out
    await page.click('text=Sign Out');
    
    // Verify we're logged out
    await expect(page.locator('text=Sign In')).toBeVisible();
    await expect(page.locator('text=Dashboard')).not.toBeVisible();
  });
});

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated user from protected pages', async ({ page }) => {
    // Try to access dashboard directly
    await page.goto('/dashboard');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*login/);
  });

  test('should maintain authentication state across navigation', async ({ page }) => {
    // Sign in first
    await page.goto('/');
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    // Navigate to different protected routes
    await page.click('text=Players');
    await expect(page).toHaveURL(/.*players/);
    
    await page.click('text=Games');
    await expect(page).toHaveURL(/.*games/);
    
    // Should still be authenticated
    await expect(page.locator('text=Sign Out')).toBeVisible();
  });
}); 