import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/star-rating";
import { CalendarDays, Shield, Briefcase } from "lucide-react";
import type { Review, User, Category } from "@shared/schema";

interface ReviewCardProps {
  review: Review & { 
    user: User;
    reviewerCategory?: Category;
  };
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
              <span className="text-lg font-semibold text-gray-600">
                {review.user.name.charAt(0)}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
              <div className="flex items-center text-sm text-gray-500">
                <CalendarDays className="w-3 h-3 mr-1" />
                {formatDate(review.createdAt)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex flex-col items-end gap-2 mb-2">
              {review.isVerified && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <Shield className="w-3 h-3 mr-1" />
                  Verificata
                </Badge>
              )}
              {review.reviewerRole === "professional" && review.reviewerCategory && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Briefcase className="w-3 h-3 mr-1" />
                  Recensione da {review.reviewerCategory.name}
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-end">
              <StarRating rating={review.rating} size="sm" />
            </div>
          </div>
        </div>
        
        <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
        <p className="text-gray-700 leading-relaxed">{review.content}</p>
      </CardContent>
    </Card>
  );
}
