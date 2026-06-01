import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CreditCard, Check, Sparkles, Zap, Crown } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for trying out Forge AI',
    icon: Sparkles,
    color: 'border-gray-300 dark:border-gray-700',
    buttonClass: 'bg-gray-700 hover:bg-gray-600 text-white',
    features: [
      '5 AI generations / month',
      'Social media posts only',
      'Basic templates',
      'Community support',
    ],
    limits: [
      'No banner generation',
      'No email campaigns',
      'No priority support',
    ],
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'Best for growing businesses',
    icon: Zap,
    color: 'border-brand-500',
    popular: true,
    buttonClass: 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/25',
    features: [
      '100 AI generations / month',
      'All content types',
      'Banner generator',
      'Email campaign builder',
      'SEO content writer',
      'Content history',
      'Priority email support',
    ],
    limits: [],
  },
  {
    name: 'Enterprise',
    price: '$49',
    period: '/month',
    description: 'For teams & agencies',
    icon: Crown,
    color: 'border-purple-500',
    buttonClass: 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25',
    features: [
      'Unlimited AI generations',
      'All Pro features',
      'Team collaboration (5 seats)',
      'Custom brand voice training',
      'API access',
      'White-label exports',
      'Dedicated account manager',
      '24/7 priority support',
    ],
    limits: [],
  },
];

const Billing = () => {
  const { user } = useContext(AuthContext);
  const [selectedPlan, setSelectedPlan] = useState(user?.subscription || 'Free');

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing & Plans</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Manage your subscription and billing information.</p>
      </header>

      {/* Current Plan Badge */}
      <div className="bg-white dark:bg-brand-dark/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Plan</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {selectedPlan}
              {selectedPlan === 'Pro' && <Zap className="w-5 h-5 text-brand-500" />}
              {selectedPlan === 'Enterprise' && <Crown className="w-5 h-5 text-purple-500" />}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Credits Remaining</p>
            <p className="text-2xl font-bold text-brand-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {user?.credits || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = selectedPlan === plan.name;
          return (
            <div
              key={plan.name}
              className={`relative bg-white dark:bg-brand-dark/50 border ${plan.color} rounded-2xl p-6 transition-all hover:shadow-lg ${
                plan.popular ? 'ring-2 ring-brand-500/50' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6 pt-2">
                <Icon className={`w-8 h-8 mx-auto mb-3 ${
                  plan.name === 'Free' ? 'text-gray-600 dark:text-gray-400' :
                  plan.name === 'Pro' ? 'text-brand-500' :
                  'text-purple-500'
                }`} />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
                {plan.limits.map((l) => (
                  <li key={l} className="flex items-start gap-2 text-sm text-gray-500 line-through">
                    <Check className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" />
                    {l}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setSelectedPlan(plan.name)}
                disabled={isCurrent}
                className={`w-full py-3 rounded-xl font-medium transition-all ${
                  isCurrent
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-default'
                    : plan.buttonClass
                }`}
              >
                {isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment Info */}
      <div className="mt-10 bg-white dark:bg-brand-dark/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Payment Information</h3>
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-brand-darker rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="w-12 h-8 bg-gradient-to-r from-purple-500 to-purple-300 rounded-md flex items-center justify-center">
            <CreditCard className="w-5 h-3 text-gray-900 dark:text-white" />
          </div>
          <div className="flex-1">
            <p className="text-gray-900 dark:text-white text-sm font-medium">•••• •••• •••• 4242</p>
            <p className="text-gray-500 text-xs">Expires 12/2027</p>
          </div>
          <button className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
            Update
          </button>
        </div>
        <p className="text-gray-500 text-xs mt-4">
          Payment processing is handled securely via Stripe. Your card details are never stored on our servers.
        </p>
      </div>
    </div>
  );
};

export default Billing;
