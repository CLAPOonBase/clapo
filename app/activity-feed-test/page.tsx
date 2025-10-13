'use client';

import React from 'react';
import { ActivityFeed } from '@/app/components/ActivityFeed';

export default function ActivityFeedTestPage() {
  return (
    <div className="min-h-screen bg-dark-900 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Activity Feed Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity (20 items)</h2>
            <ActivityFeed limit={20} />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity (10 items)</h2>
            <ActivityFeed limit={10} />
          </div>
        </div>
      </div>
    </div>
  );
}



