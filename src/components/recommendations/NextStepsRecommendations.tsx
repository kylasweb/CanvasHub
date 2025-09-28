'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Clock, Target, CheckCircle, Loader2, Lightbulb, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  category: 'development' | 'design' | 'testing' | 'deployment' | 'planning';
  dependencies: string[];
  resources: string[];
}

interface NextStepsRecommendationsProps {
  className?: string;
}

export default function NextStepsRecommendations({ className }: NextStepsRecommendationsProps) {
  const [context, setContext] = useState('');
  const [currentStep, setCurrentStep] = useState('');
  const [projectType, setProjectType] = useState('');
  const [userGoals, setUserGoals] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const generateRecommendations = async () => {
    if (!context.trim() || !currentStep.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both context and current step.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/recommendations/next-steps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: context.trim(),
          currentStep: currentStep.trim(),
          projectType: projectType.trim() || undefined,
          userGoals: userGoals.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
      
      toast({
        title: "Recommendations Generated",
        description: `Found ${data.recommendations?.length || 0} next steps for you.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCompleted = (stepId: string) => {
    const newCompletedSteps = new Set(completedSteps);
    if (newCompletedSteps.has(stepId)) {
      newCompletedSteps.delete(stepId);
    } else {
      newCompletedSteps.add(stepId);
    }
    setCompletedSteps(newCompletedSteps);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'development': return '💻';
      case 'design': return '🎨';
      case 'testing': return '🧪';
      case 'deployment': return '🚀';
      case 'planning': return '📋';
      default: return '📝';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Next Steps Recommendations
          </CardTitle>
          <CardDescription>
            Get AI-powered recommendations for your next project steps based on your current context and goals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="context">Current Context *</Label>
              <Textarea
                id="context"
                placeholder="Describe your current project situation, what you've accomplished so far..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentStep">Current Step *</Label>
              <Textarea
                id="currentStep"
                placeholder="What are you currently working on or stuck with?"
                value={currentStep}
                onChange={(e) => setCurrentStep(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectType">Project Type</Label>
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web-development">Web Development</SelectItem>
                  <SelectItem value="mobile-app">Mobile App</SelectItem>
                  <SelectItem value="design-project">Design Project</SelectItem>
                  <SelectItem value="data-analysis">Data Analysis</SelectItem>
                  <SelectItem value="marketing">Marketing Campaign</SelectItem>
                  <SelectItem value="research">Research Project</SelectItem>
                  <SelectItem value="business">Business Initiative</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="userGoals">Your Goals</Label>
              <Input
                id="userGoals"
                placeholder="What do you want to achieve?"
                value={userGoals}
                onChange={(e) => setUserGoals(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={generateRecommendations} 
            disabled={isLoading || !context.trim() || !currentStep.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Recommendations...
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                Generate Next Steps
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Recommended Next Steps
          </h3>
          
          <div className="grid gap-4">
            {recommendations.map((recommendation) => (
              <Card 
                key={recommendation.id} 
                className={`transition-all duration-200 ${
                  completedSteps.has(recommendation.id) 
                    ? 'bg-green-50 border-green-200' 
                    : 'hover:shadow-md'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCategoryIcon(recommendation.category)}</span>
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {recommendation.title}
                          {completedSteps.has(recommendation.id) && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getPriorityColor(recommendation.priority)}>
                            {recommendation.priority} priority
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {recommendation.estimatedTime}
                          </Badge>
                          <Badge variant="outline">
                            {recommendation.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant={completedSteps.has(recommendation.id) ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleCompleted(recommendation.id)}
                    >
                      {completedSteps.has(recommendation.id) ? "Undo" : "Complete"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {recommendation.description}
                  </p>
                  
                  {recommendation.dependencies.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Dependencies:</p>
                      <div className="flex flex-wrap gap-1">
                        {recommendation.dependencies.map((dep, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {recommendation.resources.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Helpful Resources:</p>
                      <div className="flex flex-wrap gap-1">
                        {recommendation.resources.map((resource, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {resource}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {recommendations.length === 0 && !isLoading && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Fill in the form above and click "Generate Next Steps" to get AI-powered recommendations for your project.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}