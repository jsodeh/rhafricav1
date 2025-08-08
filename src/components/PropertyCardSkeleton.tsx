import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const PropertyCardSkeleton = () => {
  return (
    <Card className="card-modern flex flex-col h-full">
      {/* Image Skeleton */}
      <div className="relative overflow-hidden rounded-t-lg">
        <div className="aspect-[16/9] w-full">
          <Skeleton className="absolute inset-0 w-full h-full" />
        </div>
        
        {/* Badges Skeleton */}
        <div className="absolute top-spacing-3 left-spacing-3 flex flex-col gap-spacing-2">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        
        {/* Action Buttons Skeleton */}
        <div className="absolute top-spacing-3 right-spacing-3 flex space-x-spacing-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
      
      {/* Card Content Skeleton */}
      <CardContent className="p-spacing-4 flex-1 flex flex-col">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-spacing-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        
        {/* Title Section */}
        <div className="mb-spacing-2">
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-3/4" />
        </div>
        
        {/* Location Section */}
        <div className="flex items-center mb-spacing-3">
          <Skeleton className="h-4 w-4 mr-1 rounded" />
          <Skeleton className="h-4 w-48" />
        </div>
        
        {/* Property Features */}
        <div className="flex items-center justify-between mb-spacing-3">
          <div className="flex items-center space-x-spacing-3">
            <div className="flex items-center">
              <Skeleton className="h-4 w-4 mr-1 rounded" />
              <Skeleton className="h-4 w-6" />
            </div>
            <div className="flex items-center">
              <Skeleton className="h-4 w-4 mr-1 rounded" />
              <Skeleton className="h-4 w-6" />
            </div>
            <div className="flex items-center">
              <Skeleton className="h-4 w-4 mr-1 rounded" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>
        
        {/* Spacer */}
        <div className="flex-1"></div>
        
        {/* Price and Agent Section */}
        <div className="flex items-center justify-between mb-spacing-4">
          <Skeleton className="h-7 w-32" />
          <div className="text-right">
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        
        {/* Action Button */}
        <div className="pt-spacing-4 border-t border-gray-100">
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCardSkeleton;