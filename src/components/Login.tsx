import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, ShieldCheck } from 'lucide-react';
import i18n from '../i18n';
import { Button, Input } from './ui-kit';

export const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || t('login.identity_error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col lg:flex-row text-primary font-sans" dir={i18n.dir()} role="main">

      {/* --- Visual Anchor --- */}
      <section className="lg:w-[45%] relative h-[40vh] lg:h-screen bg-surface-bg flex flex-col justify-center p-12 md:p-24 overflow-hidden border-r border-border-standard">
        <div className="relative z-20 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="text-[10px] font-bold tracking-[0.5em] uppercase text-primary/30">{t('login.subtitle')}</p>
            <h1 className="text-7xl md:text-9xl text-primary leading-[0.85] font-black lowercase tracking-tighter">
              {t('login.title').split('.')[0]}<span className="text-action">.</span>
            </h1>
          </motion.div>

          <div className="flex items-center gap-6 pt-12 border-t border-border-standard">
            <div className="w-12 h-12 rounded-full border border-border-standard flex items-center justify-center">
              <Compass className="text-action/40" size={20} />
            </div>
            <p className="text-xs font-light text-primary/40 leading-relaxed max-w-xs">
              {t('login.description')}
            </p>
          </div>
        </div>
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/[0.02] rotate-12 rounded-[4rem]"></div>
      </section>

      {/* --- Authentication Portal --- */}
      <section className="lg:w-[55%] flex flex-col justify-center p-8 md:p-32 bg-background">
        <div className="max-w-md w-full mx-auto space-y-20">
          <header className="space-y-4">
            <h2 className="text-5xl font-extrabold tracking-tighter lowercase">{t('login.verify')}</h2>
            <p className="text-[10px] text-primary/30 tracking-widest uppercase">{t('login.portal_label')}</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-12" aria-label="Identity Authentication">
            <div className="space-y-10">
              <Input
                label={t('login.email_label')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@foundry.com"
                required
                autoComplete="email"
              />
              <Input
                label={t('login.password_label')}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="p-4 bg-error/5 border border-error/10 text-[10px] font-bold uppercase tracking-widest text-error flex items-center gap-3" role="alert">
                <ShieldCheck size={14} />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full h-20"
              aria-label={t('login.submit')}
            >
              {isLoading ? t('login.verifying') : t('login.submit')}
              <ArrowRight size={16} className="ml-4" />
            </Button>
          </form>

          <footer className="pt-24 flex justify-between items-center opacity-20 text-[8px] font-mono tracking-widest">
            <span>FOUNDRY_SYS_V2.0</span>
            <span>{t('login.footer_authenticated')}</span>
          </footer>
        </div>
      </section>
    </main>
  );
};

export default Login;
