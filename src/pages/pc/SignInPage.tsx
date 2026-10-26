import { Link, useNavigate } from 'react-router-dom';
import { SignIn } from '@/components/arc/blocks/sign-in/sign-in';
import styles from './AuthLayout.module.css';

export function SignInPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <SignIn
          demoCode="123456"
          onNavigateToSignUp={() => navigate('/pc/sign-up')}
          onNavigateToDashboard={() => navigate('/dashboard')}
          onSignIn={() => {
            // Callback opcional após autenticação
          }}
        />
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerText}>
          © 2026 Vira Tecnologia LTDA. Todos os direitos reservados.
        </p>
        <nav className={styles.footerNav} aria-label="Links institucionais">
          <Link to="/mobile" className={styles.footerLink}>Loja Demo</Link>
          <Link to="/dashboard" className={styles.footerLink}>Painel</Link>
          <span className={styles.footerLink}>Termos</span>
          <span className={styles.footerLink}>Privacidade</span>
        </nav>
      </footer>
    </div>
  );
}

export default SignInPage;
