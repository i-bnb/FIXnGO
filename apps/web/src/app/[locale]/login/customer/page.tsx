'use client';

import React from 'react';
import { PortalLoginForm } from '../../../../components/auth/PortalLoginForm';

export default function CustomerLoginPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <PortalLoginForm
      locale={locale}
      portal="customer"
      role="CUSTOMER"
      titleEn="Customer Portal"
      titleAr="بوابة العملاء"
      subtitleEn="Track services, approve quotes & view invoices"
      subtitleAr="متابعة الخدمات واعتماد العروض والفواتير"
      demoEmail="customer@fixngo.ae"
      demoPassword="FixnGo2026!"
      targetPath="/app"
    />
  );
}
