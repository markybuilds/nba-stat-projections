import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// This is a template component for the knowledge transfer exercises
// You can use this as a starting point for your component development

interface ExerciseTemplateProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function ExerciseTemplate({
  title,
  description,
  children
}: ExerciseTemplateProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children || (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <p className="text-muted-foreground">Exercise content goes here...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Example usage:
// <ExerciseTemplate 
//   title="Player Statistics" 
//   description="Display player statistics in a customizable chart"
// >
//   <div>Your custom component implementation goes here</div>
// </ExerciseTemplate> 