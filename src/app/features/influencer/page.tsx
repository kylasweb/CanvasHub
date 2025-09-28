import PublicLayout from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, DollarSign, Link, Shield, BarChart3 } from 'lucide-react';

export default function InfluencerFeaturePage() {
  const features = [
    {
      icon: Link,
      title: 'Unique Tracking Links',
      description: 'Generate custom tracking links for each influencer to monitor campaign performance accurately.'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Track clicks, sign-ups, and conversions with comprehensive analytics dashboard.'
    },
    {
      icon: DollarSign,
      title: 'Automated Payouts',
      description: 'Streamlined commission tracking and automated payout processing.'
    },
    {
      icon: Users,
      title: 'Influencer Management',
      description: 'Complete influencer profile management with status tracking and approval workflows.'
    },
    {
      icon: Shield,
      title: 'Fraud Protection',
      description: 'Advanced monitoring and fraud detection to protect your campaigns.'
    },
    {
      icon: TrendingUp,
      title: 'Performance Insights',
      description: 'Detailed reports and insights to optimize your influencer marketing strategy.'
    }
  ];

  const stats = [
    { label: 'Track Every Click', value: '100%', description: 'Real-time tracking accuracy' },
    { label: 'Commission Rates', value: 'Custom', description: 'Flexible commission structure' },
    { label: 'Payout Processing', value: 'Auto', description: 'Automated payment system' },
    { label: 'Fraud Detection', value: '24/7', description: 'Continuous monitoring' }
  ];

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        {/* Hero Section */}
        <section className="relative py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              New Feature
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Influencer Management Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Transform your marketing with powerful influencer management tools. Track performance, 
              manage relationships, and automate payouts all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                View Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <CardTitle className="text-3xl font-bold text-primary">{stat.value}</CardTitle>
                    <CardDescription>{stat.label}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{stat.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Comprehensive tools designed to streamline your influencer marketing campaigns 
                and maximize your ROI.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Grow Your Business?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of businesses already using our influencer management platform 
              to drive growth and increase revenue.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white hover:text-primary">
                Schedule a Demo
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}