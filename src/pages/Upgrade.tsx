import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

const Upgrade = () => {
  const { profile } = useAuth();

  const handleUpgrade = (plan: string) => {
    toast.info(`Upgrading to ${plan}. Payment integration coming soon!`);
  };

  const plans = [
    {
      name: 'Free Plan',
      price: 'FREE',
      period: '',
      features: [
        { text: '5 prompts per day', included: true },
        { text: 'Basic templates', included: true },
        { text: 'Community support', included: true },
        { text: 'No premium features', included: false }
      ],
      buttonText: profile?.plan_type === 'free' ? 'Current Plan' : 'Downgrade',
      disabled: profile?.plan_type === 'free',
      animation: 'animate-pulse',
      planType: 'free'
    },
    {
      name: 'Pro Monthly',
      price: '₹199',
      period: '/month',
      features: [
        { text: '100+ prompts per day', included: true },
        { text: 'All premium templates', included: true },
        { text: 'Priority support', included: true },
        { text: 'Advanced AI features', included: true }
      ],
      buttonText: profile?.plan_type === 'pro_monthly' ? 'Current Plan' : 'Upgrade Now',
      disabled: profile?.plan_type === 'pro_monthly',
      animation: 'hover:scale-105 transition-transform duration-300',
      highlight: true,
      planType: 'pro_monthly'
    },
    {
      name: 'Pro Yearly',
      price: '₹499',
      period: '/year',
      features: [
        { text: 'Unlimited prompts', included: true },
        { text: 'All premium features', included: true },
        { text: '24/7 priority support', included: true },
        { text: 'Early access to new features', included: true }
      ],
      buttonText: profile?.plan_type === 'pro_yearly' ? 'Current Plan' : 'Upgrade Now',
      disabled: profile?.plan_type === 'pro_yearly',
      animation: 'hover:-translate-y-2 transition-all duration-300',
      planType: 'pro_yearly'
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            Upgrade Your{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Plan
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your needs and unlock unlimited possibilities
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`glass-card rounded-2xl p-8 border ${
                plan.highlight
                  ? 'border-primary/50 shadow-lg shadow-primary/20'
                  : 'border-primary/20'
              } ${plan.animation}`}
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              {plan.highlight && (
                <div className="bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold py-1 px-4 rounded-full mb-4 text-center">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    )}
                    <span className={feature.included ? '' : 'text-muted-foreground'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full font-semibold ${
                  plan.highlight
                    ? 'gradient-primary btn-glow text-white'
                    : 'border border-primary/30'
                }`}
                variant={plan.highlight ? 'default' : 'outline'}
                disabled={plan.disabled}
                onClick={() => handleUpgrade(plan.planType)}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Upgrade;
