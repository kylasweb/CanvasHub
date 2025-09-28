"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  TrendingUp, 
  Zap,
  Camera,
  FileText,
  BarChart3,
  Calendar,
  CreditCard,
  MessageSquare,
  Shield,
  Globe,
  Smartphone,
  Database,
  Palette,
  Target,
  Award,
  Play,
  ChevronLeft,
  ChevronRight,
  Quote,
  Layout,
  Bot,
  Eye,
  FileBarChart,
  GitBranch,
  Clock
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const features = [
    {
      icon: Users,
      title: "Client Management",
      description: "Organize and manage your client relationships with advanced CRM tools, contact management, and communication tracking.",
      benefits: ["Client database", "Contact history", "Communication tracking", "Client segmentation"]
    },
    {
      icon: FileText,
      title: "Project Workflows",
      description: "Streamline your project management with intuitive workflows, task tracking, and team collaboration tools.",
      benefits: ["Task management", "Team collaboration", "Progress tracking", "Deadline management"]
    },
    {
      icon: Camera,
      title: "Photo Studio",
      description: "Professional photo management tools with editing capabilities, organization, and client delivery systems.",
      benefits: ["Photo editing", "Cloud storage", "Client galleries", "Batch processing"]
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Comprehensive business analytics with real-time reporting, performance metrics, and growth insights.",
      benefits: ["Real-time dashboards", "Revenue tracking", "Performance metrics", "Growth analytics"]
    },
    {
      icon: Calendar,
      title: "Scheduling & Events",
      description: "Manage your schedule, book appointments, and coordinate events with integrated calendar tools.",
      benefits: ["Calendar integration", "Appointment booking", "Event management", "Automated reminders"]
    },
    {
      icon: CreditCard,
      title: "Invoicing & Payments",
      description: "Create professional invoices, track payments, and manage your financial operations seamlessly.",
      benefits: ["Invoice generation", "Payment tracking", "Financial reports", "Tax management"]
    },
    {
      icon: Smartphone,
      title: "Virtual Visiting Cards",
      description: "Create and manage digital business cards with professional designs, QR codes, and sharing capabilities.",
      benefits: ["Digital business cards", "QR code generation", "Multiple themes", "Analytics tracking", "Easy sharing"]
    },
    {
      icon: Layout,
      title: "Web Designer",
      description: "Build stunning websites and landing pages with our intuitive drag-and-drop designer and professional templates.",
      benefits: ["Drag-and-drop builder", "Professional templates", "Responsive design", "SEO optimization", "Custom domains"]
    },
    {
      icon: Shield,
      title: "Smart Onboarding",
      description: "Get started quickly with our guided onboarding process that helps you set up your account and preferences step by step.",
      benefits: ["Step-by-step guidance", "Profile setup", "Preference configuration", "Email verification", "Progress tracking"]
    },
    {
      icon: Database,
      title: "KYC Verification",
      description: "Secure identity verification with multiple verification levels to ensure account security and compliance.",
      benefits: ["Multiple verification levels", "Document upload", "Secure processing", "Admin review", "Compliance ready"]
    },
    {
      icon: Bot,
      title: "AI Design Assistant",
      description: "Get intelligent AI-powered suggestions for website content, layout, color schemes, and SEO optimization to create stunning designs faster.",
      benefits: ["Content suggestions", "Layout optimization", "Color scheme recommendations", "SEO optimization", "Design best practices"]
    },
    {
      icon: GitBranch,
      title: "Real-time AI Collaboration",
      description: "Collaborate with your team in real-time with AI-powered suggestions, conflict resolution, and activity tracking for seamless teamwork.",
      benefits: ["Real-time collaboration", "AI suggestions", "Conflict resolution", "Activity tracking", "Team coordination"]
    },
    {
      icon: Eye,
      title: "AI Accessibility Optimization",
      description: "Ensure your designs are accessible to everyone with AI-powered WCAG 2.1 compliance analysis, color contrast optimization, and screen reader optimization.",
      benefits: ["WCAG 2.1 compliance", "Color contrast optimization", "Screen reader optimization", "Accessibility reports", "Inclusive design"]
    },
    {
      icon: FileBarChart,
      title: "AI Usage Reports & Analytics",
      description: "Get comprehensive insights into your AI usage patterns, cost optimization analysis, usage predictions, and ROI analytics to maximize efficiency.",
      benefits: ["Usage analytics", "Cost optimization", "Usage predictions", "ROI analysis", "Custom reports"]
    },
    {
      icon: Target,
      title: "AI A/B Testing",
      description: "Test design variations with AI-powered A/B testing, generate multiple variants, analyze results, and get predictive insights for optimal performance.",
      benefits: ["Variant generation", "Results analysis", "Performance prediction", "Test optimization", "Actionable insights"]
    },
    {
      icon: ArrowRight,
      title: "Next Steps Recommendations",
      description: "Get intelligent AI-powered recommendations for your next project steps based on your current context, goals, and progress to keep you moving forward efficiently.",
      benefits: ["Context-aware suggestions", "Priority-based recommendations", "Time estimates", "Dependency tracking", "Progress monitoring"]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Professional Photographer",
      company: "Sarah Johnson Photography",
      content: "Canvas Hub has completely transformed how I manage my photography business. The client management and photo delivery tools are incredible. I've saved countless hours and my clients love the professional experience.",
      rating: 5,
      avatar: "/avatars/sarah.jpg"
    },
    {
      name: "Michael Chen",
      role: "Creative Director",
      company: "Design Studio Pro",
      content: "As a creative agency, we needed a solution that could handle both client management and project workflows. Canvas Hub delivered beyond our expectations. The analytics help us make data-driven decisions.",
      rating: 5,
      avatar: "/avatars/michael.jpg"
    },
    {
      name: "Emily Rodriguez",
      role: "Freelance Designer",
      company: "Emily Creative",
      content: "The all-in-one nature of Canvas Hub is exactly what I needed as a freelancer. I can manage clients, projects, and finances in one place. It's like having a virtual assistant!",
      rating: 5,
      avatar: "/avatars/emily.jpg"
    },
    {
      name: "David Kim",
      role: "Web Design Agency Owner",
      company: "Pixel Perfect Studios",
      content: "The AI-powered features in Canvas Hub are game-changing! The AI Design Assistant helps us create stunning websites 70% faster, and the A/B testing tools have increased our client conversion rates by 45%. This is the future of creative business management.",
      rating: 5,
      avatar: "/avatars/david.jpg"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$29",
      period: "per month",
      description: "Perfect for freelancers and small teams",
      features: [
        "Up to 5 clients",
        "10 projects per month",
        "5GB photo storage",
        "Basic analytics",
        "Basic AI Design Assistant",
        "Email support",
        "Mobile app access"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Professional",
      price: "$79",
      period: "per month",
      description: "Ideal for growing businesses",
      features: [
        "Up to 50 clients",
        "Unlimited projects",
        "50GB photo storage",
        "Advanced analytics",
        "Full AI Design Assistant",
        "AI Collaboration Tools",
        "AI Accessibility Optimization",
        "Priority support",
        "Custom branding",
        "API access",
        "Team collaboration"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For large teams and agencies",
      features: [
        "Unlimited clients",
        "Unlimited projects",
        "Unlimited storage",
        "Complete AI Suite",
        "AI Usage Reports & Analytics",
        "AI A/B Testing Tools",
        "White-label solution",
        "Dedicated support",
        "Custom integrations",
        "Advanced security",
        "SLA guarantee",
        "Training & onboarding"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const stats = [
    { label: "Happy Customers", value: "10,000+", icon: Users },
    { label: "AI-Powered Designs", value: "100,000+", icon: Bot },
    { label: "Projects Completed", value: "50,000+", icon: Target },
    { label: "Revenue Processed", value: "$25M+", icon: TrendingUp }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="outline" className="mb-6 inline-flex">
              <Bot className="w-4 h-4 mr-2" />
              AI-Powered Business Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Your Creative
              <span className="text-primary block mt-2">Business with AI</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              The complete AI-powered business management platform for creative professionals. 
              Manage clients, projects, photos, finances, virtual visiting cards, web design, smart onboarding, KYC verification, and advanced AI tools in one intelligent dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button size="lg" className="text-lg px-10 py-4 h-14" onClick={() => router.push('/auth')}>
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-10 py-4 h-14">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600 mb-16">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                14-day free trial
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>

        {/* Hero Image/Graphic - Now properly positioned */}
        <div className="relative mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-gray-900">Client Management</h3>
                  <p className="text-gray-600 leading-relaxed">Organize and nurture client relationships with advanced CRM tools</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-gray-900">AI Design Assistant</h3>
                  <p className="text-gray-600 leading-relaxed">Get intelligent AI suggestions for stunning designs and content</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-gray-900">Photo Studio</h3>
                  <p className="text-gray-600 leading-relaxed">Professional photo management and editing capabilities</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                  <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-gray-900">Virtual Cards</h3>
                  <p className="text-gray-600 leading-relaxed">Create digital business cards with QR codes and analytics</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border border-pink-200">
                  <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Layout className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-gray-900">Web Designer</h3>
                  <p className="text-gray-600 leading-relaxed">Build stunning websites with drag-and-drop designer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed with AI
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful AI-driven features designed specifically for creative professionals and agencies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="w-12 h-12 text-primary mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Next Steps Recommendations Demo Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 inline-flex">
              <ArrowRight className="w-4 h-4 mr-2" />
              AI-Powered Guidance
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Never Wonder What's Next
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI analyzes your current progress and goals to provide intelligent, actionable next steps tailored specifically to your project.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Context-Aware Analysis</h3>
                </div>
                <p className="text-gray-600">
                  Our AI understands your current project context, what you've accomplished, and where you might be stuck to provide relevant recommendations.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Smart Prioritization</h3>
                </div>
                <p className="text-gray-600">
                  Get recommendations prioritized by importance and impact, with estimated time requirements and dependency tracking.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Progress Tracking</h3>
                </div>
                <p className="text-gray-600">
                  Mark steps as completed and track your progress. The AI adapts its recommendations based on your completed actions.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Try It Now</h3>
                <p className="text-gray-600 mb-4">
                  See how our AI can help you with your next steps:
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-900">High Priority</h4>
                    <Badge className="bg-blue-100 text-blue-800">30 minutes</Badge>
                  </div>
                  <p className="text-sm text-blue-700">
                    Set up your development environment and install necessary dependencies
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-yellow-900">Medium Priority</h4>
                    <Badge className="bg-yellow-100 text-yellow-800">2 hours</Badge>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Create wireframes for the main user interface components
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-900">Low Priority</h4>
                    <Badge className="bg-green-100 text-green-800">1 hour</Badge>
                  </div>
                  <p className="text-sm text-green-700">
                    Research competitor designs and gather inspiration
                  </p>
                </div>
              </div>

              <Button className="w-full mt-6" onClick={() => router.push('/next-steps')}>
                Get Your Personalized Recommendations
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Creative Professionals
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers have to say about their experience.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-2xl p-8 relative">
              <Quote className="w-12 h-12 text-primary/20 absolute top-8 left-8" />
              
              <div className="text-center mb-8">
                <p className="text-xl text-gray-700 italic mb-6">
                  {testimonials[activeTestimonial].content}
                </p>
                <div className="flex items-center justify-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < testimonials[activeTestimonial].rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonials[activeTestimonial].name}
                  </p>
                  <p className="text-gray-600">
                    {testimonials[activeTestimonial].role} at {testimonials[activeTestimonial].company}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTestimonial((activeTestimonial - 1 + testimonials.length) % testimonials.length)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex space-x-1">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === activeTestimonial ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTestimonial((activeTestimonial + 1) % testimonials.length)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the perfect plan for your business. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => router.push('/auth')}
                  >
                    {plan.cta}
                  </Button>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Need something custom? We offer enterprise solutions for large teams.
            </p>
            <Button variant="outline" size="lg">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of creative professionals who are already growing their business with Canvas Hub.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}