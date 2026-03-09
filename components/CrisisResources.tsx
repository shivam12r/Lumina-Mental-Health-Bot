import React from 'react';
import { Phone, ExternalLink, AlertTriangle } from 'lucide-react';
import { CRISIS_RESOURCES } from '../types';

const CrisisResources: React.FC = () => {
  return (
    <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mt-6">
      <div className="flex items-center gap-2 mb-3 text-rose-700">
        <AlertTriangle size={20} />
        <h3 className="font-semibold">Important Support Resources</h3>
      </div>
      <p className="text-sm text-rose-600 mb-4">
        If you or someone you know is in immediate danger, please call emergency services (911 in the US) or go to the nearest emergency room.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {CRISIS_RESOURCES.map((resource) => (
          <div key={resource.name} className="bg-white p-3 rounded-lg border border-rose-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="font-medium text-slate-800">{resource.name}</div>
            <div className="text-xs text-slate-500 mb-2">{resource.description}</div>
            <div className="flex gap-2">
              {resource.phone && (
                <a href={`tel:${resource.phone.replace(/[^0-9]/g, '')}`} className="flex items-center gap-1.5 text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1.5 rounded hover:bg-rose-100 transition-colors">
                  <Phone size={12} />
                  {resource.phone}
                </a>
              )}
              {resource.url && (
                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1.5 rounded hover:bg-indigo-100 transition-colors">
                  <ExternalLink size={12} />
                  Website
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CrisisResources;