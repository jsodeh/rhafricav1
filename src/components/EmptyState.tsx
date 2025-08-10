import React from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
  };
  illustration?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  illustration,
  className = ""
}) => {
  return (
    <div className={`text-center py-8 px-4 ${className}`}>
      {illustration ? (
        <img 
          src={illustration} 
          alt={title}
          className="h-32 w-32 mx-auto mb-4 opacity-50"
        />
      ) : (
        <Icon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
        {description}
      </p>
      
      {action && (
        <Button 
          onClick={action.onClick}
          variant={action.variant || 'default'}
          className="mt-2"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;