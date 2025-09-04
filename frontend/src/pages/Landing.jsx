import { ArrowRight, BarChart3, Bot, Clock, CreditCard, Database, Globe, Headphones, MessageSquare, Shield, Star, Users, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const Landing = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <Bot className="h-8 w-8" />,
      title: "AI-Powered Chatbots",
      description: "Deploy intelligent chatbots trained on your specific content and knowledge base",
      details: "Advanced natural language processing with context awareness"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Seamless Human Handoff",
      description: "Automatically transfer complex queries to human agents when needed",
      details: "Real-time agent dashboard with Socket.IO integration"
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: "Knowledge Base Integration",
      description: "Ground your AI responses with your own data and documents",
      details: "Smart embeddings and similarity search for accurate responses"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Multi-Tenant Security",
      description: "Enterprise-grade security with tenant isolation and API management",
      details: "JWT authentication, API keys, and usage tracking"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Advanced Analytics",
      description: "Track conversations, user satisfaction, and bot performance",
      details: "Real-time dashboards with actionable insights"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Embeddable Widget",
      description: "Deploy anywhere with our customizable chat widget",
      details: "Easy integration with any website or application"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "TechCorp Inc.",
      rating: 5,
      text: "Suh Tech's AI chatbot reduced our support tickets by 70% while improving customer satisfaction."
    },
    {
      name: "Michael Chen",
      company: "StartupXYZ",
      rating: 5,
      text: "The seamless handoff to human agents makes our customer service feel personal and efficient."
    },
    {
      name: "Emily Rodriguez",
      company: "E-commerce Plus",
      rating: 5,
      text: "Setup was incredibly easy, and the analytics help us understand our customers better."
    }
  ];

  const stats = [
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "500ms", label: "Average Response Time" },
    { number: "10k+", label: "Messages Processed Daily" },
    { number: "24/7", label: "Support Available" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-sm bg-white/80 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">Suh Tech</div>
                <div className="text-xs text-gray-500">Private Limited</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href="/login" className="text-gray-600 hover:text-gray-900 font-medium">Sign in</a>
              <a href="/signup" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
                Get Started Free
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5"></div>
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 ring-1 ring-inset ring-blue-600/20 mb-6">
                <Zap className="h-4 w-4 mr-2" />
                AI-Powered Customer Support Platform
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-tight">
                Transform Support Into Growth Engine
              </h1>
              <p className="mt-8 text-xl leading-relaxed text-gray-600 max-w-2xl">
                Deploy intelligent AI chatbots trained on your content with seamless human handoff.
                Reduce support costs by 70% while improving customer satisfaction.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <a href="/signup" className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="/demo" className="px-8 py-4 rounded-xl font-semibold text-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors shadow-md hover:shadow-lg">
                  Watch Demo
                </a>
              </div>
              <p className="mt-6 text-sm text-gray-500">
                <Clock className="inline h-4 w-4 mr-1" />
                5-minute setup • No credit card required • Free 14-day trial
              </p>
            </div>

            {/* Interactive Demo Card */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl p-8 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900">Live Demo</div>
                    <div className="text-sm text-gray-500">AI + Human Hybrid Support</div>
                  </div>
                  <div className="ml-auto flex gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="text-xs text-green-600 font-medium">Live</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {features.slice(0, 4).map((feature, index) => (
                    <div key={index} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      activeFeature === index ? 'bg-gradient-to-r from-blue-50 to-purple-50 shadow-md' : 'hover:bg-gray-50'
                    }`}>
                      <div className={`p-2 rounded-lg ${
                        activeFeature === index ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{feature.title}</div>
                        <div className="text-sm text-gray-600">{feature.details}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{stat.number}</div>
                <div className="text-gray-600 font-medium mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Scale Support</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform combines AI intelligence with human expertise to deliver exceptional customer experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white p-8 rounded-2xl border border-gray-200 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl w-fit group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
                  <div className="text-blue-600 group-hover:text-white transition-colors">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <p className="text-sm text-gray-500">{feature.details}</p>
                <div className="mt-6 flex items-center text-blue-600 font-medium group-hover:text-purple-600 transition-colors">
                  Learn more <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by Growing Companies</h2>
            <p className="text-xl text-gray-600">See how businesses are transforming their customer support</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-2xl border border-gray-200">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Features */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built for Enterprise Scale</h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Enterprise-grade architecture with multi-tenant security, real-time capabilities, and seamless integrations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <Shield className="h-8 w-8 text-blue-400 mb-4" />
              <h3 className="font-bold mb-2">Secure & Compliant</h3>
              <p className="text-sm text-blue-200">Multi-tenant isolation, API key management, JWT authentication</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <Zap className="h-8 w-8 text-purple-400 mb-4" />
              <h3 className="font-bold mb-2">Real-time Performance</h3>
              <p className="text-sm text-blue-200">Socket.IO powered live chat, sub-500ms response times</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <Database className="h-8 w-8 text-green-400 mb-4" />
              <h3 className="font-bold mb-2">Smart Knowledge Base</h3>
              <p className="text-sm text-blue-200">Vector embeddings, similarity search, context-aware responses</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <CreditCard className="h-8 w-8 text-yellow-400 mb-4" />
              <h3 className="font-bold mb-2">Stripe Integration</h3>
              <p className="text-sm text-blue-200">Subscription management, usage tracking, automated billing</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-6 text-center text-white">
          <h3 className="text-4xl font-bold mb-6">Ready to Transform Your Customer Support?</h3>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join hundreds of companies already using Suh Tech to provide exceptional customer experiences with AI-powered support.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <a href="/signup" className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center">
              Start Your Free Trial
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="/contact" className="px-8 py-4 rounded-xl font-semibold text-lg text-white border border-white/30 hover:bg-white/10 transition-colors">
              Talk to Sales
            </a>
          </div>
          <p className="mt-6 text-sm text-blue-200">
            <Headphones className="inline h-4 w-4 mr-1" />
            Need help? Our team is available 24/7 to assist you.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold">Suh Tech Private Limited</div>
                  <div className="text-sm text-gray-400">AI-Powered Customer Support</div>
                </div>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Transforming customer support with intelligent AI chatbots and seamless human handoff capabilities.
              </p>
              <div className="text-sm text-gray-500">
                © 2025 Suh Tech Private Limited. All rights reserved.
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-gray-400">
                <div>Features</div>
                <div>API Documentation</div>
                <div>Integrations</div>
                <div>Pricing</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-gray-400">
                <div>Help Center</div>
                <div>Contact Us</div>
                <div>Status Page</div>
                <div>Community</div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
