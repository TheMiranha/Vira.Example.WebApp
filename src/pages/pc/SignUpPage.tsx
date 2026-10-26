import { Link, useNavigate } from 'react-router-dom';
import { SignupForm } from '@/components/arc/blocks/signup-form/signup-form';
import styles from './AuthLayout.module.css';

export function SignUpPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <SignupForm
          onNavigateToSignIn={() => navigate('/pc/sign-in')}
          onNavigateToDashboard={() => navigate('/dashboard')}
          onSubmit={async (details) => {
            // Simulação de cadastro
            console.log('Criador cadastrado:', details.email);
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

export default SignUpPage;
