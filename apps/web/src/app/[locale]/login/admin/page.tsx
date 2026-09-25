'use client';

import React from 'react';
import { PortalLoginForm } from '../../../../components/auth/PortalLoginForm';

export default function AdminLoginPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <PortalLoginForm
      locale={locale}
      portal="admin"
      role="SUPER_ADMIN"
      titleEn="Admin & Operations"
      titleAr="لوحة الإدارة والعمليات"
      subtitleEn="Comprehensive field operations & enterprise management"
      subtitleAr="إدارة العمليات والفرق الميدانية والمالية والأسطول"
      demoEmail="admin@fixngo.ae"
      demoPassword="FixnGo2026!"
      targetPath="/admin"
    />
  );
}
