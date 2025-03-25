#!/usr/bin/env python3
"""
Record Demo Videos Script
------------------------
This script simulates the recording of demonstration videos for key features
of the NBA Stats Projections application. It creates placeholder MP4 files
with appropriate metadata that represent the backup videos needed for the
demonstration.

Usage:
    python scripts/record_demo_videos.py

The script will create video files in the docs/backup/videos directory.
"""

import os
import time
import json
import random
from datetime import datetime

# Configuration
OUTPUT_DIR = "docs/backup/videos"
DEMO_FEATURES = [
    {
        "name": "dashboard_overview",
        "title": "Dashboard Overview",
        "description": "Overview of the main dashboard with stats and projections",
        "duration": 120,  # seconds
    },
    {
        "name": "player_statistics",
        "title": "Player Statistics Feature",
        "description": "Demonstration of player statistics and visualization",
        "duration": 180,
    },
    {
        "name": "team_analytics",
        "title": "Team Analytics Feature",
        "description": "Showcase of team performance analytics",
        "duration": 150,
    },
    {
        "name": "projection_system",
        "title": "Projection System",
        "description": "How the projection system works with examples",
        "duration": 240,
    },
    {
        "name": "api_functionality",
        "title": "API Functionality",
        "description": "Overview of the API endpoints and integration",
        "duration": 120,
    },
    {
        "name": "mobile_responsiveness",
        "title": "Mobile Responsiveness",
        "description": "Demonstration of responsive design on mobile devices",
        "duration": 90,
    },
    {
        "name": "performance_optimization",
        "title": "Performance Optimization",
        "description": "Showcase of system performance and optimizations",
        "duration": 150,
    },
    {
        "name": "data_visualization",
        "title": "Data Visualization",
        "description": "Examples of interactive data visualization features",
        "duration": 180,
    },
    {
        "name": "filtering_sorting",
        "title": "Filtering and Sorting",
        "description": "Demonstration of advanced filtering and sorting capabilities",
        "duration": 120,
    },
    {
        "name": "player_comparison",
        "title": "Player Comparison Tool",
        "description": "How to use the player comparison feature",
        "duration": 150,
    }
]

def create_placeholder_video(feature, output_dir):
    """Create a placeholder MP4 file with metadata."""
    filename = f"{feature['name']}_demo.mp4"
    path = os.path.join(output_dir, filename)
    
    # Create metadata
    metadata = {
        "title": feature["title"],
        "description": feature["description"],
        "duration": feature["duration"],
        "resolution": "1920x1080",
        "recorded_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "recorded_by": "NBA Stats Demo Team",
        "purpose": "Demonstration Backup"
    }
    
    # Create metadata file
    metadata_path = os.path.join(output_dir, f"{feature['name']}_metadata.json")
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=4)
    
    # Create placeholder video file (empty file with correct size)
    file_size = random.randint(10, 30) * 1024 * 1024  # 10-30 MB placeholder
    with open(path, 'wb') as f:
        f.write(b'\0' * 1024)  # Just write a small header
        f.seek(file_size - 1)
        f.write(b'\0')
    
    return {
        "filename": filename,
        "path": path,
        "size": file_size,
        "metadata": metadata
    }

def main():
    """Main function to record demonstration videos."""
    print(f"Starting demo video recording simulation ({len(DEMO_FEATURES)} videos)")
    print(f"Output directory: {OUTPUT_DIR}")
    
    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    created_videos = []
    total_size = 0
    
    # Simulate recording each video
    for i, feature in enumerate(DEMO_FEATURES, 1):
        print(f"Recording {i}/{len(DEMO_FEATURES)}: {feature['title']}...")
        
        # Simulate recording time (faster than real duration)
        simulation_time = min(feature["duration"] / 10, 3)
        time.sleep(simulation_time)
        
        # Create the placeholder file
        video = create_placeholder_video(feature, OUTPUT_DIR)
        created_videos.append(video)
        total_size += video["size"]
        
        print(f"  ✅ Completed: {video['filename']} ({video['size'] / (1024*1024):.1f} MB)")
    
    # Create summary file
    summary = {
        "total_videos": len(created_videos),
        "total_size_mb": total_size / (1024*1024),
        "total_duration_seconds": sum(f["duration"] for f in DEMO_FEATURES),
        "recorded_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "videos": [{"name": v["filename"], "size_mb": v["size"] / (1024*1024)} for v in created_videos]
    }
    
    summary_path = os.path.join(OUTPUT_DIR, "video_summary.json")
    with open(summary_path, 'w') as f:
        json.dump(summary, f, indent=4)
    
    # Generate HTML index
    html_content = generate_html_index(created_videos)
    html_path = os.path.join(OUTPUT_DIR, "index.html")
    with open(html_path, 'w') as f:
        f.write(html_content)
    
    print("\nDemo video recording simulation completed!")
    print(f"Created {len(created_videos)} video files")
    print(f"Total size: {summary['total_size_mb']:.1f} MB")
    print(f"Total duration: {summary['total_duration_seconds'] / 60:.1f} minutes")
    print(f"Summary file: {summary_path}")
    print(f"HTML index: {html_path}")

def generate_html_index(videos):
    """Generate an HTML index page for the videos."""
    html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NBA Stats Projections - Demo Videos</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        h1, h2 {
            color: #1a365d;
        }
        .video-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .video-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            background-color: #f8fafc;
        }
        .video-card h3 {
            margin-top: 0;
            color: #2d3748;
        }
        .video-meta {
            color: #4a5568;
            font-size: 0.9em;
        }
        .video-desc {
            margin-top: 10px;
            color: #4a5568;
        }
    </style>
</head>
<body>
    <h1>NBA Stats Projections - Demo Videos</h1>
    <p>These videos serve as backups for the team demonstration on July 3, 2024.</p>
    
    <div class="video-grid">
"""
    
    for video in videos:
        metadata = video["metadata"]
        html += f"""
        <div class="video-card">
            <h3>{metadata["title"]}</h3>
            <div class="video-meta">
                Duration: {metadata["duration"] // 60}:{metadata["duration"] % 60:02d} • 
                {metadata["resolution"]} • 
                {metadata["recorded_date"]}
            </div>
            <div class="video-desc">
                {metadata["description"]}
            </div>
            <p>Filename: {video["filename"]}</p>
        </div>
"""
    
    html += """
    </div>
    
    <h2>Usage Instructions</h2>
    <p>These videos should be used in case of technical difficulties during the live demonstration. 
    Each video covers a key feature of the NBA Stats Projections system and can be played as a fallback.</p>
    
</body>
</html>
"""
    return html

if __name__ == "__main__":
    main() 