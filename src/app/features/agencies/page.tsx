import PublicLayout from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Shield, 
  Star,
  CheckCircle,
  ArrowRight,
  Globe,
  Handshake,
  Briefcase,
  Users2,
  FileText,
  Calendar,
  Settings
} from 'lucide-react';

export default function AgencyFeaturePage() {
  const features = [
    {
      icon: Building2,
      title: 'Multi-Client Management',
      description: 'Create and manage multiple client profiles under your agency account with centralized control.'
    },
    {
      icon: Target,
      title: 'Campaign Tracking',
      description: 'Assign and track content campaigns for each client with detailed performance metrics.'
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Monitor content performance, engagement metrics, and audience reach in real-time.'
    },
    {
      icon: Users2,
      title: 'Team Collaboration',
      description: 'Collaborate with team members on shared projects within your agency account.'
    },
    {
      icon: Briefcase,
      title: 'Brand Management',
      description: 'Maintain consistent brand identity across all client campaigns and content.'
    },
    {
      icon: Settings,
      title: 'Custom Workflows',
      description: 'Create custom workflows and approval processes tailored to your agency needs.'
    }
  ];

  const stats = [
    { label: 'Client Management', value: 'Unlimited', description: 'Manage unlimited clients' },
    { label: 'Team Members', value: 'Scalable', description: 'Grow your team as needed' },
    { label: 'Campaign Tracking', value: 'Real-time', description: 'Live performance monitoring' },
    { label: 'Data Export', value: 'Complete', description: 'Full reporting capabilities' }
  ];

  const tiers = [
    {
      name: 'Basic',
      price: '$99',
      period: '/month',
      description: 'Perfect for small agencies getting started',
      features: [
        'Up to 5 clients',
        '3 team members',
        'Basic analytics',
        'Email support',
        'Standard templates'
      ],
      popular: false
    },
    {
      name: 'Pro',
      price: '$299',
      period: '/month',
      description: 'Ideal for growing agencies with multiple clients',
      features: [
        'Up to 25 clients',
        '10 team members',
        'Advanced analytics',
        'Priority support',
        'Custom templates',
        'API access',
        'White-label options'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large agencies with complex needs',
      features: [
        'Unlimited clients',
        'Unlimited team members',
        'Enterprise analytics',
        '24/7 dedicated support',
        'Fully customizable',
        'Advanced API',
        'Custom integrations',
        'Dedicated account manager'
      ],
      popular: false
    }
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
              Media Agency Management
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Empower your media agency with powerful tools to manage multiple clients, 
              track campaigns, and collaborate seamlessly with your team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Schedule a Demo
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
                Everything Your Agency Needs
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Comprehensive tools designed specifically for media agencies to streamline 
                operations and maximize client success.
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

        {/* Pricing Section */}
        <section className="py-20 px-4 bg-muted/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Choose Your Plan
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Flexible pricing plans designed to grow with your agency. 
                Upgrade or downgrade at any time.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {tiers.map((tier, index) => (
                <Card key={index} className={`relative ${tier.popular ? 'border-primary shadow-lg' : ''}`}>
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        <Star className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      <span className="text-muted-foreground">{tier.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full ${tier.popular ? 'bg-primary' : 'variant-outline'}`}
                      size="lg"
                    >
                      Get Started
                    </Button>
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
              Ready to Transform Your Agency?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join hundreds of media agencies already using our platform to streamline 
              their operations and deliver exceptional results for their clients.
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