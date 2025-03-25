import React from "react";
import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPage() {
  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Introduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              At NBA Stat Projections, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
            <p>
              Please read this Privacy Policy carefully. By accessing or using our service, you acknowledge that you have read, understood, and agree to be bound by all the terms outlined in this policy.
            </p>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Personal Information</h3>
              <p>
                We may collect personal information that you voluntarily provide when using our service, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Email address (if you subscribe to our newsletter)</li>
                <li>Name (if you create an account)</li>
                <li>Usage data and preferences</li>
              </ul>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Usage Data</h3>
              <p>
                We automatically collect certain information when you visit, use or navigate our website. This information may include:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent</li>
                <li>Device information</li>
                <li>Referring website or source</li>
              </ul>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Cookies and Tracking Technologies</h3>
              <p>
                We use cookies and similar tracking technologies to collect and track information about your browsing activities on our website. These technologies help us analyze website traffic, customize content, and improve user experience.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>We use the information we collect for various purposes, including to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide, operate, and maintain our website</li>
              <li>Improve, personalize, and expand our website</li>
              <li>Understand and analyze how you use our website</li>
              <li>Develop new products, services, features, and functionality</li>
              <li>Communicate with you about updates, security alerts, and support</li>
              <li>Send you marketing and promotional communications (with your consent)</li>
              <li>Find and prevent fraud</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Data Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              If you have questions or concerns about this Privacy Policy, please contact us at privacy@nbastatprojections.com.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 