// src/Auth.jsx
import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from './supabaseClient';

export default function AuthPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-red-50">
      <div className="max-w-md w-full bg-white rounded-xl p-8 shadow-lg">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="light"
          providers={['email']} // Oder ['google'] wenn du willst
        />
      </div>
    </div>
  );
}
