import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MobileStore } from '@/components/mobile/MobileStore'
import { DashboardPage } from '@/pages/pc/DashboardPage'
import { SignInPage } from '@/pages/pc/SignInPage'
import { SignUpPage } from '@/pages/pc/SignUpPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/pc/sign-in" element={<SignInPage />} />
        <Route path="/pc/sign-up" element={<SignUpPage />} />
        <Route path="/pc/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard" element={<Navigate to="/pc/dashboard" replace />} />
        <Route path="/mobile" element={<MobileStore />} />
        <Route path="/" element={<Navigate to="/mobile" replace />} />
        <Route path="*" element={<Navigate to="/mobile" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
