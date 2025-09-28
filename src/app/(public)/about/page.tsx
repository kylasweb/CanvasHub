import PublicLayout from '@/components/layout/PublicLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  Camera, 
  BarChart3, 
  Calendar, 
  CreditCard,
  Shield,
  Globe,
  Zap,
  Star,
  ArrowRight
} from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: Users,
      title: "Client Management",
      description: "Advanced CRM tools for managing client relationships and communications."
    },
    {
      icon: FileText,
      title: "Project Workflows",
      description: "Streamline project management with intuitive workflows and collaboration tools."
    },
    {
      icon: Camera,
      title: "Photo Studio",
      description: "Professional photo management with editing and client delivery systems."
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Comprehensive business analytics and real-time performance insights."
    },
    {
      icon: Calendar,
      title: "Scheduling",
      description: "Integrated calendar and appointment booking system."
    },
    {
      icon: CreditCard,
      title: "Invoicing",
      description: "Professional invoicing and payment tracking for financial management."
    }
  ];

  return (
    <PublicLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge variant="outline" className="mb-4">
              <Zap className="w-4 h-4 mr-2" />
              About Canvas Hub
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Empowering Creative
              <span className="text-primary block">Professionals</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              We built Canvas Hub to solve the unique challenges faced by photographers, 
              designers, and creative agencies. Our mission is to provide the tools you need 
              to focus on what you do best - creating amazing work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg">
                Contact Us
              </Button>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Canvas Hub was founded by creative professionals who understood the pain points 
                  of managing a creative business. We spent years dealing with scattered tools, 
                  inefficient workflows, and the constant struggle to balance creative work 
                  with business management.
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  Our mission is simple: to provide an all-in-one platform that empowers creatives 
                  to focus on their passion while seamlessly managing their business operations. 
                  We believe that great art deserves great business tools.
                </p>
                <div className="flex items-center space-x-8 text-sm">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="font-medium">10,000+ Happy Customers</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="font-medium">50+ Countries</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-green-500 mr-1" />
                    <span className="font-medium">99.9% Uptime</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8">
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary mb-2">2018</div>
                  <p className="text-lg text-gray-700">Founded</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">50+</div>
                    <p className="text-sm text-gray-600">Team Members</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">24/7</div>
                    <p className="text-sm text-gray-600">Support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Overview */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose Canvas Hub?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We combine powerful features with intuitive design to create the perfect 
                business management solution for creative professionals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <feature.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Values
              </h2>
              <p className="text-xl text-gray-600">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Customer First</h3>
                <p className="text-gray-600">
                  We build our product with your success in mind. Your feedback drives our innovation.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Innovation</h3>
                <p className="text-gray-600">
                  We constantly push boundaries to bring you cutting-edge features and improvements.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Trust & Security</h3>
                <p className="text-gray-600">
                  Your data is safe with us. We prioritize security and transparency above all else.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Transform Your Creative Business?
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
    </PublicLayout>
  );
}