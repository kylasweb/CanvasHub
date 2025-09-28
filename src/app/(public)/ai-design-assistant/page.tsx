"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Wand2, 
  Sparkles, 
  Zap, 
  Palette, 
  Layout, 
  FileText, 
  Search, 
  Image as ImageIcon,
  BarChart3,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  Lightbulb,
  Target,
  Rocket,
  Shield,
  Globe,
  Clock,
  TrendingUp,
  Award,
  Heart,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'

export default function AIPoweredDesignAssistantPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const features = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: "AI Content Generation",
      description: "Create compelling website copy, blog posts, and marketing content with advanced AI writing assistance.",
      benefits: ["Professional tone", "SEO optimized", "Multiple writing styles", "Brand voice consistency"]
    },
    {
      icon: <Layout className="w-8 h-8" />,
      title: "Smart Layout Suggestions",
      description: "Get intelligent layout recommendations based on your content and industry best practices.",
      benefits: ["Conversion-focused", "Mobile responsive", "Accessibility compliant", "Performance optimized"]
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Color Palette Generation",
      description: "Generate harmonious color schemes that match your brand and appeal to your target audience.",
      benefits: ["Brand consistency", "Psychology-based", "Accessibility compliant", "Trend-aware"]
    },
    {
      icon: <ImageIcon className="w-8 h-8" />,
      title: "Image Enhancement",
      description: "Enhance, edit, and optimize images with AI-powered tools for professional results.",
      benefits: ["Background removal", "Quality enhancement", "Style transfer", "Batch processing"]
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "SEO Optimization",
      description: "Get real-time SEO suggestions to improve your search engine rankings and visibility.",
      benefits: ["Keyword analysis", "Meta optimization", "Content scoring", "Competitor insights"]
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Performance Analytics",
      description: "Track and analyze your website's performance with AI-powered insights and recommendations.",
      benefits: ["Real-time monitoring", "Predictive analytics", "User behavior analysis", "Conversion tracking"]
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechCorp Inc.",
      content: "The AI Design Assistant has revolutionized our workflow. We've reduced content creation time by 60% while improving quality.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Web Designer",
      company: "Creative Studios",
      content: "The layout suggestions are incredibly intuitive. It's like having a senior designer looking over your shoulder 24/7.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Small Business Owner",
      company: "Boutique Shop",
      content: "As a non-technical user, I was able to create a professional website that rivals big competitors. The AI made it possible!",
      rating: 5
    }
  ]

  const stats = [
    { label: "Websites Created", value: "50,000+", icon: <Globe className="w-6 h-6" /> },
    { label: "AI Suggestions", value: "2M+", icon: <Lightbulb className="w-6 h-6" /> },
    { label: "Happy Users", value: "98%", icon: <Users className="w-6 h-6" /> },
    { label: "Time Saved", value: "70%", icon: <Clock className="w-6 h-6" /> }
  ]

  const pricingPlans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for individuals and small projects",
      features: [
        "50 AI content generations/month",
        "25 layout suggestions",
        "15 color palettes",
        "Basic SEO optimization",
        "Standard support"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Professional",
      price: "$79",
      period: "/month",
      description: "Ideal for growing businesses and agencies",
      features: [
        "Unlimited AI content generations",
        "Unlimited layout suggestions",
        "Unlimited color palettes",
        "Advanced SEO optimization",
        "Image enhancement (10/month)",
        "Priority support",
        "Analytics dashboard"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large teams and high-volume needs",
      features: [
        "Everything in Professional",
        "Custom AI models",
        "White-label options",
        "Dedicated support",
        "Advanced analytics",
        "API access",
        "Custom integrations"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Sparkles className="w-4 h-4 mr-2" />
              NEW FEATURE
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              AI-Powered Design Assistant
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Transform your website creation process with intelligent AI assistance. 
              Design, write, and optimize like a pro - even if you're just starting out.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                <Rocket className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2 text-blue-600">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful AI Features at Your Fingertips
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI assistant helps you every step of the way, from content creation to design optimization.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-12">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                          {feature.icon}
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {feature.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-8">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-3xl font-bold mb-6">How It Works</h3>
                  <div className="space-y-6">
                    <div className="flex space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Context Analysis</h4>
                        <p className="text-gray-600">Our AI analyzes your website content, industry, and target audience to understand your unique needs.</p>
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Intelligent Suggestions</h4>
                        <p className="text-gray-600">Get personalized recommendations for content, layout, colors, and SEO optimization.</p>
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Real-time Application</h4>
                        <p className="text-gray-600">Apply suggestions with a single click and see immediate improvements to your website.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8">
                  <div className="aspect-video bg-white rounded-lg shadow-lg flex items-center justify-center">
                    <div className="text-center">
                      <Wand2 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                      <p className="text-gray-600">AI Assistant Interface Preview</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="benefits" className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
                      Increased Productivity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Save up to 70% of time on website creation and content generation with AI-powered assistance.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Faster content creation</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Reduced design iterations</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Automated optimization</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-6 h-6 mr-2 text-blue-600" />
                      Better Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Achieve professional-quality results with AI-driven insights and industry best practices.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Higher conversion rates</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Improved SEO rankings</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Better user engagement</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Thousands of Users
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers have to say about their experience with our AI Design Assistant.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                    <div className="text-sm text-gray-500">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that best fits your needs. All plans include our core AI features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-blue-600 shadow-xl' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Website Creation Process?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of satisfied users who are already creating stunning websites with AI assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              <Rocket className="w-5 h-5 mr-2" />
              Start Your Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <MessageSquare className="w-5 h-5 mr-2" />
              Schedule a Demo
            </Button>
          </div>
          <p className="mt-4 text-blue-200">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  )
}