'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoadingComplete'> {
  lowQualityPlaceholder?: string;
  transitionDuration?: number;
}

export function OptimizedImage({
  src,
  alt,
  className,
  lowQualityPlaceholder,
  transitionDuration = 500,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    // Set up intersection observer for viewport detection
    if (!priority) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer.disconnect();
            }
          });
        },
        {
          rootMargin: '50px', // Start loading when image is 50px from viewport
        }
      );

      const element = document.querySelector(`[data-image-id="${props.id}"]`);
      if (element) {
        observer.observe(element);
      }

      return () => {
        observer.disconnect();
      };
    }
  }, [priority, props.id]);

  // If priority is true or image is in view, render the actual image
  if (priority || isInView) {
    return (
      <div className="relative overflow-hidden">
        {lowQualityPlaceholder && !isLoaded && (
          <Image
            src={lowQualityPlaceholder}
            alt={alt}
            className={cn(
              'absolute inset-0 blur-lg scale-110',
              className
            )}
            {...props}
          />
        )}
        <Image
          src={src}
          alt={alt}
          className={cn(
            'transition-opacity duration-500',
            !isLoaded && 'opacity-0',
            isLoaded && 'opacity-100',
            className
          )}
          onLoadingComplete={() => setIsLoaded(true)}
          {...props}
        />
      </div>
    );
  }

  // Render placeholder until in view
  return (
    <div
      data-image-id={props.id}
      className={cn(
        'bg-muted animate-pulse rounded-md',
        className
      )}
      style={{
        aspectRatio: props.width && props.height ? `${props.width}/${props.height}` : undefined,
      }}
    />
  );
} 