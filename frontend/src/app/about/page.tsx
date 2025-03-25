import React from "react";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AboutPage() {
  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">About NBA Stat Projections</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
            <CardDescription>
              Providing accurate NBA player performance projections through data science
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              NBA Stat Projections is a data-driven platform that utilizes advanced analytics and machine learning to predict player performance statistics for upcoming NBA games. Our goal is to provide basketball fans, fantasy sports enthusiasts, and sports bettors with accurate, reliable projections based on historical data and current trends.
            </p>
            <p>
              We believe in the power of data to enhance the basketball viewing experience and help fans make more informed decisions about their fantasy lineups and sports wagering.
            </p>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              The technology behind our projection system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Data Collection</h3>
              <p>
                We gather comprehensive historical NBA data including player statistics, team performance, matchup history, and contextual factors like rest days, travel distance, and injuries.
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Statistical Modeling</h3>
              <p>
                Our projection system employs a combination of statistical techniques:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Machine learning algorithms trained on historical performance</li>
                <li>Time-series analysis to identify trends and patterns</li>
                <li>Bayesian inference for probability estimation</li>
                <li>Ensemble methods to combine multiple prediction models</li>
              </ul>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Contextual Adjustments</h3>
              <p>
                Raw statistical projections are adjusted for:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Matchup-specific factors (opponent defensive strength, pace)</li>
                <li>Game context (home/away, back-to-back games)</li>
                <li>Recent player performance and minutes trends</li>
                <li>Team composition and strategy changes</li>
              </ul>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Confidence Scoring</h3>
              <p>
                Each projection includes a confidence score that indicates our system's certainty in the prediction, based on:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Sample size of relevant historical data</li>
                <li>Consistency of player performance in similar situations</li>
                <li>Stability of player role and team situation</li>
                <li>Model agreement across different prediction approaches</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Our Team</CardTitle>
            <CardDescription>
              The people behind NBA Stat Projections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              NBA Stat Projections was created by a passionate team of basketball fans, data scientists, and software engineers who wanted to bring advanced analytics to basketball enthusiasts everywhere.
            </p>
            <p>
              Our team combines expertise in sports analytics, machine learning, and software development to create a platform that makes sophisticated statistical projections accessible and understandable to all basketball fans.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 