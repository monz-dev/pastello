import { redirect } from 'next/navigation';

/**
 * Root route — redirects straight to /home.
 * Guest mode (AuthProvider) handles anonymous access automatically.
 */
export default function Page() {
  redirect('/home');
}
