"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Send, 
  X,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react'
import { toast } from 'sonner'

interface AIFeedbackCollectorProps {
  featureUsed: string
  suggestionId?: string
  aiUsageId?: string
  onFeedbackSubmit?: (feedback: any) => void
  trigger?: 'button' | 'inline' | 'auto'
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
}

interface FeedbackData {
  rating: number
  comment: string
  categories: string[]
  tags: string[]
}

const feedbackCategories = [
  { value: 'accuracy', label: 'Accuracy', icon: Target },
  { value: 'relevance', label: 'Relevance', icon: TrendingUp },
  { value: 'performance', label: 'Performance', icon: Zap },
  { value: 'usability', label: 'Usability', icon: CheckCircle },
  { value: 'creativity', label: 'Creativity', icon: Lightbulb }
]

const feedbackTags = [
  'helpful', 'not-helpful', 'too-generic', 'too-specific', 'slow', 'fast',
  'accurate', 'inaccurate', 'relevant', 'irrelevant', 'well-explained', 'confusing'
]

export default function AIFeedbackCollector({
  featureUsed,
  suggestionId,
  aiUsageId,
  onFeedbackSubmit,
  trigger = 'button',
  position = 'bottom-right'
}: AIFeedbackCollectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackData>({
    rating: 0,
    comment: '',
    categories: [],
    tags: []
  })

  const handleSubmit = async () => {
    if (feedback.rating === 0) {
      toast.error('Please provide a rating')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/v1/ai/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          featureUsed,
          rating: feedback.rating,
          comment: feedback.comment,
          suggestionId,
          aiUsageId,
          categories: feedback.categories,
          tags: feedback.tags
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      const result = await response.json()
      toast.success('Thank you for your feedback!')
      
      onFeedbackSubmit?.({
        ...feedback,
        featureUsed,
        suggestionId,
        aiUsageId
      })

      // Reset form
      setFeedback({
        rating: 0,
        comment: '',
        categories: [],
        tags: []
      })
      setIsOpen(false)

    } catch (error) {
      toast.error('Failed to submit feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRatingClick = (rating: number) => {
    setFeedback(prev => ({ ...prev, rating }))
  }

  const toggleCategory = (category: string) => {
    setFeedback(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }))
  }

  const toggleTag = (tag: string) => {
    setFeedback(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right': return 'top-4 right-4'
      case 'top-left': return 'top-4 left-4'
      case 'bottom-left': return 'bottom-4 left-4'
      case 'bottom-right': return 'bottom-4 right-4'
      default: return 'bottom-4 right-4'
    }
  }

  if (trigger === 'inline') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <MessageSquare className="w-5 h-5 mr-2" />
            How was this AI suggestion?
          </CardTitle>
          <CardDescription>
            Your feedback helps us improve our AI features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Rating */}
          <div>
            <Label>Rating</Label>
            <div className="flex space-x-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 cursor-pointer transition-colors ${
                    star <= feedback.rating
                      ? 'text-yellow-500 fill-current'
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                  onClick={() => handleRatingClick(star)}
                />
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <Label>What aspects should we improve?</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {feedbackCategories.map((category) => {
                const Icon = category.icon
                return (
                  <Badge
                    key={category.value}
                    variant={feedback.categories.includes(category.value) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleCategory(category.value)}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {category.label}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Quick tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {feedbackTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={feedback.tags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag.replace('-', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment">Additional comments (optional)</Label>
            <Textarea
              id="comment"
              placeholder="Tell us more about your experience..."
              value={feedback.comment}
              onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Submit */}
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || feedback.rating === 0}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            <Send className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger === 'auto' ? (
          <div className={`fixed ${getPositionClasses()} z-50`}>
            <Button
              variant="outline"
              size="sm"
              className="shadow-lg bg-white"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Rate AI
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            Give Feedback
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Rate this AI Suggestion
          </DialogTitle>
          <DialogDescription>
            Your feedback helps us improve our AI features for everyone
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Rating */}
          <div>
            <Label>How would you rate this suggestion?</Label>
            <div className="flex items-center justify-center space-x-2 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-10 h-10 cursor-pointer transition-colors ${
                    star <= feedback.rating
                      ? 'text-yellow-500 fill-current'
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                  onClick={() => handleRatingClick(star)}
                />
              ))}
            </div>
            <div className="text-center text-sm text-muted-foreground mt-1">
              {feedback.rating === 1 && 'Poor'}
              {feedback.rating === 2 && 'Fair'}
              {feedback.rating === 3 && 'Good'}
              {feedback.rating === 4 && 'Very Good'}
              {feedback.rating === 5 && 'Excellent'}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex justify-center space-x-4">
            <Button
              variant={feedback.rating >= 4 ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleRatingClick(4)}
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Helpful
            </Button>
            <Button
              variant={feedback.rating <= 2 ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => handleRatingClick(2)}
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Not Helpful
            </Button>
          </div>

          {/* Categories */}
          <div>
            <Label>What aspects should we improve?</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {feedbackCategories.map((category) => {
                const Icon = category.icon
                return (
                  <Badge
                    key={category.value}
                    variant={feedback.categories.includes(category.value) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleCategory(category.value)}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {category.label}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Quick tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {feedbackTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={feedback.tags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag.replace('-', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment">Additional comments (optional)</Label>
            <Textarea
              id="comment"
              placeholder="Tell us more about your experience..."
              value={feedback.comment}
              onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Submit */}
          <div className="flex space-x-2">
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || feedback.rating === 0}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              <Send className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}