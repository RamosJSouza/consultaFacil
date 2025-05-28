import { DashboardLayout } from './layout/DashboardLayout';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return <DashboardLayout>{children}</DashboardLayout>;
}; 