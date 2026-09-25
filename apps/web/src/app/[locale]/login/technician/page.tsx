'use client';

import React from 'react';
import { PortalLoginForm } from '../../../../components/auth/PortalLoginForm';

export default function TechnicianLoginPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <PortalLoginForm
      locale={locale}
      portal="technician"
      role="TECHNICIAN"
      titleEn="Technician Portal"
      titleAr="بوابة الفنيين"
      subtitleEn="Field operations, jobs execution & live dispatch"
      subtitleAr="العمليات الميدانية وتنفيذ المهام وتحديثات المسار"
      demoEmail="tech@fixngo.ae"
      demoPassword="FixnGo2026!"
      targetPath="/tech"
    />
  );
}
