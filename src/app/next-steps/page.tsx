import PublicLayout from '@/components/layout/PublicLayout';
import NextStepsRecommendations from '@/components/recommendations/NextStepsRecommendations';

export default function NextStepsPage() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Next Steps Recommendations
            </h1>
            <p className="text-xl text-gray-600">
              Get AI-powered recommendations for your next project steps
            </p>
          </div>
          <NextStepsRecommendations />
        </div>
      </div>
    </PublicLayout>
  );
}