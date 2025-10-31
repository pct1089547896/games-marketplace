import React from 'react';
import { Monitor, Cpu, HardDrive, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SystemRequirementsProps {
  osRequirements?: string;
  ramRequirements?: string;
  storageRequirements?: string;
  processorRequirements?: string;
  graphicsRequirements?: string;
}

export const SystemRequirements: React.FC<SystemRequirementsProps> = ({
  osRequirements,
  ramRequirements,
  storageRequirements,
  processorRequirements,
  graphicsRequirements
}) => {
  const { t } = useTranslation();

  const hasAnyRequirements = osRequirements || ramRequirements || storageRequirements || 
                             processorRequirements || graphicsRequirements;

  if (!hasAnyRequirements) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Monitor size={24} />
        System Requirements
      </h3>
      
      <div className="space-y-3">
        {osRequirements && (
          <div className="flex items-start gap-3">
            <Monitor size={20} className="text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <div className="font-semibold text-sm text-gray-600 mb-1">Operating System</div>
              <div className="text-gray-800">{osRequirements}</div>
            </div>
          </div>
        )}

        {processorRequirements && (
          <div className="flex items-start gap-3">
            <Cpu size={20} className="text-purple-600 mt-1 flex-shrink-0" />
            <div>
              <div className="font-semibold text-sm text-gray-600 mb-1">Processor</div>
              <div className="text-gray-800">{processorRequirements}</div>
            </div>
          </div>
        )}

        {ramRequirements && (
          <div className="flex items-start gap-3">
            <Zap size={20} className="text-yellow-600 mt-1 flex-shrink-0" />
            <div>
              <div className="font-semibold text-sm text-gray-600 mb-1">Memory (RAM)</div>
              <div className="text-gray-800">{ramRequirements}</div>
            </div>
          </div>
        )}

        {storageRequirements && (
          <div className="flex items-start gap-3">
            <HardDrive size={20} className="text-green-600 mt-1 flex-shrink-0" />
            <div>
              <div className="font-semibold text-sm text-gray-600 mb-1">Storage</div>
              <div className="text-gray-800">{storageRequirements}</div>
            </div>
          </div>
        )}

        {graphicsRequirements && (
          <div className="flex items-start gap-3">
            <Monitor size={20} className="text-red-600 mt-1 flex-shrink-0" />
            <div>
              <div className="font-semibold text-sm text-gray-600 mb-1">Graphics</div>
              <div className="text-gray-800">{graphicsRequirements}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
