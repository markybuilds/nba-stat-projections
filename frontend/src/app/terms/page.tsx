import React from "react";
import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsPage() {
  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Introduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Welcome to NBA Stat Projections. By accessing our website and using our services, you agree to be bound by these Terms of Service.
            </p>
            <p>
              Please read these Terms carefully before using our service. If you do not agree to all the terms and conditions, you should not use our services.
            </p>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Account Registration</h3>
              <p>
                To access certain features of our service, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Acceptable Use</h3>
              <p>
                You agree not to use the service for any purpose that is unlawful or prohibited by these Terms. You may not use the service in any manner that could damage, disable, overburden, or impair the service or interfere with any other party's use of the service.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Our website and its original content, features, and functionality are owned by NBA Stat Projections and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
            </p>
            <p>
              NBA team names, logos, and related data are the property of their respective owners and are used for informational purposes only. NBA Stat Projections is not affiliated with the National Basketball Association (NBA) or any of its teams.
            </p>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Disclaimers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Accuracy of Information</h3>
              <p>
                The projections and statistics provided on our website are for informational purposes only. While we strive to provide accurate projections based on historical data and analytical models, we make no guarantees regarding the accuracy, completeness, or reliability of any projections or information on our website.
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Gambling Advisory</h3>
              <p>
                NBA Stat Projections does not encourage or promote gambling. The information provided should not be used as the sole basis for gambling decisions. Users are responsible for complying with all applicable laws regarding sports betting in their jurisdiction.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              In no event shall NBA Stat Projections, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              If you have any questions about these Terms, please contact us at terms@nbastatprojections.com.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 